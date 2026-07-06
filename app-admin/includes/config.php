<?php

declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
  session_start();
}

define('LVJ_FILES_ROOT', dirname(__DIR__));
define('LVJ_FILES_UPLOAD_ROOT', LVJ_FILES_ROOT . '/uploads');
define('LVJ_FILES_BASE_URL', rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/admin-archivos'), '/'));

function lvj_files_env(string $key, string $fallback = ''): string
{
  $value = getenv($key);
  return $value === false ? $fallback : trim((string) $value);
}

function lvj_files_config(): array
{
  $local = __DIR__ . '/config.local.php';

  if (is_file($local)) {
    $config = require $local;
    if (is_array($config)) {
      return $config;
    }
  }

  return [
    'db_host' => lvj_files_env('MYSQL_HOST', 'localhost'),
    'db_name' => lvj_files_env('MYSQL_DATABASE', 'lavozdej_Radio'),
    'db_user' => lvj_files_env('MYSQL_USER'),
    'db_pass' => lvj_files_env('MYSQL_PASSWORD'),
  ];
}

function lvj_files_db(): PDO
{
  static $pdo = null;

  if ($pdo instanceof PDO) {
    return $pdo;
  }

  $config = lvj_files_config();
  $dsn = sprintf(
    'mysql:host=%s;dbname=%s;charset=utf8mb4',
    $config['db_host'] ?? 'localhost',
    $config['db_name'] ?? ''
  );

  $pdo = new PDO($dsn, $config['db_user'] ?? '', $config['db_pass'] ?? '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);

  return $pdo;
}

function lvj_files_install(): void
{
  $pdo = lvj_files_db();

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS lvj_file_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(180) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(160) NOT NULL,
      role VARCHAR(60) NOT NULL DEFAULT 'admin',
      status TINYINT NOT NULL DEFAULT 1,
      last_login DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS lvj_file_folders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(180) NOT NULL UNIQUE,
      category VARCHAR(80) NOT NULL DEFAULT 'documentos',
      parent_id INT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_lvj_file_folders_parent
        FOREIGN KEY (parent_id) REFERENCES lvj_file_folders(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS lvj_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      folder_id INT NULL,
      uploaded_by INT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      title VARCHAR(180) NOT NULL,
      description TEXT NULL,
      mime_type VARCHAR(160) NULL,
      extension VARCHAR(20) NOT NULL,
      size_bytes BIGINT NOT NULL DEFAULT 0,
      storage_path VARCHAR(500) NOT NULL,
      public_url VARCHAR(500) NULL,
      status TINYINT NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_lvj_files_folder (folder_id),
      INDEX idx_lvj_files_status (status),
      CONSTRAINT fk_lvj_files_folder
        FOREIGN KEY (folder_id) REFERENCES lvj_file_folders(id)
        ON DELETE SET NULL,
      CONSTRAINT fk_lvj_files_user
        FOREIGN KEY (uploaded_by) REFERENCES lvj_file_users(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS lvj_file_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      action VARCHAR(80) NOT NULL,
      entity_type VARCHAR(80) NOT NULL,
      entity_id INT NULL,
      details TEXT NULL,
      ip VARCHAR(80) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_lvj_file_logs_user (user_id),
      CONSTRAINT fk_lvj_file_logs_user
        FOREIGN KEY (user_id) REFERENCES lvj_file_users(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  ");

  $count = (int) $pdo->query("SELECT COUNT(*) FROM lvj_file_users")->fetchColumn();
  if ($count === 0) {
    $stmt = $pdo->prepare("
      INSERT INTO lvj_file_users (email, password_hash, name, role, status)
      VALUES (:email, :password_hash, :name, :role, 1)
    ");
    $stmt->execute([
      'email' => 'admin@lavozdejesus.co',
      'password_hash' => password_hash('Cambiar123*', PASSWORD_DEFAULT),
      'name' => 'Administrador',
      'role' => 'super_admin',
    ]);
  }

  $folders = [
    ['Imagenes', 'imagenes', 'imagenes'],
    ['Audios', 'audios', 'audios'],
    ['Documentos', 'documentos', 'documentos'],
    ['Videos', 'videos', 'videos'],
    ['Liturgia', 'liturgia', 'liturgia'],
    ['Santoral', 'santoral', 'santoral'],
    ['Rosario', 'rosario', 'rosario'],
    ['Capilla', 'capilla', 'capilla'],
    ['Logos', 'logos', 'logos'],
    ['Fondos', 'fondos', 'fondos'],
  ];

  $stmt = $pdo->prepare("
    INSERT IGNORE INTO lvj_file_folders (name, slug, category)
    VALUES (:name, :slug, :category)
  ");

  foreach ($folders as [$name, $slug, $category]) {
    $stmt->execute([
      'name' => $name,
      'slug' => $slug,
      'category' => $category,
    ]);
  }
}

try {
  lvj_files_install();
} catch (Throwable $error) {
  if (!defined('LVJ_FILES_INSTALL_ERROR')) {
    define('LVJ_FILES_INSTALL_ERROR', $error->getMessage());
  }
}
