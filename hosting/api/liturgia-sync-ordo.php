<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/includes/liturgia/OrdoColombianoProvider.php';

lvj_require_method('POST');

function lvj_liturgia_sync_require_key(): void
{
  $expected = trim((string) lvj_setting('ORDO_COLOMBIANO_SYNC_KEY', ''));
  if ($expected === '') {
    lvj_json_response([
      'success' => false,
      'message' => 'La sincronización del Ordo no está habilitada en el servidor.',
    ], 503);
  }

  $provided = trim((string) ($_SERVER['HTTP_X_LVJ_SYNC_KEY'] ?? ''));
  if ($provided === '' || !hash_equals($expected, $provided)) {
    lvj_json_response([
      'success' => false,
      'message' => 'No autorizado.',
    ], 401);
  }
}

/** @return array<string,bool> */
function lvj_liturgia_sync_columns(PDO $pdo): array
{
  $statement = $pdo->query('SHOW COLUMNS FROM lvj_lit_lectura_dia');
  $columns = [];
  foreach ($statement->fetchAll() as $row) {
    $field = trim((string) ($row['Field'] ?? ''));
    if ($field !== '') {
      $columns[$field] = true;
    }
  }
  return $columns;
}

/** @param array<string,mixed> $payload */
function lvj_liturgia_sync_filter_payload(array $payload, array $columns): array
{
  $allowed = [
    'fecha',
    'tiempo_liturgico',
    'celebracion',
    'color_liturgico',
    'grado_celebracion',
    'primera_lectura_cita',
    'primera_lectura_texto',
    'salmo_cita',
    'salmo_respuesta',
    'salmo_texto',
    'segunda_lectura_cita',
    'segunda_lectura_texto',
    'evangelio_cita',
    'evangelio_texto',
    'fuente',
  ];

  $filtered = [];
  foreach ($allowed as $field) {
    if (isset($columns[$field]) && array_key_exists($field, $payload)) {
      $filtered[$field] = is_scalar($payload[$field]) ? (string) $payload[$field] : '';
    }
  }

  return $filtered;
}

/** @param array<string,mixed> $data */
function lvj_liturgia_sync_upsert(PDO $pdo, array $data, array $columns): array
{
  if (!isset($columns['fecha'])) {
    throw new RuntimeException('lvj_lit_lectura_dia no contiene la columna fecha.');
  }

  $date = trim((string) ($data['fecha'] ?? ''));
  if ($date === '') {
    throw new RuntimeException('No se recibió fecha para sincronizar.');
  }

  $existing = lvj_optional_first(
    $pdo,
    'SELECT * FROM lvj_lit_lectura_dia WHERE fecha = ? ORDER BY id ASC LIMIT 1',
    [$date],
  );

  $filtered = lvj_liturgia_sync_filter_payload($data, $columns);
  unset($filtered['fecha']);

  if ($existing) {
    // Actualiza únicamente campos litúrgicos/lecturas recibidos desde el Ordo.
    // No toca reflexión, oración, imágenes, audio, tema, santo ni demás contenido editorial LVJ.
    $sets = [];
    $params = [];
    foreach ($filtered as $field => $value) {
      $sets[] = "`{$field}` = ?";
      $params[] = $value;
    }

    if (!$sets) {
      return ['action' => 'unchanged', 'id' => (string) ($existing['id'] ?? '')];
    }

    $params[] = $date;
    $statement = $pdo->prepare(
      'UPDATE lvj_lit_lectura_dia SET ' . implode(', ', $sets) . ' WHERE fecha = ?'
    );
    $statement->execute($params);

    return ['action' => 'updated', 'id' => (string) ($existing['id'] ?? '')];
  }

  $insert = ['fecha' => $date] + $filtered;
  if (isset($columns['estado']) && !array_key_exists('estado', $insert)) {
    $insert['estado'] = 'publicado';
  }

  $fields = array_keys($insert);
  $placeholders = array_fill(0, count($fields), '?');
  $statement = $pdo->prepare(
    'INSERT INTO lvj_lit_lectura_dia (`' . implode('`,`', $fields) . '`) VALUES (' . implode(',', $placeholders) . ')'
  );
  $statement->execute(array_values($insert));

  return ['action' => 'inserted', 'id' => (string) $pdo->lastInsertId()];
}

try {
  lvj_liturgia_sync_require_key();
  $input = lvj_json_input();
  $date = substr(trim((string) ($input['fecha'] ?? date('Y-m-d'))), 0, 10);
  if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) !== 1) {
    lvj_json_response(['success' => false, 'message' => 'Fecha inválida.'], 422);
  }

  $provider = new OrdoColombianoProvider();
  $payload = $provider->fetchDate($date);

  $pdo = lvj_db();
  $columns = lvj_liturgia_sync_columns($pdo);
  $result = lvj_liturgia_sync_upsert($pdo, $payload, $columns);

  lvj_json_response([
    'success' => true,
    'fecha' => $date,
    'provider' => 'Ordo Colombiano',
    'action' => $result['action'],
    'id' => $result['id'],
  ]);
} catch (Throwable $error) {
  error_log('LVJ liturgia Ordo sync: ' . $error->getMessage());
  lvj_json_response([
    'success' => false,
    'message' => 'No fue posible sincronizar la Lectura del Día desde Ordo Colombiano.',
    'detail' => $error->getMessage(),
  ], 502);
}
