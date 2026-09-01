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
    'lectura_base_id',
    'ciclo_dominical',
    'ciclo_ferial',
    'clave_liturgica',
    'hash_contenido',
    'tiempo_id',
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

function lvj_liturgia_sync_time_key(string $value): string
{
  $value = mb_strtoupper(trim($value), 'UTF-8');
  $value = strtr($value, [
    'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ü' => 'U', 'Ñ' => 'N',
  ]);

  foreach (['ADVIENTO', 'NAVIDAD', 'CUARESMA', 'PASCUA', 'ORDINARIO'] as $key) {
    if (str_contains($value, $key)) return $key;
  }

  return preg_replace('/[^A-Z0-9]+/', '', $value) ?? '';
}

function lvj_liturgia_sync_resolve_time_id(PDO $pdo, string $ordoTime): ?string
{
  $sourceKey = lvj_liturgia_sync_time_key($ordoTime);
  if ($sourceKey === '') return null;

  try {
    $rows = $pdo->query('SELECT * FROM lvj_lit_tiempos ORDER BY id ASC')->fetchAll();
  } catch (Throwable $error) {
    return null;
  }

  foreach ($rows as $row) {
    $catalogName = trim((string) ($row['nombre'] ?? $row['tiempo'] ?? ''));
    if ($catalogName !== '' && lvj_liturgia_sync_time_key($catalogName) === $sourceKey) {
      return trim((string) ($row['id'] ?? '')) ?: null;
    }
  }

  return null;
}
function lvj_liturgia_sync_store_base(PDO $pdo, array $payload): ?string
{
  try {
    if (!(bool) $pdo->query("SHOW TABLES LIKE 'lvj_lit_lecturas_base'")->fetchColumn()) return null;
  } catch (Throwable $error) { return null; }
  $fields = ['clave_liturgica','hash_contenido','pais','rito','ciclo_dominical','ciclo_ferial','tiempo_liturgico','celebracion','grado_celebracion','color_liturgico','primera_lectura_cita','primera_lectura_texto','salmo_cita','salmo_respuesta','salmo_texto','segunda_lectura_cita','segunda_lectura_texto','evangelio_cita','evangelio_texto','fuente'];
  $base = [];
  foreach ($fields as $field) $base[$field] = $payload[$field] ?? null;
  if (trim((string) $base['clave_liturgica']) === '' || trim((string) $base['hash_contenido']) === '') return null;
  $find = $pdo->prepare('SELECT id FROM lvj_lit_lecturas_base WHERE clave_liturgica = ? AND hash_contenido = ? LIMIT 1');
  $find->execute([$base['clave_liturgica'], $base['hash_contenido']]);
  $id = trim((string) $find->fetchColumn());
  if ($id !== '') return $id;
  $names = array_keys($base);
  $statement = $pdo->prepare('INSERT INTO lvj_lit_lecturas_base (`' . implode('`,`', $names) . '`) VALUES (' . implode(',', array_fill(0, count($names), '?')) . ')');
  $statement->execute(array_values($base));
  return (string) $pdo->lastInsertId();
}
function lvj_liturgia_sync_draft_value(array $columns): mixed
{
  $type = strtolower((string) ($columns['estado']['Type'] ?? ''));
  return str_contains($type, 'int') || str_contains($type, 'bit')
    ? 0
    : 'borrador';
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

  $ownsTransaction = !$pdo->inTransaction();

  try {
    if ($ownsTransaction) {
      $pdo->beginTransaction();
    }

    $existing = lvj_optional_first(
      $pdo,
      'SELECT * FROM lvj_lit_lectura_dia WHERE fecha = ? ORDER BY id ASC LIMIT 1 FOR UPDATE',
      [$date],
    );

    $filtered = lvj_liturgia_sync_filter_payload($data, $columns);
    unset($filtered['fecha']);

    if ($existing) {
      // Solo se envía a revisión cuando Ordo trae un cambio real.
      // Si no cambió nada, conserva el estado publicado/borrador existente.
      $changes = [];
      foreach ($filtered as $field => $value) {
        if ((string) ($existing[$field] ?? '') !== (string) $value) {
          $changes[$field] = $value;
        }
      }

      if (!$changes) {
        $result = [
          'action' => 'unchanged',
          'id' => (string) ($existing['id'] ?? ''),
          'requires_review' => false,
        ];
      } else {
        $sets = [];
        $params = [];
        foreach ($changes as $field => $value) {
          $sets[] = "`{$field}` = ?";
          $params[] = $value;
        }

        if (isset($columns['estado'])) {
          $sets[] = '`estado` = ?';
          $params[] = lvj_liturgia_sync_draft_value($columns);
        }
        if (isset($columns['updated_at'])) {
          $sets[] = 'updated_at = NOW()';
        }

        $params[] = $date;
        $statement = $pdo->prepare(
          'UPDATE lvj_lit_lectura_dia SET ' . implode(', ', $sets) . ' WHERE fecha = ?'
        );
        $statement->execute($params);

        $result = [
          'action' => 'updated_for_review',
          'id' => (string) ($existing['id'] ?? ''),
          'requires_review' => true,
          'changed_fields' => array_keys($changes),
        ];
      }
    } else {
      $insert = ['fecha' => $date] + $filtered;
      if (isset($columns['estado']) && !array_key_exists('estado', $insert)) {
        $insert['estado'] = lvj_liturgia_sync_draft_value($columns);
      }

      $fields = array_keys($insert);
      $placeholders = array_fill(0, count($fields), '?');
      $statement = $pdo->prepare(
        'INSERT INTO lvj_lit_lectura_dia (`' . implode('`,`', $fields) . '`) VALUES (' . implode(',', $placeholders) . ')'
      );
      $statement->execute(array_values($insert));

      $result = [
        'action' => 'inserted_for_review',
        'id' => (string) $pdo->lastInsertId(),
        'requires_review' => true,
      ];
    }

    if ($ownsTransaction) {
      $pdo->commit();
    }

    return $result;
  } catch (Throwable $error) {
    if ($ownsTransaction && $pdo->inTransaction()) {
      $pdo->rollBack();
    }
    throw $error;
  }
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
  if (isset($columns['tiempo_id'])) {
    $timeId = lvj_liturgia_sync_resolve_time_id(
      $pdo,
      trim((string) ($payload['tiempo_liturgico'] ?? '')),
    );
    if ($timeId !== null) $payload['tiempo_id'] = $timeId;
  }
  $baseId = lvj_liturgia_sync_store_base($pdo, $payload);
  if ($baseId !== null && isset($columns['lectura_base_id'])) $payload['lectura_base_id'] = $baseId;
  $result = lvj_liturgia_sync_upsert($pdo, $payload, $columns);
  $result['lectura_base_id'] = $baseId;

  // La sincronización litúrgica es independiente de las generaciones editoriales.
  // Lectio y Santoral también permanecen en borrador hasta revisión humana.
  $lectioResult = ['status' => 'not_attempted'];
  try {
    $lectioLibrary = new LectioLibraryService($pdo);
    $lectioResult = $lectioLibrary->ensureForLiturgia($payload);
  } catch (Throwable $lectioError) {
    error_log('LVJ Lectio generation: ' . $lectioError->getMessage());
    $lectioResult = [
      'status' => 'error',
      'message' => 'No fue posible preparar la Lectio Divina.',
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
      'message' => 'No fue posible preparar el Santo del Día.',
    ];
  }

  lvj_json_response([
    'success' => true,
    'fecha' => $date,
    'provider' => 'Ordo Colombiano',
    'liturgia' => [
      'action' => $result['action'],
      'id' => $result['id'],
      'requires_review' => (bool) ($result['requires_review'] ?? false),
      'changed_fields' => $result['changed_fields'] ?? [],
    ],
    'lectio' => $lectioResult,
    'santoral' => $santoralResult,
  ]);
} catch (Throwable $error) {
  error_log('LVJ liturgia Ordo sync: ' . $error->getMessage());
  lvj_json_response([
    'success' => false,
    'message' => 'No fue posible sincronizar la Lectura del Día desde Ordo Colombiano.',
  ], 502);
}
