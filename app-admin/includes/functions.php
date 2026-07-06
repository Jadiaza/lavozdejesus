<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function e(?string $value): string
{
  return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function redirect_to(string $path)
{
  header('Location: ' . $path);
  exit;
}

function csrf_token(): string
{
  if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
  }

  return $_SESSION['csrf_token'];
}

function csrf_field(): string
{
  return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">';
}

function verify_csrf(): void
{
  $token = $_POST['csrf_token'] ?? '';
  if (!is_string($token) || !hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
    http_response_code(403);
    exit('Solicitud no valida.');
  }
}

function current_user(): ?array
{
  return $_SESSION['file_admin_user'] ?? null;
}

function log_activity(string $action, string $entityType, ?int $entityId = null, string $details = ''): void
{
  try {
    $user = current_user();
    $stmt = lvj_files_db()->prepare("
      INSERT INTO lvj_file_logs (user_id, action, entity_type, entity_id, details, ip)
      VALUES (:user_id, :action, :entity_type, :entity_id, :details, :ip)
    ");
    $stmt->execute([
      'user_id' => $user['id'] ?? null,
      'action' => $action,
      'entity_type' => $entityType,
      'entity_id' => $entityId,
      'details' => $details,
      'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]);
  } catch (Throwable $error) {
    // Los logs no deben romper operaciones principales.
  }
}

function format_bytes(int $bytes): string
{
  if ($bytes >= 1073741824) return round($bytes / 1073741824, 2) . ' GB';
  if ($bytes >= 1048576) return round($bytes / 1048576, 2) . ' MB';
  if ($bytes >= 1024) return round($bytes / 1024, 2) . ' KB';
  return $bytes . ' B';
}

function allowed_extensions(): array
{
  return [
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
    'mp3', 'wav', 'm4a', 'ogg',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt',
    'mp4', 'mov', 'webm',
  ];
}

function blocked_extensions(): array
{
  return ['php', 'phtml', 'phar', 'js', 'html', 'htm', 'exe', 'sh', 'bat', 'cmd', 'com', 'msi', 'jsp', 'asp', 'aspx', 'cgi', 'pl', 'py'];
}

function safe_upload_category(string $category): string
{
  $allowed = ['imagenes', 'audios', 'documentos', 'videos', 'liturgia', 'santoral', 'rosario', 'capilla', 'logos', 'fondos'];
  return in_array($category, $allowed, true) ? $category : 'documentos';
}

function folder_options(?int $selected = null): string
{
  $rows = lvj_files_db()->query("SELECT id, name FROM lvj_file_folders ORDER BY sort_order ASC, name ASC")->fetchAll();
  $html = '<option value="">Sin carpeta</option>';
  foreach ($rows as $row) {
    $isSelected = (int) $row['id'] === (int) $selected ? ' selected' : '';
    $html .= '<option value="' . (int) $row['id'] . '"' . $isSelected . '>' . e($row['name']) . '</option>';
  }
  return $html;
}

function get_folder_category(?int $folderId): string
{
  if (!$folderId) return 'documentos';
  $stmt = lvj_files_db()->prepare("SELECT category FROM lvj_file_folders WHERE id = :id");
  $stmt->execute(['id' => $folderId]);
  return safe_upload_category((string) ($stmt->fetchColumn() ?: 'documentos'));
}
