<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/includes/liturgia/OrdoColombianoProvider.php';
require __DIR__ . '/includes/liturgia/LectioLibraryService.php';
require __DIR__ . '/includes/santoral/SantoralLibraryService.php';

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

/** @return array<string,array<string,mixed>> */
function lvj_liturgia_sync_columns(PDO $pdo): array
{
  $statement = $pdo->query('SHOW COLUMNS FROM lvj_lit_lectura_dia');
  $columns = [];
  foreach ($statement->fetchAll() as $row) {
    $field = trim((string) ($row['Field'] ?? ''));
    if ($field !== '') {
      $columns[$field] = $row;
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
    // Solo actualiza datos litúrgicos/lecturas recibidos desde Ordo.
    // No toca reflexión, oración, imágenes, audio, tema, santo ni contenido editorial LVJ.
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
    $estadoType = strtolower((string) ($columns['estado']['Type'] ?? ''));
    $insert['estado'] = str_contains($estadoType, 'int') || str_contains($estadoType, 'bit')
      ? 1
      : 'publicado';
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

  // La Liturgia es independiente de la IA. Si una generación editorial falla,
  // la lectura del día permanece sincronizada y el error se informa por separado.
  $lectioResult = ['status' => 'not_attempted'];
  try {
    $lectioLibrary = new LectioLibraryService($pdo);
    $lectioResult = $lectioLibrary->ensureForLiturgia($payload);
  } catch (Throwable $lectioError) {
    error_log('LVJ Lectio generation: ' . $lectioError->getMessage());
    $lectioResult = [
      'status' => 'error',
      'message' => $lectioError->getMessage(),
    ];
  }

  $santoralResult = ['status' => 'not_attempted'];
  try {
    $santoralLibrary = new SantoralLibraryService($pdo);
    $santoralResult = $santoralLibrary->ensureForOrdo(
      is_array($payload['santos_ordo'] ?? null) ? $payload['santos_ordo'] : [],
      [
        'fecha' => $date,
        'preludio' => (string) ($payload['preludio_ordo'] ?? ''),
        'celebracion' => (string) ($payload['celebracion'] ?? ''),
        'tiempo_liturgico' => (string) ($payload['tiempo_liturgico'] ?? ''),
      ],
    );
  } catch (Throwable $santoralError) {
    error_log('LVJ Santoral generation: ' . $santoralError->getMessage());
    $santoralResult = [
      'status' => 'error',
      'message' => $santoralError->getMessage(),
    ];
  }

  lvj_json_response([
    'success' => true,
    'fecha' => $date,
    'provider' => 'Ordo Colombiano',
    'liturgia' => [
      'action' => $result['action'],
      'id' => $result['id'],
    ],
    'lectio' => $lectioResult,
    'santoral' => $santoralResult,
  ]);
} catch (Throwable $error) {
  error_log('LVJ liturgia Ordo sync: ' . $error->getMessage());
  lvj_json_response([
    'success' => false,
    'message' => 'No fue posible sincronizar la Lectura del Día desde Ordo Colombiano.',
    'detail' => $error->getMessage(),
  ], 502);
}
