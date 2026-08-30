<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

function lvj_normalize_date(mixed $value): string
{
  if ($value instanceof DateTimeInterface) {
    return $value->format('Y-m-d');
  }

  $raw = trim((string) ($value ?? ''));
  if ($raw === '') {
    return '';
  }

  if (preg_match('/^\d{4}-\d{2}-\d{2}/', $raw) === 1) {
    return substr($raw, 0, 10);
  }

  if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $raw, $matches) === 1) {
    return sprintf('%04d-%02d-%02d', (int) $matches[3], (int) $matches[2], (int) $matches[1]);
  }

  $timestamp = strtotime($raw);
  return $timestamp ? date('Y-m-d', $timestamp) : $raw;
}

function lvj_visible_row(array $row): bool
{
  if (lvj_text($row, 'deleted_at') !== '') {
    return false;
  }

  $state = strtolower(lvj_text($row, 'estado', 'status', 'activo'));
  return $state === '' || in_array($state, ['1', 'true', 'si', 'sí', 'yes', 'activo', 'publicado'], true);
}

function lvj_rows_by_id(array $rows): array
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

function lvj_rows_by_key(array $rows, callable $getKey): array
{
  $map = [];

  foreach ($rows as $row) {
    $key = $getKey($row);
    if ($key !== '' && !isset($map[$key])) {
      $map[$key] = $row;
    }
  }

  return $map;
}

function lvj_month_day_from_date(string $date): string
{
  return strlen($date) >= 10 ? substr($date, 5, 5) : '';
}

function lvj_month_day_from_row(array $row): string
{
  $month = lvj_text($row, 'mes');
  $day = lvj_text($row, 'dia');

  if ($month !== '' && $day !== '') {
    return sprintf('%02d-%02d', (int) $month, (int) $day);
  }

  return lvj_month_day_from_date(lvj_normalize_date($row['fecha'] ?? ''));
}

/**
 * Consolida una sola fila por fecha respetando la prioridad editorial.
 * La mera existencia de una fila canónica bloquea el fallback legacy,
 * incluso cuando esa fila todavía no está publicada.
 *
 * @param array<int,array<string,mixed>> ...$sources
 * @return array<int,array<string,mixed>>
 */
function lvj_liturgia_rows_by_date(array ...$sources): array
{
  $rowsByDate = [];

  foreach ($sources as $rows) {
    foreach ($rows as $row) {
      $date = lvj_normalize_date($row['fecha'] ?? '');
      if ($date === '' || isset($rowsByDate[$date])) {
        continue;
      }
      $rowsByDate[$date] = $row;
    }
  }

  ksort($rowsByDate);
  return array_values($rowsByDate);
}

