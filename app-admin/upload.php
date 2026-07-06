<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  verify_csrf();

  try {
    if (empty($_FILES['file']['tmp_name']) || !is_uploaded_file($_FILES['file']['tmp_name'])) {
      throw new RuntimeException('Selecciona un archivo valido.');
    }

    $folderId = (int) ($_POST['folder_id'] ?? 0);
    $title = trim((string) ($_POST['title'] ?? ''));
    $description = trim((string) ($_POST['description'] ?? ''));
    $originalName = basename((string) $_FILES['file']['name']);
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    if (!$extension || in_array($extension, blocked_extensions(), true) || !in_array($extension, allowed_extensions(), true)) {
      throw new RuntimeException('Tipo de archivo no permitido.');
    }

    $category = get_folder_category($folderId ?: null);
    $uploadDir = LVJ_FILES_UPLOAD_ROOT . '/' . $category;
    if (!is_dir($uploadDir)) {
      mkdir($uploadDir, 0755, true);
    }

    $storedName = date('YmdHis') . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
    $target = $uploadDir . '/' . $storedName;

    if (!move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
      throw new RuntimeException('No se pudo guardar el archivo.');
    }

    $relativePath = 'uploads/' . $category . '/' . $storedName;
    $stmt = lvj_files_db()->prepare("
      INSERT INTO lvj_files
      (folder_id, uploaded_by, original_name, stored_name, title, description, mime_type, extension, size_bytes, storage_path, public_url)
      VALUES
      (:folder_id, :uploaded_by, :original_name, :stored_name, :title, :description, :mime_type, :extension, :size_bytes, :storage_path, :public_url)
    ");
    $stmt->execute([
      'folder_id' => $folderId ?: null,
      'uploaded_by' => current_user()['id'] ?? null,
      'original_name' => $originalName,
      'stored_name' => $storedName,
      'title' => $title ?: pathinfo($originalName, PATHINFO_FILENAME),
      'description' => $description,
      'mime_type' => mime_content_type($target) ?: '',
      'extension' => $extension,
      'size_bytes' => filesize($target) ?: 0,
      'storage_path' => $relativePath,
      'public_url' => LVJ_FILES_BASE_URL . '/' . $relativePath,
    ]);

    log_activity('upload', 'file', (int) lvj_files_db()->lastInsertId(), $originalName);
    $message = 'Archivo subido correctamente.';
  } catch (Throwable $exception) {
    $error = $exception->getMessage();
  }
}

$pageTitle = 'Subir archivo';
$pageSubtitle = 'Carga segura de recursos para la app';
require __DIR__ . '/includes/header.php';
?>

<section class="panel narrow">
  <?php if ($message): ?><div class="alert alert-success"><?php echo e($message); ?></div><?php endif; ?>
  <?php if ($error): ?><div class="alert alert-error"><?php echo e($error); ?></div><?php endif; ?>

  <form method="post" enctype="multipart/form-data" class="form-grid">
    <?php echo csrf_field(); ?>
    <label>Titulo</label>
    <input type="text" name="title" placeholder="Nombre visible del archivo">

    <label>Carpeta / categoria</label>
    <select name="folder_id"><?php echo folder_options(); ?></select>

    <label>Descripcion</label>
    <textarea name="description" rows="4" placeholder="Uso, fuente o notas del archivo"></textarea>

    <label>Archivo</label>
    <input type="file" name="file" required>

    <button class="btn btn-gold" type="submit">Subir archivo</button>
  </form>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
