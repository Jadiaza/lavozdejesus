<?php

declare(strict_types=1);

define('LVJ_FORCE_NO_STORE', true);

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === 'https://lvjprayer.vercel.app') {
  header('Access-Control-Allow-Origin: https://lvjprayer.vercel.app');
  header('Vary: Origin');
}

require_once __DIR__ . '/bootstrap.php';

lvj_require_method('GET');

$slug = lvj_clean_text($_GET['slug'] ?? '');
$metaOnly = (string) ($_GET['meta'] ?? '') === '1';

if ($slug === '') {
  lvj_json_response(['success' => false, 'message' => 'Falta el podcast solicitado.'], 400);
}

try {
  $pdo = lvj_db();

  $podcastColumns = array_column($pdo->query('SHOW COLUMNS FROM lvj_pod_podcasts')->fetchAll(), 'Field');
  $hasSlug = in_array('slug', $podcastColumns, true);

  if ($hasSlug) {
    $statement = $pdo->prepare('SELECT * FROM lvj_pod_podcasts WHERE slug = :slug LIMIT 1');
    $statement->execute(['slug' => $slug]);
    $podcastRow = $statement->fetch() ?: null;
  } else {
    $legacyTitles = [
      'hablemos-de-exorcismos' => 'Hablemos de Exorcismos',
    ];
    $title = $legacyTitles[$slug] ?? '';
    if ($title === '') {
      lvj_json_response(['success' => false, 'message' => 'Podcast no encontrado.'], 404);
    }
    $statement = $pdo->prepare('SELECT * FROM lvj_pod_podcasts WHERE titulo = :titulo LIMIT 1');
    $statement->execute(['titulo' => $title]);
    $podcastRow = $statement->fetch() ?: null;
  }

  if (!$podcastRow) {
    lvj_json_response(['success' => false, 'message' => 'Podcast no encontrado.'], 404);
  }

  $category = '';
  $categoryId = (int) ($podcastRow['categoria_id'] ?? 0);
  if ($categoryId > 0) {
    $categoryRow = lvj_optional_first($pdo, 'SELECT * FROM lvj_pod_categorias WHERE id = :id LIMIT 1', ['id' => $categoryId]);
    $category = lvj_text($categoryRow, 'nombre', 'titulo');
  }

  $podcastImage = lvj_text($podcastRow, 'imagen_url', 'image_url');
  $podcast = [
    'slug' => $slug,
    'title' => lvj_text($podcastRow, 'titulo', 'nombre'),
    'description' => lvj_text($podcastRow, 'descripcion'),
    'author' => lvj_text($podcastRow, 'autor'),
    'image_url' => $podcastImage,
    'category' => $category ?: 'Podcast católico',
    'source' => 'lvj_db',
  ];

  if ($metaOnly) {
    lvj_json_response(['podcast' => $podcast]);
  }

  $episodeStatement = $pdo->prepare(
    "SELECT id, titulo, descripcion, audio_url, imagen_url, fecha_publicacion,
            duracion_segundos, temporada_numero, episodio_numero
       FROM lvj_pod_episodios
      WHERE podcast_id = :podcast_id
        AND LOWER(TRIM(estado)) IN ('publicado','publicada','activo','activa','1')
      ORDER BY temporada_numero ASC, episodio_numero ASC, id ASC"
  );
  $episodeStatement->execute(['podcast_id' => (int) $podcastRow['id']]);

  $episodes = [];
  foreach ($episodeStatement->fetchAll() as $row) {
    $id = (int) ($row['id'] ?? 0);
    $season = max(1, (int) ($row['temporada_numero'] ?? 1));
    $episode = max(1, (int) ($row['episodio_numero'] ?? 1));
    $publishedAt = trim((string) ($row['fecha_publicacion'] ?? ''));

    $episodes[] = [
      'id' => $slug . '-' . $id,
      'guid' => $slug . '-' . $id,
      'title' => lvj_text($row, 'titulo'),
      'description' => lvj_text($row, 'descripcion'),
      'audio_url' => lvj_text($row, 'audio_url'),
      'image_url' => lvj_text($row, 'imagen_url') ?: $podcastImage,
      'duration_seconds' => max(0, (int) ($row['duracion_segundos'] ?? 0)),
      'pub_date' => $publishedAt,
      'season_number' => $season,
      'episode_number' => $episode,
    ];
  }

  lvj_json_response([
    'podcast' => $podcast,
    'episodes' => $episodes,
  ]);
} catch (Throwable $error) {
  error_log('LVJ podcast API: ' . $error->getMessage());
  lvj_json_response([
    'success' => false,
    'message' => 'No fue posible consultar el podcast.',
  ], 500);
}
