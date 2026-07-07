<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

function lvj_lectio_normalize_date(mixed $value): string
{
  if ($value instanceof DateTimeInterface) {
    return $value->format('Y-m-d');
  }

  $raw = trim((string) ($value ?? ''));

  return preg_match('/^\d{4}-\d{2}-\d{2}/', $raw) === 1
    ? substr($raw, 0, 10)
    : $raw;
}

function lvj_lectio_visible(array $row): bool
{
  if (lvj_text($row, 'deleted_at') !== '') {
    return false;
  }

  $state = strtolower(lvj_text($row, 'estado', 'status', 'activo'));

  return $state === '' || in_array($state, ['1', 'true', 'si', 'sÃ­', 'yes', 'activo', 'publicado'], true);
}

try {
  $pdo = lvj_db();
  $fecha = substr(trim((string) ($_GET['fecha'] ?? '')), 0, 10);

  $rows = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_lectio_divina ORDER BY fecha ASC, id ASC LIMIT 800',
  );

  $data = [];

  foreach ($rows as $row) {
    if (!lvj_lectio_visible($row)) {
      continue;
    }

    $rowDate = lvj_lectio_normalize_date($row['fecha'] ?? '');

    if ($fecha !== '' && $rowDate !== $fecha) {
      continue;
    }

    $data[] = array_merge($row, [
      'fecha' => $rowDate,
      'reflexion' => lvj_text($row, 'reflexion'),
      'pregunta_meditar' => lvj_text($row, 'pregunta_meditar'),
      'oracion' => lvj_text($row, 'oracion'),
      'compromiso' => lvj_text($row, 'compromiso'),
      'mensaje_final' => lvj_text($row, 'mensaje_final'),
      'audio_url' => lvj_text($row, 'audio_url'),
      'estado' => lvj_text($row, 'estado') ?: 'publicado',
    ]);
  }

  lvj_json_response($data);
} catch (Throwable $error) {
  lvj_json_response([
    'error' => 'LECTIO_QUERY_FAILED',
    'detail' => $error->getMessage(),
  ], 500);
}
