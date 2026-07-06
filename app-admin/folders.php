<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $name = trim((string) ($_POST['name'] ?? ''));
  $category = safe_upload_category((string) ($_POST['category'] ?? 'documentos'));
  $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
  $slug = trim($slug ?: $category . '-' . time(), '-');

  $stmt = $pdo->prepare("INSERT IGNORE INTO lvj_file_folders (name, slug, category) VALUES (:name, :slug, :category)");
  $stmt->execute(['name' => $name, 'slug' => $slug, 'category' => $category]);
  log_activity('create', 'folder', (int) $pdo->lastInsertId(), $name);
  $message = 'Carpeta guardada.';
}

$folders = $pdo->query("
  SELECT folder.*, COUNT(file.id) AS total_files
  FROM lvj_file_folders folder
  LEFT JOIN lvj_files file ON file.folder_id = folder.id AND file.status = 1
  GROUP BY folder.id
  ORDER BY folder.sort_order ASC, folder.name ASC
")->fetchAll();

$pageTitle = 'Carpetas';
$pageSubtitle = 'Categorias para organizar recursos';
require __DIR__ . '/includes/header.php';
?>

<section class="panel narrow">
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <form method="post" class="form-inline">
    <?php echo csrf_field(); ?>
    <input type="text" name="name" placeholder="Nueva carpeta" required>
    <select name="category">
      <?php foreach (['imagenes','audios','documentos','videos','liturgia','santoral','rosario','capilla','logos','fondos'] as $category): ?>
        <option value="<?php echo e($category); ?>"><?php echo e(ucfirst($category)); ?></option>
      <?php endforeach; ?>
    </select>
    <button class="btn btn-gold" type="submit">Crear</button>
  </form>
</section>

<section class="panel">
  <div class="cards-grid">
    <?php foreach ($folders as $folder): ?>
      <a class="folder-card" href="files.php?folder=<?php echo (int) $folder['id']; ?>">
        <strong><?php echo e($folder['name']); ?></strong>
        <span><?php echo e($folder['category']); ?></span>
        <small><?php echo (int) $folder['total_files']; ?> archivos</small>
      </a>
    <?php endforeach; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
