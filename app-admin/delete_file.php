<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit('Metodo no permitido.');
}

verify_csrf();

$id = (int) ($_POST['id'] ?? 0);
$stmt = lvj_files_db()->prepare("SELECT * FROM lvj_files WHERE id = :id AND status = 1");
$stmt->execute(['id' => $id]);
$file = $stmt->fetch();

if ($file) {
  $path = LVJ_FILES_ROOT . '/' . $file['storage_path'];
  if (is_file($path)) {
    unlink($path);
  }

  $delete = lvj_files_db()->prepare("UPDATE lvj_files SET status = 0 WHERE id = :id");
  $delete->execute(['id' => $id]);
  log_activity('delete', 'file', $id, $file['original_name']);
}

redirect_to('files.php');
