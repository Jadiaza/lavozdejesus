<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

$pdo = lvj_files_db();
$folderId = isset($_GET['folder']) ? (int) $_GET['folder'] : 0;

$sql = "
  SELECT f.*, folder.name AS folder_name, user.name AS uploaded_by_name
  FROM lvj_files f
  LEFT JOIN lvj_file_folders folder ON folder.id = f.folder_id
  LEFT JOIN lvj_file_users user ON user.id = f.uploaded_by
  WHERE f.status = 1
";
$params = [];

if ($folderId > 0) {
  $sql .= " AND f.folder_id = :folder_id";
  $params['folder_id'] = $folderId;
}

$sql .= " ORDER BY f.created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$files = $stmt->fetchAll();

$pageTitle = 'Archivos';
$pageSubtitle = 'Listado y administracion de recursos';
require __DIR__ . '/includes/header.php';
?>

<section class="panel">
  <div class="panel-header">
    <h2>Archivos cargados</h2>
    <a class="btn btn-gold" href="upload.php">Subir archivo</a>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Archivo</th>
          <th>Carpeta</th>
          <th>Tamano</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($files as $file): ?>
          <tr>
            <td>
              <strong><?php echo e($file['title']); ?></strong>
              <small><?php echo e($file['original_name']); ?></small>
            </td>
            <td><?php echo e($file['folder_name'] ?? 'Sin carpeta'); ?></td>
            <td><?php echo e(format_bytes((int) $file['size_bytes'])); ?></td>
            <td><?php echo e($file['created_at']); ?></td>
            <td class="actions">
              <a href="download.php?id=<?php echo (int) $file['id']; ?>">Descargar</a>
              <a href="edit_file.php?id=<?php echo (int) $file['id']; ?>">Editar</a>
              <form method="post" action="delete_file.php" onsubmit="return confirm('Eliminar este archivo?');">
                <?php echo csrf_field(); ?>
                <input type="hidden" name="id" value="<?php echo (int) $file['id']; ?>">
                <button type="submit">Eliminar</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
        <?php if (!$files): ?>
          <tr><td colspan="5" class="muted">No hay archivos registrados.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
