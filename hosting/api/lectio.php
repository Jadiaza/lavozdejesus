<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/includes/liturgia/LectioLibraryService.php';

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

  return $state === '' || in_array($state, ['1', 'true', 'si', 'sí', 'yes', 'activo', 'publicado'], true);
}

/** @return array<string,mixed> */
function lvj_lectio_present(array $row, ?string $requestedDate = null): array
{
  return array_merge($row, [
    // Cuando una Lectio aprobada se reutiliza en otra fecha, la API expone la
    // fecha solicitada sin duplicar el estudio almacenado.
    'fecha' => $requestedDate ?: lvj_lectio_normalize_date($row['fecha'] ?? ''),
    'cita' => lvj_text($row, 'cita'),
    'frase_destacada' => lvj_text($row, 'frase_destacada'),
    'cita_destacada' => lvj_text($row, 'cita_destacada') ?: lvj_text($row, 'cita'),
    'reflexion' => lvj_text($row, 'reflexion'),
    'pregunta_meditar' => lvj_text($row, 'pregunta_meditar'),
    'oracion' => lvj_text($row, 'oracion'),
    'compromiso' => lvj_text($row, 'compromiso'),
    'mensaje_final' => lvj_text($row, 'mensaje_final'),
    'audio_url' => lvj_text($row, 'audio_url'),
    'estado' => lvj_text($row, 'estado') ?: 'publicado',
  ]);
}

try {
  $pdo = lvj_db();
  $fecha = substr(trim((string) ($_GET['fecha'] ?? '')), 0, 10);
  $cita = mb_substr(trim((string) ($_GET['cita'] ?? '')), 0, 160, 'UTF-8');
  $library = new LectioLibraryService($pdo);

  if ($cita !== '') {
    $row = $library->findPublishedByCitation($cita);
    lvj_json_response($row ? [lvj_lectio_present($row)] : []);
  }

  if ($fecha !== '') {
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha) !== 1) {
      lvj_json_response(['error' => 'LECTIO_INVALID_DATE'], 422);
    }

    $row = $library->findPublishedForDate($fecha);
    lvj_json_response($row ? [lvj_lectio_present($row, $fecha)] : []);
  }

  $rows = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_lectio_divina ORDER BY fecha ASC, id ASC LIMIT 800',
  );

  $data = [];
  foreach ($rows as $row) {
    if (lvj_lectio_visible($row)) {
      $data[] = lvj_lectio_present($row);
    }
  }

  lvj_json_response($data);
} catch (Throwable $error) {
  lvj_json_response([
    'error' => 'LECTIO_QUERY_FAILED',
    'detail' => $error->getMessage(),
  ], 500);
}
