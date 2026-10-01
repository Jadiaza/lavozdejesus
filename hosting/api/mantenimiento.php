<?php

declare(strict_types=1);

define('LVJ_FORCE_NO_STORE', true);
require __DIR__ . '/bootstrap.php';

try {
  $pdo = lvj_db();

  $base = lvj_first(
    $pdo,
    "SELECT
      e.id AS emisora_id,
      COALESCE(app.modo_mantenimiento, 0) AS modo_mantenimiento_global
    FROM lvj_cfg_emisora e
    LEFT JOIN lvj_cfg_app app
      ON app.emisora_id = e.id AND app.estado = 1
    WHERE e.estado = 1
    ORDER BY e.id ASC
    LIMIT 1",
  );

  if (!$base) {
    lvj_json_response(['error' => 'CONFIG_NOT_FOUND'], 404);
  }

  $emisoraId = (int) $base['emisora_id'];
  $globalMaintenance = lvj_bool($base['modo_mantenimiento_global'] ?? null, false);

  $module = isset($_GET['modulo']) ? trim((string) $_GET['modulo']) : '';

  if ($module !== '') {
    $row = lvj_optional_first(
      $pdo,
      'SELECT modulo, modo_mantenimiento, mensaje_mantenimiento
       FROM lvj_cfg_modulos
       WHERE emisora_id = :emisora_id AND modulo = :modulo
       LIMIT 1',
      [
        'emisora_id' => $emisoraId,
        'modulo' => $module,
      ],
    );

    if (!$row) {
      lvj_json_response([
        'error' => 'MODULE_NOT_FOUND',
        'emisora_id' => (string) $emisoraId,
        'modulo' => $module,
      ], 404);
    }

    $moduleMaintenance = lvj_bool($row['modo_mantenimiento'] ?? null, false);

    lvj_json_response([
      'ok' => true,
      'emisora_id' => (string) $emisoraId,
      'modulo' => lvj_text($row, 'modulo'),
      'modo_mantenimiento_global' => $globalMaintenance,
      'modo_mantenimiento' => $moduleMaintenance,
      'mantenimiento_activo' => $globalMaintenance || $moduleMaintenance,
      'mensaje_mantenimiento' => $globalMaintenance
        ? 'La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
        : ($moduleMaintenance
          ? lvj_text($row, 'mensaje_mantenimiento')
          : ''),
    ]);
  }

  $rows = lvj_optional_rows(
    $pdo,
    'SELECT modulo, modo_mantenimiento, mensaje_mantenimiento
     FROM lvj_cfg_modulos
     WHERE emisora_id = :emisora_id
     ORDER BY modulo ASC',
    ['emisora_id' => $emisoraId],
  );

  $modules = [];
  foreach ($rows as $row) {
    $moduleMaintenance = lvj_bool($row['modo_mantenimiento'] ?? null, false);

    $modules[lvj_text($row, 'modulo')] = [
      'modo_mantenimiento' => $moduleMaintenance,
      'mantenimiento_activo' => $globalMaintenance || $moduleMaintenance,
      'mensaje_mantenimiento' => $globalMaintenance
        ? 'La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
        : ($moduleMaintenance ? lvj_text($row, 'mensaje_mantenimiento') : ''),
    ];
  }

  lvj_json_response([
    'ok' => true,
    'emisora_id' => (string) $emisoraId,
    'modo_mantenimiento_global' => $globalMaintenance,
    'modulos' => $modules,
  ]);
} catch (Throwable $error) {
  lvj_json_response([
    'error' => 'MAINTENANCE_QUERY_FAILED',
    'detail' => $error->getMessage(),
  ], 500);
}
