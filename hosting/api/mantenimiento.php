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
  $submodule = isset($_GET['submodulo']) ? trim((string) $_GET['submodulo']) : '';

  if ($submodule !== '' && $module === '') {
    lvj_json_response([
      'error' => 'MODULE_REQUIRED',
      'mensaje' => 'El parámetro modulo es obligatorio cuando se consulta un submódulo.',
    ], 400);
  }

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

    if ($submodule !== '') {
      $subRow = lvj_optional_first(
        $pdo,
        'SELECT modulo, submodulo, modo_mantenimiento, mensaje_mantenimiento
         FROM lvj_cfg_submodulos
         WHERE emisora_id = :emisora_id
           AND modulo = :modulo
           AND submodulo = :submodulo
         LIMIT 1',
        [
          'emisora_id' => $emisoraId,
          'modulo' => $module,
          'submodulo' => $submodule,
        ],
      );

      if (!$subRow) {
        lvj_json_response([
          'error' => 'SUBMODULE_NOT_FOUND',
          'emisora_id' => (string) $emisoraId,
          'modulo' => $module,
          'submodulo' => $submodule,
        ], 404);
      }

      $submoduleMaintenance = lvj_bool($subRow['modo_mantenimiento'] ?? null, false);
      $active = $globalMaintenance || $moduleMaintenance || $submoduleMaintenance;

      lvj_json_response([
        'ok' => true,
        'emisora_id' => (string) $emisoraId,
        'modulo' => lvj_text($row, 'modulo'),
        'submodulo' => lvj_text($subRow, 'submodulo'),
        'modo_mantenimiento_global' => $globalMaintenance,
        'modo_mantenimiento' => $moduleMaintenance,
        'modo_mantenimiento_submodulo' => $submoduleMaintenance,
        'mantenimiento_activo' => $active,
        'nivel_mantenimiento_activo' => $globalMaintenance
          ? 'global'
          : ($moduleMaintenance ? 'modulo' : ($submoduleMaintenance ? 'submodulo' : 'ninguno')),
        'mensaje_mantenimiento' => $globalMaintenance
          ? 'La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
          : ($moduleMaintenance
            ? lvj_text($row, 'mensaje_mantenimiento')
            : ($submoduleMaintenance
              ? lvj_text($subRow, 'mensaje_mantenimiento')
              : '')),
      ]);
    }

    $subRows = lvj_optional_rows(
      $pdo,
      'SELECT submodulo, modo_mantenimiento, mensaje_mantenimiento
       FROM lvj_cfg_submodulos
       WHERE emisora_id = :emisora_id AND modulo = :modulo
       ORDER BY submodulo ASC',
      [
        'emisora_id' => $emisoraId,
        'modulo' => $module,
      ],
    );

    $submodules = [];
    foreach ($subRows as $subRow) {
      $submoduleMaintenance = lvj_bool($subRow['modo_mantenimiento'] ?? null, false);
      $submodules[lvj_text($subRow, 'submodulo')] = [
        'modo_mantenimiento' => $submoduleMaintenance,
        'mantenimiento_activo' => $globalMaintenance || $moduleMaintenance || $submoduleMaintenance,
        'mensaje_mantenimiento' => $globalMaintenance
          ? 'La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
          : ($moduleMaintenance
            ? lvj_text($row, 'mensaje_mantenimiento')
            : ($submoduleMaintenance ? lvj_text($subRow, 'mensaje_mantenimiento') : '')),
      ];
    }

    lvj_json_response([
      'ok' => true,
      'emisora_id' => (string) $emisoraId,
      'modulo' => lvj_text($row, 'modulo'),
      'modo_mantenimiento_global' => $globalMaintenance,
      'modo_mantenimiento' => $moduleMaintenance,
      'mantenimiento_activo' => $globalMaintenance || $moduleMaintenance,
      'mensaje_mantenimiento' => $globalMaintenance
        ? 'La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
        : ($moduleMaintenance ? lvj_text($row, 'mensaje_mantenimiento') : ''),
      'submodulos' => $submodules,
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

  $subRows = lvj_optional_rows(
    $pdo,
    'SELECT modulo, submodulo, modo_mantenimiento, mensaje_mantenimiento
     FROM lvj_cfg_submodulos
     WHERE emisora_id = :emisora_id
     ORDER BY modulo ASC, submodulo ASC',
    ['emisora_id' => $emisoraId],
  );

  $submodulesByModule = [];
  foreach ($subRows as $subRow) {
    $moduleName = lvj_text($subRow, 'modulo');
    $submoduleName = lvj_text($subRow, 'submodulo');
    $submoduleMaintenance = lvj_bool($subRow['modo_mantenimiento'] ?? null, false);

    $submodulesByModule[$moduleName][$submoduleName] = [
      'modo_mantenimiento' => $submoduleMaintenance,
      'mantenimiento_activo' => $globalMaintenance || $submoduleMaintenance,
      'mensaje_mantenimiento' => $globalMaintenance
        ? 'La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
        : ($submoduleMaintenance ? lvj_text($subRow, 'mensaje_mantenimiento') : ''),
    ];
  }

  $modules = [];
  foreach ($rows as $row) {
    $moduleName = lvj_text($row, 'modulo');
    $moduleMaintenance = lvj_bool($row['modo_mantenimiento'] ?? null, false);

    $modules[$moduleName] = [
      'modo_mantenimiento' => $moduleMaintenance,
      'mantenimiento_activo' => $globalMaintenance || $moduleMaintenance,
      'mensaje_mantenimiento' => $globalMaintenance
        ? 'La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
        : ($moduleMaintenance ? lvj_text($row, 'mensaje_mantenimiento') : ''),
      'submodulos' => $submodulesByModule[$moduleName] ?? new stdClass(),
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
