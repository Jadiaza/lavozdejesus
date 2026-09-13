<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

lvj_require_method('GET');

const LVJ_PODCAST_CONSECRATION_SLUG = 'santos-arcangeles-33-dias';

function lvj_podcast_supabase_config(): array
{
  $url = rtrim(trim((string) lvj_setting('SUPABASE_URL')), '/');
  $key = trim((string) lvj_setting('SUPABASE_SERVICE_ROLE_KEY'));

  if ($key === '') {
    $key = trim((string) lvj_setting('SUPABASE_ANON_KEY'));
  }

  return ['url' => $url, 'key' => $key];
}

function lvj_podcast_supabase_get(string $path, array $query, string $url, string $key): array
{
  if (!function_exists('curl_init')) {
    throw new RuntimeException('La extensión cURL no está disponible en el servidor.');
  }

  $endpoint = $url . '/rest/v1/' . ltrim($path, '/') . '?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986);
  $headers = [
    'Accept: application/json',
    'apikey: ' . $key,
  ];

  if (!str_starts_with($key, 'sb_')) {
    $headers[] = 'Authorization: Bearer ' . $key;
  }

  $curl = curl_init($endpoint);
  curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 20,
  ]);

  $body = curl_exec($curl);
  $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
  $error = curl_error($curl);
  curl_close($curl);

  if ($body === false || $error !== '') {
    throw new RuntimeException('No fue posible consultar la fuente de la Consagración.');
  }

  if ($status < 200 || $status >= 300) {
    throw new RuntimeException('La fuente de la Consagración respondió con estado ' . $status . '.');
  }

  $decoded = json_decode($body, true);
  if (!is_array($decoded)) {
    throw new RuntimeException('La fuente de la Consagración devolvió una respuesta inválida.');
  }

  return $decoded;
}

$config = lvj_podcast_supabase_config();
if ($config['url'] === '' || $config['key'] === '') {
  lvj_json_response([
    'success' => false,
    'error' => 'SUPABASE_ENV_NOT_CONFIGURED',
  ], 503);
}

try {
  $consecrations = lvj_podcast_supabase_get('consecrations', [
    'select' => 'id,slug,title,subtitle,motto,description,duration_days,status',
    'slug' => 'eq.' . LVJ_PODCAST_CONSECRATION_SLUG,
    'status' => 'eq.published',
    'limit' => '1',
  ], $config['url'], $config['key']);

  $series = $consecrations[0] ?? null;
  if (!is_array($series) || empty($series['id'])) {
    lvj_json_response([
      'success' => false,
      'error' => 'CONSECRATION_NOT_FOUND',
    ], 404);
  }

  $days = lvj_podcast_supabase_get('consecration_days', [
    'select' => 'id,day_number,title,subtitle,playlist_summary,hero_image,estimated_minutes,status,media_assets!inner(id,asset_type,public_url,duration_seconds,provider,storage_key)',
    'consecration_id' => 'eq.' . $series['id'],
    'status' => 'eq.published',
    'media_assets.asset_type' => 'eq.podcast',
    'order' => 'day_number.asc',
  ], $config['url'], $config['key']);

  $episodes = [];
  foreach ($days as $day) {
    if (!is_array($day)) {
      continue;
    }

    $audio = null;
    foreach (($day['media_assets'] ?? []) as $asset) {
      if (
        is_array($asset)
        && ($asset['asset_type'] ?? '') === 'podcast'
        && trim((string) ($asset['public_url'] ?? '')) !== ''
      ) {
        $audio = $asset;
        break;
      }
    }

    if (!$audio) {
      continue;
    }

    $episodes[] = [
      'id' => (string) ($day['id'] ?? ''),
      'day_number' => (int) ($day['day_number'] ?? 0),
      'title' => (string) ($day['title'] ?? ''),
      'subtitle' => $day['subtitle'] ?? null,
      'summary' => $day['playlist_summary'] ?? null,
      'image_url' => $day['hero_image'] ?? null,
      'estimated_minutes' => (int) ($day['estimated_minutes'] ?? 0),
      'media_asset_id' => (string) ($audio['id'] ?? ''),
      'audio_url' => (string) ($audio['public_url'] ?? ''),
      'duration_seconds' => (int) ($audio['duration_seconds'] ?? 0),
      'provider' => (string) ($audio['provider'] ?? ''),
    ];
  }

  $series['available_episodes'] = count($episodes);

  lvj_json_response([
    'success' => true,
    'series' => $series,
    'episodes' => $episodes,
  ]);
} catch (Throwable $error) {
  error_log('LVJ podcast consagracion: ' . $error->getMessage());
  lvj_json_response([
    'success' => false,
    'error' => 'PODCAST_CONSECRATION_QUERY_FAILED',
    'message' => 'No fue posible cargar temporalmente los audios de la Consagración.',
  ], 500);
}
