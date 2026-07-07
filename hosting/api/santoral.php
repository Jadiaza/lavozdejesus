<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

function lvj_santoral_visible(array $row): bool
{
  if (lvj_text($row, 'deleted_at') !== '') {
    return false;
  }

  $state = strtolower(lvj_text($row, 'estado', 'status', 'activo'));

  return $state === '' || in_array($state, ['1', 'true', 'si', 'sÃ­', 'yes', 'activo', 'publicado'], true);
}

function lvj_santoral_pad(string $value): string
{
  return str_pad($value, 2, '0', STR_PAD_LEFT);
}

function lvj_santoral_date_from_row(array $row, string $year): string
{
  $month = lvj_text($row, 'mes');
  $day = lvj_text($row, 'dia');

  if ($month !== '' && $day !== '') {
    return sprintf('%s-%02d-%02d', $year, (int) $month, (int) $day);
  }

  $raw = lvj_text($row, 'fecha');

  if (preg_match('/^\d{4}-\d{2}-\d{2}/', $raw) === 1) {
    return $year . '-' . substr($raw, 5, 5);
  }

  return $raw;
}

try {
  $pdo = lvj_db();
  $fecha = substr(trim((string) ($_GET['fecha'] ?? '')), 0, 10);
  $year = substr($fecha, 0, 4) ?: date('Y');

  $rows = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_san_santo_dia ORDER BY mes ASC, dia ASC, id ASC LIMIT 800',
  );

  $data = [];

  foreach ($rows as $row) {
    if (!lvj_santoral_visible($row)) {
      continue;
    }

    $rowDate = lvj_santoral_date_from_row($row, $year);

    if ($fecha !== '' && $rowDate !== $fecha) {
      continue;
    }

    $data[] = [
      'fecha' => $rowDate,
      'mes' => lvj_text($row, 'mes'),
      'dia' => lvj_text($row, 'dia'),
      'nombre' => lvj_text($row, 'nombre'),
      'titulo' => lvj_text($row, 'titulo'),
      'resumen' => lvj_text($row, 'resumen', 'quien_fue'),
      'lucha_que_enfrento' => lvj_text($row, 'lucha_que_enfrento'),
      'secreto_de_santidad' => lvj_text($row, 'secreto_de_santidad'),
      'ensenanza_para_hoy' => lvj_text($row, 'ensenanza_para_hoy'),
      'como_puedo_imitarlo' => lvj_text($row, 'como_puedo_imitarlo'),
      'paso_concreto' => lvj_text($row, 'paso_concreto'),
      'oracion_intercesion' => lvj_text($row, 'oracion_intercesion'),
      'imagen_url' => lvj_text($row, 'imagen_url'),
      'frase_destacada' => lvj_text($row, 'frase_destacada'),
      'estado' => lvj_text($row, 'estado') ?: 'publicado',
    ];
  }

  lvj_json_response($data);
} catch (Throwable $error) {
  lvj_json_response([
    'error' => 'SANTORAL_QUERY_FAILED',
    'detail' => $error->getMessage(),
  ], 500);
}
