<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$pageTitle = 'Podcast';
$pageSubtitle = 'Podcasts, temporadas y episodios';

function pod_table_exists(PDO $pdo, string $table): bool
{
  try {
    $stmt = $pdo->prepare('SHOW TABLES LIKE :table_name');
    $stmt->execute(['table_name' => $table]);
    return (bool) $stmt->fetchColumn();
  } catch (Throwable $e) {
    return false;
  }
}

function pod_columns(PDO $pdo, string $table): array
{
  try {
    $rows = $pdo->query("SHOW COLUMNS FROM {$table}")->fetchAll();
    return array_values(array_filter(array_map(static fn($row) => (string) ($row['Field'] ?? ''), $rows)));
  } catch (Throwable $e) {
    return [];
  }
}

function pod_has(array $columns, string $column): bool
{
  return in_array($column, $columns, true);
}

function pod_redirect(array $params = []): void
{
  header('Location: podcast.php' . ($params ? '?' . http_build_query($params) : ''));
  exit;
}

function pod_status_active($value): bool
{
  return in_array(strtolower(trim((string) $value)), ['1','activo','activa','publicado','publicada','active','true','si','sí','yes'], true);
}

function pod_date_input($value): string
{
  $value = trim((string) $value);
  if ($value === '') return '';
  $time = strtotime($value);
  return $time === false ? '' : date('Y-m-d\TH:i', $time);
}

$podcastColumns = pod_columns($pdo, 'lvj_pod_podcasts');
$episodesReady = pod_table_exists($pdo, 'lvj_pod_episodios');
$message = trim((string) ($_GET['ok'] ?? ''));
$error = '';

$podcastId = max(0, (int) ($_GET['podcast_id'] ?? 0));
$editPodcastId = max(0, (int) ($_GET['edit_podcast'] ?? 0));
$editEpisodeId = max(0, (int) ($_GET['edit_episode'] ?? 0));
$newPodcast = isset($_GET['new_podcast']);
$newEpisode = isset($_GET['new_episode']);

