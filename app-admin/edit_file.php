<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$id = (int) ($_GET['id'] ?? $_POST['id'] ?? 0);

$stmt = $pdo->prepare("SELECT * FROM lvj_files WHERE id = :id AND status = 1");
$stmt->execute(['id' => $id]);
$file = $stmt->fetch();

if (!$file) {
  http_response_code(404);
  exit('Archivo no encontrado.');
}

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();
  $update = $pdo->prepare("
    UPDATE lvj_files
    SET title = :title, description = :description, folder_id = :folder_id
    WHERE id = :id
  ");
  $update->execute([
    'title' => trim((string) ($_POST['title'] ?? $file['title'])),
    'description' => trim((string) ($_POST['description'] ?? '')),
    'folder_id' => (int) ($_POST['folder_id'] ?? 0) ?: null,
    'id' => $id,
  ]);
  log_activity('update', 'file', $id, $file['original_name']);
  $message = 'Metadatos actualizados.';

  $stmt->execute(['id' => $id]);
  $file = $stmt->fetch();
}

$pageTitle = 'Editar archivo';
$pageSubtitle = $file['original_name'];
require __DIR__ . '/includes/header.php';
?>

<section class="panel narrow">
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <form method="post" class="form-grid">
    <?php echo csrf_field(); ?>
    <input type="hidden" name="id" value="<?php echo (int) $file['id']; ?>">

    <label>Titulo</label>
    <input type="text" name="title" value="<?php echo e($file['title']); ?>" required>

    <label>Carpeta</label>
    <select name="folder_id"><?php echo folder_options((int) ($file['folder_id'] ?? 0)); ?></select>

    <label>Descripcion</label>
    <textarea name="description" rows="5"><?php echo e($file['description']); ?></textarea>

    <button class="btn btn-gold" type="submit">Guardar cambios</button>
  </form>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
