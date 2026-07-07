<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

function lvj_programacion_visible(array $row): bool
{
  if (lvj_text($row, 'deleted_at') !== '') {
    return false;
  }

  $state = strtolower(lvj_text($row, 'estado', 'status', 'activo'));

  return $state === '' || in_array($state, ['1', 'true', 'si', 'sí', 'yes', 'activo', 'publicado'], true);
}

function lvj_programacion_rows_by_id(array $rows): array
{
  $map = [];

  foreach ($rows as $row) {
    $id = lvj_text($row, 'id');
    if ($id !== '') {
      $map[$id] = $row;
    }
  }

  return $map;
}

try {
  $pdo = lvj_db();

  $schedule = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_rad_programacion ORDER BY dia_semana ASC, hora_inicio ASC, id ASC LIMIT 1000',
  );
  $programs = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_rad_programas ORDER BY id ASC LIMIT 500',
  );

  $programsById = lvj_programacion_rows_by_id($programs);
  $data = [];

  foreach ($schedule as $row) {
    if (!lvj_programacion_visible($row)) {
      continue;
    }

    $program = $programsById[lvj_text($row, 'programa_id')] ?? null;
    $programName = lvj_text($row, 'programa', 'nombre') ?: lvj_text($program, 'nombre', 'titulo');

    if ($programName === '') {
      continue;
    }

    $data[] = [
      'id' => lvj_text($row, 'id'),
      'dia_semana' => lvj_text($row, 'dia_semana', 'dia', 'dia_nombre') ?: 'diario',
      'hora_inicio' => lvj_text($row, 'hora_inicio', 'inicio'),
      'hora_fin' => lvj_text($row, 'hora_fin', 'fin'),
      'programa' => $programName,
      'descripcion' => lvj_text($row, 'descripcion') ?: lvj_text($program, 'descripcion'),
      'imagen_url' =>
        lvj_text($row, 'imagen_url', 'image_url', 'imagen') ?:
        lvj_text($program, 'imagen_url', 'image_url', 'imagen'),
      'estado' => lvj_text($row, 'estado', 'status') ?: 'publicado',
    ];
  }

  lvj_json_response($data);
} catch (Throwable $error) {
  lvj_json_response([
    'error' => 'PROGRAMACION_QUERY_FAILED',
    'detail' => $error->getMessage(),
  ], 500);
}