try {
  $categories = $pdo->query('SELECT * FROM lvj_pod_categorias ORDER BY id ASC')->fetchAll();
} catch (Throwable $e) {
  $categories = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $action = (string) ($_POST['action'] ?? '');

  try {
    if ($action === 'save_podcast') {
      $id = max(0, (int) ($_POST['id'] ?? 0));
      $title = trim((string) ($_POST['titulo'] ?? ''));
      if ($title === '') throw new RuntimeException('Escribe el título del podcast.');

      $payload = [
        'categoria_id' => max(0, (int) ($_POST['categoria_id'] ?? 0)),
        'fecha' => trim((string) ($_POST['fecha'] ?? '')),
        'titulo' => $title,
        'descripcion' => trim((string) ($_POST['descripcion'] ?? '')),
        'imagen_url' => trim((string) ($_POST['imagen_url'] ?? '')),
        'autor' => trim((string) ($_POST['autor'] ?? '')),
        'estado' => trim((string) ($_POST['estado'] ?? 'publicado')),
      ];

      $payload = array_filter($payload, static fn($_, $key) => pod_has($GLOBALS['podcastColumns'], (string) $key), ARRAY_FILTER_USE_BOTH);
      if (!$payload) throw new RuntimeException('La tabla de podcasts no contiene campos editables compatibles.');

      if ($id > 0) {
        $sets = [];
        foreach (array_keys($payload) as $key) $sets[] = "{$key} = :{$key}";
        $payload['id'] = $id;
        $stmt = $pdo->prepare('UPDATE lvj_pod_podcasts SET ' . implode(', ', $sets) . ' WHERE id = :id LIMIT 1');
        $stmt->execute($payload);
        log_activity('update', 'lvj_pod_podcasts', $id, 'Podcast actualizado');
        pod_redirect(['ok' => 'Podcast actualizado.']);
      }

      $fields = array_keys($payload);
      $stmt = $pdo->prepare('INSERT INTO lvj_pod_podcasts (' . implode(', ', $fields) . ') VALUES (:' . implode(', :', $fields) . ')');
      $stmt->execute($payload);
      $newId = (int) $pdo->lastInsertId();
      log_activity('create', 'lvj_pod_podcasts', $newId, 'Podcast creado');
      pod_redirect(['podcast_id' => $newId, 'ok' => 'Podcast creado. Ya puedes agregar episodios.']);
    }

    if ($action === 'delete_podcast') {
      $id = max(0, (int) ($_POST['id'] ?? 0));
      if ($id <= 0) throw new RuntimeException('Podcast no válido.');
      if ($episodesReady) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM lvj_pod_episodios WHERE podcast_id = :id');
        $stmt->execute(['id' => $id]);
        if ((int) $stmt->fetchColumn() > 0) throw new RuntimeException('El podcast tiene episodios. Elimínalos primero.');
      }
      $stmt = $pdo->prepare('DELETE FROM lvj_pod_podcasts WHERE id = :id LIMIT 1');
      $stmt->execute(['id' => $id]);
      log_activity('delete', 'lvj_pod_podcasts', $id, 'Podcast eliminado');
      pod_redirect(['ok' => 'Podcast eliminado.']);
    }

    if ($action === 'save_episode') {
      if (!$episodesReady) throw new RuntimeException('Primero debes ejecutar la migración de episodios.');

      $id = max(0, (int) ($_POST['id'] ?? 0));
      $parentId = max(0, (int) ($_POST['podcast_id'] ?? 0));
      $title = trim((string) ($_POST['titulo'] ?? ''));
      $audioUrl = trim((string) ($_POST['audio_url'] ?? ''));
      $season = max(1, (int) ($_POST['temporada_numero'] ?? 1));
      $episodeNumber = max(1, (int) ($_POST['episodio_numero'] ?? 1));
      $published = trim((string) ($_POST['fecha_publicacion'] ?? ''));

      if ($parentId <= 0) throw new RuntimeException('Selecciona un podcast.');
      if ($title === '') throw new RuntimeException('Escribe el título del episodio.');
      if ($audioUrl === '' || !filter_var($audioUrl, FILTER_VALIDATE_URL)) throw new RuntimeException('Escribe una URL de audio válida.');

      $check = $pdo->prepare('SELECT id FROM lvj_pod_podcasts WHERE id = :id LIMIT 1');
      $check->execute(['id' => $parentId]);
      if (!$check->fetchColumn()) throw new RuntimeException('El podcast seleccionado no existe.');

      $data = [
        'podcast_id' => $parentId,
        'titulo' => $title,
        'descripcion' => trim((string) ($_POST['descripcion'] ?? '')),
        'audio_url' => $audioUrl,
        'imagen_url' => isset($_POST['heredar_imagen']) ? '' : trim((string) ($_POST['imagen_url'] ?? '')),
        'fecha_publicacion' => $published !== '' ? str_replace('T', ' ', $published) . (strlen($published) === 16 ? ':00' : '') : null,
        'duracion_segundos' => max(0, (int) ($_POST['duracion_segundos'] ?? 0)),
        'temporada_numero' => $season,
        'episodio_numero' => $episodeNumber,
        'tipo_episodio' => in_array((string) ($_POST['tipo_episodio'] ?? ''), ['full','trailer','bonus'], true) ? (string) $_POST['tipo_episodio'] : 'full',
        'explicito' => isset($_POST['explicito']) ? 1 : 0,
        'estado' => in_array((string) ($_POST['estado'] ?? ''), ['borrador','publicado','inactivo'], true) ? (string) $_POST['estado'] : 'publicado',
      ];

      if ($id > 0) {
        $sets = [];
        foreach (array_keys($data) as $key) $sets[] = "{$key} = :{$key}";
        $data['id'] = $id;
        $stmt = $pdo->prepare('UPDATE lvj_pod_episodios SET ' . implode(', ', $sets) . ' WHERE id = :id LIMIT 1');
        $stmt->execute($data);
        log_activity('update', 'lvj_pod_episodios', $id, 'Episodio actualizado');
        pod_redirect(['podcast_id' => $parentId, 'ok' => 'Episodio actualizado.']);
      }

      $fields = array_keys($data);
      $stmt = $pdo->prepare('INSERT INTO lvj_pod_episodios (' . implode(', ', $fields) . ') VALUES (:' . implode(', :', $fields) . ')');
      $stmt->execute($data);
      $newId = (int) $pdo->lastInsertId();
      log_activity('create', 'lvj_pod_episodios', $newId, 'Episodio creado');
      pod_redirect(['podcast_id' => $parentId, 'ok' => 'Episodio agregado.']);
    }

    if ($action === 'delete_episode') {
      if (!$episodesReady) throw new RuntimeException('La tabla de episodios no está disponible.');
      $id = max(0, (int) ($_POST['id'] ?? 0));
      $parentId = max(0, (int) ($_POST['podcast_id'] ?? 0));
      if ($id <= 0 || $parentId <= 0) throw new RuntimeException('Episodio no válido.');
      $stmt = $pdo->prepare('DELETE FROM lvj_pod_episodios WHERE id = :id AND podcast_id = :podcast_id LIMIT 1');
      $stmt->execute(['id' => $id, 'podcast_id' => $parentId]);
      log_activity('delete', 'lvj_pod_episodios', $id, 'Episodio eliminado');
      pod_redirect(['podcast_id' => $parentId, 'ok' => 'Episodio eliminado.']);
    }
  } catch (Throwable $e) {
    $error = $e instanceof RuntimeException ? $e->getMessage() : 'No fue posible guardar el cambio.';
  }
}

