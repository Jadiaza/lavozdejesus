<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
lvj_require_method('GET');

function lvj_prayer_normalize(array $row): array
{
  $content = json_decode((string) ($row['contenido_json'] ?? ''), true);
  $content = is_array($content) ? $content : [];
  $read = static function (string ...$keys) use ($row, $content): string {
    foreach ([$row, $content] as $source) {
      foreach ($keys as $key) {
        if (isset($source[$key]) && is_scalar($source[$key]) && trim((string) $source[$key]) !== '') {
          return trim((string) $source[$key]);
        }
      }
    }
    return '';
  };
  $body = $read('texto_completo', 'texto', 'oracion');
  if ($body === '') {
    $parts = [];
    foreach (($content['secciones'] ?? []) as $section) {
      if (is_array($section) && is_string($section['texto'] ?? null)) $parts[] = trim($section['texto']);
    }
    $body = implode("\n\n", $parts);
  }
  $result = ['id' => $read('id'), 'devocion_id' => $read('devocion_id'), 'devocion_slug' => $read('devocion_slug'), 'titulo' => $read('titulo', 'nombre'),
    'categoria' => $read('categoria') ?: 'Oraciones del cristiano', 'texto_completo' => $body];
  foreach (['subtitulo', 'descripcion', 'fuente', 'pagina_fuente', 'estado_revision'] as $field) $result[$field] = $read($field);
  $result['tema_visual'] = $read('tema_visual') ?: 'oracion';
  $result['imagen'] = $read('imagen', 'imagen_url');
  $result['audio_url'] = $read('audio_url', 'audio');
  $result['orden'] = (int) $read('orden');
  foreach (['destacada' => false, 'disponible_offline' => true] as $field => $default) {
    $value = $row[$field] ?? $content[$field] ?? $default;
    $result[$field] = in_array(strtolower((string) $value), ['1', 'true', 'si', 'sí', 'yes', 'activo'], true);
  }
  return $result;
}

try {
  $pdo = lvj_db();
  $rows = $pdo->query('SELECT o.*, d.slug AS devocion_slug FROM lvj_ora_oraciones o LEFT JOIN lvj_ora_devociones d ON d.id = o.devocion_id ORDER BY o.orden ASC, o.id ASC')->fetchAll();
  $records = [];
  foreach ($rows as $row) {
    $status = strtolower(trim((string) ($row['estado'] ?? $row['activo'] ?? 'activo')));
    $review = strtolower(trim((string) ($row['estado_revision'] ?? '')));
    if (in_array($status, ['0', 'inactivo', 'inactiva', 'eliminado', 'deleted'], true)) continue;
    if ($review !== '' && !in_array($review, ['publicada', 'publicado', 'published'], true)) continue;
    $prayer = lvj_prayer_normalize($row);
    if ($prayer['titulo'] !== '' && $prayer['texto_completo'] !== '') $records[] = $prayer;
  }
  $id = is_string($_GET['id'] ?? null) ? trim($_GET['id']) : '';
  $category = is_string($_GET['categoria'] ?? null) ? trim($_GET['categoria']) : '';
  $devotion = is_string($_GET['devocion'] ?? null) ? trim($_GET['devocion']) : '';
  $view = is_string($_GET['vista'] ?? null) ? trim($_GET['vista']) : '';
  if ($view === 'devociones') {
    $devotions = $pdo->query("SELECT d.id, d.slug, d.titulo, COALESCE(d.subtitulo, d.descripcion, '') AS subtitulo, COALESCE(d.imagen, '') AS imagen, COUNT(o.id) AS total_oraciones FROM lvj_ora_devociones d LEFT JOIN lvj_ora_oraciones o ON o.devocion_id = d.id AND o.estado_revision IN ('publicada','publicado','published') WHERE d.estado NOT IN ('inactivo','eliminado') GROUP BY d.id, d.slug, d.titulo, d.subtitulo, d.descripcion, d.imagen, d.orden ORDER BY d.orden ASC, d.id ASC")->fetchAll();
    lvj_json_response(['success' => true, 'total' => count($devotions), 'devociones' => $devotions]);
  }
  if ($id !== '') {
    foreach ($records as $prayer) {
      if ($prayer['id'] === $id) lvj_json_response(['success' => true, 'oracion' => $prayer]);
    }
    lvj_json_response(['success' => false, 'error' => 'ORACION_NO_ENCONTRADA'], 404);
  }
  if ($category !== '') {
    $records = array_values(array_filter($records, static fn(array $prayer): bool => mb_strtolower($prayer['categoria'], 'UTF-8') === mb_strtolower($category, 'UTF-8')));
  }
  if ($devotion !== '') {
    $records = array_values(array_filter($records, static fn(array $prayer): bool => $prayer['devocion_slug'] === $devotion));
  }
  lvj_json_response(['success' => true, 'total' => count($records), 'oraciones' => $records]);
} catch (Throwable $error) {
  error_log('LVJ prayer library: ' . get_class($error));
  lvj_json_response(['success' => false, 'error' => 'ORACIONES_QUERY_FAILED'], 500);
}
