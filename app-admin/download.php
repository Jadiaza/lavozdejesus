<?php

require_once __DIR__ . '/includes/auth.php';
require_login();

$id = (int) ($_GET['id'] ?? 0);
$stmt = lvj_files_db()->prepare("SELECT * FROM lvj_files WHERE id = :id AND status = 1");
$stmt->execute(['id' => $id]);
$file = $stmt->fetch();

if (!$file) {
  http_response_code(404);
  exit('Archivo no encontrado.');
}

$path = realpath(LVJ_FILES_ROOT . '/' . $file['storage_path']);
$root = realpath(LVJ_FILES_UPLOAD_ROOT);

if (!$path || !$root || strpos($path, $root) !== 0 || !is_file($path)) {
  http_response_code(404);
  exit('Archivo no disponible.');
}

log_activity('download', 'file', $id, $file['original_name']);

header('Content-Type: ' . ($file['mime_type'] ?: 'application/octet-stream'));
header('Content-Disposition: attachment; filename="' . basename($file['original_name']) . '"');
header('Content-Length: ' . filesize($path));
readfile($path);
exit;