try {
  $podcasts = $pdo->query('SELECT * FROM lvj_pod_podcasts ORDER BY id DESC')->fetchAll();
} catch (Throwable $e) {
  $podcasts = [];
  $error = $error ?: 'No fue posible consultar los podcasts.';
}

$episodeCounts = [];
if ($episodesReady) {
  try {
    $rows = $pdo->query('SELECT podcast_id, COUNT(*) total FROM lvj_pod_episodios GROUP BY podcast_id')->fetchAll();
    foreach ($rows as $row) $episodeCounts[(int) $row['podcast_id']] = (int) $row['total'];
  } catch (Throwable $e) {
    $episodeCounts = [];
  }
}

$selectedPodcast = null;
foreach ($podcasts as $podcast) {
  if ((int) ($podcast['id'] ?? 0) === $podcastId) $selectedPodcast = $podcast;
}

$editPodcast = null;
if ($editPodcastId > 0) {
  foreach ($podcasts as $podcast) if ((int) ($podcast['id'] ?? 0) === $editPodcastId) $editPodcast = $podcast;
}

$episodes = [];
if ($episodesReady && $podcastId > 0) {
  try {
    $stmt = $pdo->prepare('SELECT * FROM lvj_pod_episodios WHERE podcast_id = :podcast_id ORDER BY temporada_numero DESC, episodio_numero DESC, id DESC');
    $stmt->execute(['podcast_id' => $podcastId]);
    $episodes = $stmt->fetchAll();
  } catch (Throwable $e) {
    $error = $error ?: 'No fue posible consultar los episodios.';
  }
}

$editEpisode = null;
if ($episodesReady && $editEpisodeId > 0 && $podcastId > 0) {
  $stmt = $pdo->prepare('SELECT * FROM lvj_pod_episodios WHERE id = :id AND podcast_id = :podcast_id LIMIT 1');
  $stmt->execute(['id' => $editEpisodeId, 'podcast_id' => $podcastId]);
  $editEpisode = $stmt->fetch() ?: null;
}

$showPodcastForm = $newPodcast || $editPodcast;
$showEpisodeForm = $podcastId > 0 && ($newEpisode || $editEpisode);