try {
  $pdo = lvj_db();
  $fecha = substr(trim((string) ($_GET['fecha'] ?? '')), 0, 10);

  $lecturas = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_lectura_dia ORDER BY fecha ASC, id ASC LIMIT 800',
  );
  $lecturasBase = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_lecturas_base ORDER BY id ASC LIMIT 1200',
  );
  $dias = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_dia ORDER BY fecha ASC, id ASC LIMIT 800',
  );
  $palabras = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_palabra_dia ORDER BY fecha ASC, id ASC LIMIT 800',
  );
  $tiempos = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_tiempos ORDER BY prioridad ASC, id ASC LIMIT 100',
  );
  $temas = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_temas ORDER BY id ASC LIMIT 200',
  );
  $santos = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_san_santo_dia ORDER BY mes ASC, dia ASC, id ASC LIMIT 500',
  );
  $celebraciones = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_celebraciones ORDER BY mes ASC, dia ASC, id ASC LIMIT 500',
  );
  $tipos = lvj_optional_rows(
    $pdo,
    'SELECT * FROM lvj_lit_tipos_celebracion ORDER BY prioridad ASC, id ASC LIMIT 100',
  );

  $lecturasBaseById = lvj_rows_by_id($lecturasBase);
  $diasById = lvj_rows_by_id($dias);
  $diasByDate = lvj_rows_by_key($dias, fn ($row) => lvj_normalize_date($row['fecha'] ?? ''));
  $palabrasByLiturgiaId = lvj_rows_by_key($palabras, fn ($row) => lvj_text($row, 'liturgia_id'));
  $palabrasByDate = lvj_rows_by_key($palabras, fn ($row) => lvj_normalize_date($row['fecha'] ?? ''));
  $tiemposById = lvj_rows_by_id($tiempos);
  $temasById = lvj_rows_by_id($temas);
  $santosById = lvj_rows_by_id($santos);
  $santosByMonthDay = lvj_rows_by_key($santos, fn ($row) => lvj_month_day_from_row($row));
  $celebracionesById = lvj_rows_by_id($celebraciones);
  $tiposById = lvj_rows_by_id($tipos);
  $baseRows = lvj_liturgia_rows_by_date($lecturas, $dias, $palabras);
  $data = [];

  foreach ($baseRows as $row) {
    $baseReading = $lecturasBaseById[lvj_text($row, 'lectura_base_id')] ?? [];
    foreach ($baseReading as $field => $value) {
      if (lvj_text($row, (string) $field) === '') $row[$field] = $value;
    }
    if (!lvj_visible_row($row)) {
      continue;
    }

    $rowDate = lvj_normalize_date($row['fecha'] ?? '');
    $day = $diasById[lvj_text($row, 'liturgia_id')] ?? $diasByDate[$rowDate] ?? $row;
    $liturgiaId = lvj_text($row, 'liturgia_id') ?: lvj_text($day, 'id') ?: lvj_text($row, 'id');
    $word = $palabrasByLiturgiaId[$liturgiaId] ?? $palabrasByDate[$rowDate] ?? $row;
    $normalizedDate = $rowDate ?: lvj_normalize_date($day['fecha'] ?? '') ?: lvj_normalize_date($word['fecha'] ?? '');

    if ($fecha !== '' && $normalizedDate !== $fecha) {
      continue;
    }

    $tiempo = $tiemposById[lvj_text($row, 'tiempo_id') ?: lvj_text($day, 'tiempo_id')] ?? null;
    $tema = $temasById[lvj_text($row, 'tema_id') ?: lvj_text($day, 'tema_id')] ?? null;
    $santo = $santosById[lvj_text($row, 'santo_id') ?: lvj_text($day, 'santo_id')] ??
      $santosByMonthDay[lvj_month_day_from_date($normalizedDate)] ??
      null;
    $celebracion = $celebracionesById[lvj_text($row, 'celebracion_id') ?: lvj_text($day, 'celebracion_id')] ?? null;
    $tipo = $tiposById[lvj_text($celebracion, 'tipo_celebracion_id', 'tipo_id')] ?? null;
    $tiempoNombre = lvj_text($row, 'tiempo_liturgico') ?: lvj_text($day, 'tiempo_liturgico') ?: preg_replace('/^tiempo\s+/i', '', lvj_text($tiempo, 'nombre'));
    $celebracionNombre = lvj_text($row, 'celebracion') ?: lvj_text($day, 'celebracion') ?: lvj_text($celebracion, 'nombre') ?: lvj_text($santo, 'nombre');
    $palabraHoy = lvj_text($row, 'palabra_hoy', 'frase_destacada') ?:
      lvj_text($day, 'palabra_hoy', 'frase_destacada') ?:
      lvj_text($word, 'frase_destacada', 'palabra_hoy', 'texto');


    $data[] = [
      'fecha' => $normalizedDate,
      'tiempo_liturgico' => trim((string) $tiempoNombre),
      'celebracion' => $celebracionNombre,
      'grado_celebracion' => lvj_text($tipo, 'nombre'),
      'santo' => lvj_text($santo, 'nombre'),
      'tema_devocional' => lvj_text($tema, 'nombre'),
      'color_liturgico' =>
        lvj_text($row, 'color_liturgico') ?:
        lvj_text($day, 'color_liturgico') ?:
        lvj_text($celebracion, 'color_liturgico', 'color') ?:
        lvj_text($tiempo, 'color_liturgico', 'color'),
      'primera_lectura_cita' => lvj_text($row, 'primera_lectura_cita'),
      'primera_lectura_texto' => lvj_text($row, 'primera_lectura_texto'),
      'salmo_cita' => lvj_text($row, 'salmo_cita'),
      'salmo_respuesta' => lvj_text($row, 'salmo_respuesta'),
      'salmo_texto' => lvj_text($row, 'salmo_texto'),
      'segunda_lectura_cita' => lvj_text($row, 'segunda_lectura_cita'),
      'segunda_lectura_texto' => lvj_text($row, 'segunda_lectura_texto'),
      'evangelio_cita' => lvj_text($row, 'evangelio_cita'),
      'evangelio_versiculo' => lvj_text($row, 'evangelio_versiculo', 'versiculo'),
      'evangelio_texto' => lvj_text($row, 'evangelio_texto'),
      'palabra_hoy' => $palabraHoy,
      'reflexion' => lvj_text($row, 'reflexion'),
      'pregunta_meditar' => lvj_text($row, 'pregunta_meditar'),
      'oracion' => lvj_text($row, 'oracion'),
      'compromiso' => lvj_text($row, 'compromiso'),
      'mensaje_final' => lvj_text($row, 'mensaje_final'),
      'audio_url' => lvj_text($row, 'audio_url'),
      'fuente' => lvj_text($row, 'fuente'),
      'estado' => lvj_text($row, 'estado') ?: lvj_text($day, 'estado') ?: lvj_text($word, 'estado') ?: 'publicado',
    ];
  }

  lvj_json_response($data);
} catch (Throwable $error) {
  lvj_json_response([
    'error' => 'LITURGIA_QUERY_FAILED',
    'detail' => $error->getMessage(),
  ], 500);
}