require __DIR__ . '/includes/header.php';
?>

<style>
.pod-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}.pod-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.pod-tabs a{padding:10px 14px;border:1px solid var(--line);border-radius:10px;background:#fff;font-weight:800;color:#344054}.pod-tabs a.active{background:var(--navy);border-color:var(--gold);color:#fff}.pod-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.pod-card{display:grid;grid-template-columns:92px 1fr;gap:14px;padding:14px;border:1px solid var(--line);border-radius:16px;background:#fff}.pod-cover{width:92px;height:92px;border-radius:12px;overflow:hidden;background:#0b1728;display:flex;align-items:center;justify-content:center;color:var(--gold);font-weight:900}.pod-cover img{width:100%;height:100%;object-fit:cover}.pod-card h3{margin:0 0 5px;color:var(--navy)}.pod-meta{color:var(--muted);font-size:13px;line-height:1.5}.pod-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.pod-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.pod-form label{display:grid;gap:7px;font-weight:750;color:#344054}.pod-form input,.pod-form select,.pod-form textarea{width:100%;border:1px solid rgba(15,23,42,.14);border-radius:10px;background:#fff;padding:10px 11px;font:inherit}.pod-form textarea{min-height:130px;resize:vertical}.pod-span-2{grid-column:1/-1}.episode-hero{display:grid;grid-template-columns:86px 1fr auto;gap:14px;align-items:center;margin-bottom:18px;padding:15px;border:1px solid var(--line);border-radius:16px;background:#fff}.episode-hero .pod-cover{width:86px;height:86px}.episode-number{font-weight:900;color:var(--gold);white-space:nowrap}.episode-title{font-weight:800;color:var(--navy)}.episode-audio{max-width:270px}.migration-note{border:1px solid #d8b34f;background:#fff9e8;border-radius:12px;padding:14px;color:#6a5314}.check-row{display:flex!important;align-items:center;gap:8px!important;font-weight:650!important}.check-row input{width:auto!important}.field-help{font-size:12px;color:var(--muted);font-weight:500}.form-section{grid-column:1/-1;border-top:1px solid var(--line);padding-top:4px;margin-top:4px}.form-section h3{margin:8px 0 0;color:var(--navy)}
@media(max-width:850px){.pod-grid{grid-template-columns:1fr}.pod-form{grid-template-columns:1fr}.pod-span-2,.form-section{grid-column:auto}.episode-hero{grid-template-columns:72px 1fr}.episode-hero .pod-cover{width:72px;height:72px}.episode-hero>a{grid-column:1/-1}}
</style>

<div class="pod-tabs">
  <a class="<?php echo $podcastId === 0 ? 'active' : ''; ?>" href="podcast.php">Podcasts</a>
  <?php if ($selectedPodcast): ?><a class="active" href="podcast.php?podcast_id=<?php echo (int) $podcastId; ?>">Episodios · <?php echo e((string) ($selectedPodcast['titulo'] ?? ('Podcast #' . $podcastId))); ?></a><?php endif; ?>
  <a href="content.php?module=podcast&amp;table=lvj_pod_categorias">Categorías</a>
</div>

<?php if ($message !== ''): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
<?php if ($error !== ''): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>

<?php if (!$episodesReady): ?>
  <div class="migration-note" style="margin-bottom:18px">
    <strong>Falta habilitar la tabla de episodios.</strong><br>
    Ejecuta manualmente la migración <code>app-admin/migrations/2026-09-27-add-podcast-episodes.sql</code>. La aplicación no ejecuta migraciones automáticamente en producción.
  </div>
<?php endif; ?>

<?php if ($podcastId === 0): ?>
  <section class="panel">
    <div class="pod-toolbar">
      <div><h2>Podcasts</h2><p class="muted">Configura la ficha general del podcast. Los audios se administran dentro de Episodios.</p></div>
      <a class="btn btn-gold" href="podcast.php?new_podcast=1">+ Crear podcast</a>
    </div>

    <?php if ($showPodcastForm): ?>
      <form method="post" class="pod-form" style="margin-bottom:22px">
        <?php echo csrf_field(); ?>
        <input type="hidden" name="action" value="save_podcast">
        <input type="hidden" name="id" value="<?php echo (int) ($editPodcast['id'] ?? 0); ?>">
        <?php if (pod_has($podcastColumns, 'categoria_id')): ?><label>Categoría<select name="categoria_id"><option value="0">Sin categoría</option><?php foreach ($categories as $category): ?><option value="<?php echo (int) ($category['id'] ?? 0); ?>"<?php echo (string) ($category['id'] ?? '') === (string) ($editPodcast['categoria_id'] ?? '') ? ' selected' : ''; ?>><?php echo e((string) (($category['nombre'] ?? '') ?: ($category['titulo'] ?? ('Categoría #' . ($category['id'] ?? ''))))); ?></option><?php endforeach; ?></select></label><?php endif; ?>
        <?php if (pod_has($podcastColumns, 'fecha')): ?><label>Fecha<input type="date" name="fecha" value="<?php echo e(substr((string) ($editPodcast['fecha'] ?? ''), 0, 10)); ?>"></label><?php endif; ?>
        <label class="pod-span-2">Título<input type="text" name="titulo" value="<?php echo e((string) ($editPodcast['titulo'] ?? '')); ?>" required></label>
        <?php if (pod_has($podcastColumns, 'descripcion')): ?><label class="pod-span-2">Descripción<textarea name="descripcion"><?php echo e((string) ($editPodcast['descripcion'] ?? '')); ?></textarea></label><?php endif; ?>
        <?php if (pod_has($podcastColumns, 'imagen_url')): ?><label class="pod-span-2">Portada principal<input type="url" name="imagen_url" value="<?php echo e((string) ($editPodcast['imagen_url'] ?? '')); ?>" placeholder="https://..."><span class="field-help">URL pública de Cloudflare R2 u otra fuente autorizada.</span></label><?php endif; ?>
        <?php if (pod_has($podcastColumns, 'autor')): ?><label>Autor<input type="text" name="autor" value="<?php echo e((string) ($editPodcast['autor'] ?? '')); ?>"></label><?php endif; ?>
        <?php if (pod_has($podcastColumns, 'estado')): ?><label>Estado<select name="estado"><option value="publicado"<?php echo pod_status_active($editPodcast['estado'] ?? 'publicado') ? ' selected' : ''; ?>>Publicado</option><option value="borrador"<?php echo strtolower((string) ($editPodcast['estado'] ?? '')) === 'borrador' ? ' selected' : ''; ?>>Borrador</option><option value="inactivo"<?php echo strtolower((string) ($editPodcast['estado'] ?? '')) === 'inactivo' ? ' selected' : ''; ?>>Inactivo</option></select></label><?php endif; ?>
        <div class="pod-span-2" style="display:flex;gap:9px"><button class="btn btn-gold" type="submit"><?php echo $editPodcast ? 'Actualizar podcast' : 'Crear podcast'; ?></button><a class="btn btn-soft" href="podcast.php">Cancelar</a></div>
      </form>
    <?php endif; ?>

    <div class="pod-grid">
      <?php foreach ($podcasts as $podcast): $id = (int) ($podcast['id'] ?? 0); ?>
        <article class="pod-card">
          <div class="pod-cover"><?php if (!empty($podcast['imagen_url'])): ?><img src="<?php echo e((string) $podcast['imagen_url']); ?>" alt=""><?php else: ?>LVJ<?php endif; ?></div>
          <div>
            <h3><?php echo e((string) (($podcast['titulo'] ?? '') ?: ('Podcast #' . $id))); ?></h3>
            <div class="pod-meta"><?php echo e((string) (($podcast['autor'] ?? '') ?: 'Autor no definido')); ?><br><?php echo (int) ($episodeCounts[$id] ?? 0); ?> episodios</div>
            <div class="pod-actions"><a class="action-button action-edit" href="podcast.php?podcast_id=<?php echo $id; ?>">Episodios</a><a class="action-button" href="podcast.php?edit_podcast=<?php echo $id; ?>">Editar</a><form method="post" onsubmit="return confirm('¿Eliminar este podcast?');"><?php echo csrf_field(); ?><input type="hidden" name="action" value="delete_podcast"><input type="hidden" name="id" value="<?php echo $id; ?>"><button class="action-button action-delete danger-action" type="submit">Eliminar</button></form></div>
          </div>
        </article>
      <?php endforeach; ?>
      <?php if (!$podcasts): ?><div class="muted">Aún no hay podcasts registrados.</div><?php endif; ?>
    </div>
  </section>
<?php else: ?>
  <?php if (!$selectedPodcast): ?>
    <div class="alert alert-error">El podcast seleccionado no existe.</div>
  <?php else: ?>
    <section class="panel">
      <div class="episode-hero">
        <div class="pod-cover"><?php if (!empty($selectedPodcast['imagen_url'])): ?><img src="<?php echo e((string) $selectedPodcast['imagen_url']); ?>" alt=""><?php else: ?>LVJ<?php endif; ?></div>
        <div><h2 style="margin:0 0 5px"><?php echo e((string) ($selectedPodcast['titulo'] ?? 'Podcast')); ?></h2><p class="muted" style="margin:0"><?php echo e((string) ($selectedPodcast['autor'] ?? '')); ?> · <?php echo count($episodes); ?> episodios</p></div>
        <a class="btn btn-gold" href="podcast.php?podcast_id=<?php echo (int) $podcastId; ?>&amp;new_episode=1">+ Agregar episodio</a>
      </div>

      <?php if ($showEpisodeForm): $ep = $editEpisode ?: []; ?>
        <form method="post" class="pod-form" style="margin-bottom:24px">
          <?php echo csrf_field(); ?>
          <input type="hidden" name="action" value="save_episode"><input type="hidden" name="id" value="<?php echo (int) ($ep['id'] ?? 0); ?>"><input type="hidden" name="podcast_id" value="<?php echo (int) $podcastId; ?>">
          <div class="form-section"><h3>Publicación</h3></div>
          <label>Estado<select name="estado"><option value="publicado"<?php echo (($ep['estado'] ?? 'publicado') === 'publicado') ? ' selected' : ''; ?>>Publicado</option><option value="borrador"<?php echo (($ep['estado'] ?? '') === 'borrador') ? ' selected' : ''; ?>>Borrador</option><option value="inactivo"<?php echo (($ep['estado'] ?? '') === 'inactivo') ? ' selected' : ''; ?>>Inactivo</option></select></label>
          <label>Fecha de publicación<input type="datetime-local" name="fecha_publicacion" value="<?php echo e(pod_date_input($ep['fecha_publicacion'] ?? '')); ?>"></label>

          <div class="form-section"><h3>Audio y portada</h3></div>
          <label class="pod-span-2">Archivo de audio · URL<input type="url" name="audio_url" value="<?php echo e((string) ($ep['audio_url'] ?? '')); ?>" placeholder="https://pub-...r2.dev/.../episodio.mp3" required><span class="field-help">Pega la URL pública del MP3 almacenado en Cloudflare R2.</span></label>
          <label class="pod-span-2">Portada del episodio<input type="url" name="imagen_url" value="<?php echo e((string) ($ep['imagen_url'] ?? '')); ?>" placeholder="https://..."><span class="field-help">Déjala vacía para usar la portada principal del podcast.</span></label>
          <label class="check-row pod-span-2"><input type="checkbox" name="heredar_imagen" value="1"<?php echo empty($ep['imagen_url']) ? ' checked' : ''; ?>> Usar portada principal del podcast</label>

          <div class="form-section"><h3>Información del episodio</h3></div>
          <label class="pod-span-2">Título<input type="text" name="titulo" value="<?php echo e((string) ($ep['titulo'] ?? '')); ?>" required></label>
          <label class="pod-span-2">Descripción<textarea name="descripcion"><?php echo e((string) ($ep['descripcion'] ?? '')); ?></textarea></label>
          <label>Temporada<input type="number" min="1" name="temporada_numero" value="<?php echo (int) ($ep['temporada_numero'] ?? 1); ?>" required></label>
          <label>Número de episodio<input type="number" min="1" name="episodio_numero" value="<?php echo (int) ($ep['episodio_numero'] ?? (count($episodes) + 1)); ?>" required></label>
          <label>Tipo de episodio<select name="tipo_episodio"><option value="full"<?php echo (($ep['tipo_episodio'] ?? 'full') === 'full') ? ' selected' : ''; ?>>Completo</option><option value="trailer"<?php echo (($ep['tipo_episodio'] ?? '') === 'trailer') ? ' selected' : ''; ?>>Tráiler</option><option value="bonus"<?php echo (($ep['tipo_episodio'] ?? '') === 'bonus') ? ' selected' : ''; ?>>Bonus</option></select></label>
          <label>Duración · segundos<input type="number" min="0" name="duracion_segundos" value="<?php echo (int) ($ep['duracion_segundos'] ?? 0); ?>"><span class="field-help">Puede dejarse en 0 hasta automatizar la lectura del MP3.</span></label>
          <label class="check-row"><input type="checkbox" name="explicito" value="1"<?php echo !empty($ep['explicito']) ? ' checked' : ''; ?>> Contenido explícito</label>
          <div class="pod-span-2" style="display:flex;gap:9px"><button class="btn btn-gold" type="submit"><?php echo $editEpisode ? 'Actualizar episodio' : 'Crear episodio'; ?></button><a class="btn btn-soft" href="podcast.php?podcast_id=<?php echo (int) $podcastId; ?>">Cancelar</a></div>
        </form>
      <?php endif; ?>

      <div class="table-wrap">
        <table class="admin-grid-table"><thead><tr><th>#</th><th>Episodio</th><th>Fecha</th><th>Duración</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
          <?php foreach ($episodes as $episode): ?>
            <tr><td class="episode-number">T<?php echo (int) $episode['temporada_numero']; ?> · E<?php echo (int) $episode['episodio_numero']; ?></td><td><div class="episode-title"><?php echo e((string) $episode['titulo']); ?></div><?php if (!empty($episode['audio_url'])): ?><audio class="episode-audio" controls preload="none" src="<?php echo e((string) $episode['audio_url']); ?>"></audio><?php endif; ?></td><td><?php echo e((string) (($episode['fecha_publicacion'] ?? '') ?: 'Sin fecha')); ?></td><td><?php echo (int) ($episode['duracion_segundos'] ?? 0); ?> s</td><td><?php echo e((string) ($episode['estado'] ?? '')); ?></td><td><div class="pod-actions"><a class="action-button action-edit" href="podcast.php?podcast_id=<?php echo (int) $podcastId; ?>&amp;edit_episode=<?php echo (int) $episode['id']; ?>">Editar</a><form method="post" onsubmit="return confirm('¿Eliminar este episodio?');"><?php echo csrf_field(); ?><input type="hidden" name="action" value="delete_episode"><input type="hidden" name="id" value="<?php echo (int) $episode['id']; ?>"><input type="hidden" name="podcast_id" value="<?php echo (int) $podcastId; ?>"><button class="action-button action-delete danger-action" type="submit">Eliminar</button></form></div></td></tr>
          <?php endforeach; ?>
          <?php if (!$episodes): ?><tr><td colspan="6" class="muted" style="text-align:center;padding:30px">Aún no hay episodios. Usa “Agregar episodio”.</td></tr><?php endif; ?>
        </tbody></table>
      </div>
    </section>
  <?php endif; ?>
<?php endif; ?>

<?php require __DIR__ . '/includes/footer.php'; ?>
