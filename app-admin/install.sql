CREATE TABLE IF NOT EXISTS lvj_file_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(160) NOT NULL,
  role VARCHAR(60) NOT NULL DEFAULT 'admin',
  status TINYINT NOT NULL DEFAULT 1,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO lvj_file_users (email, password_hash, name, role, status)
VALUES (
  'admin@lavozdejesus.com',
  '$2y$10$E9NmAq.3ipVhGfAG8H7i1OH9cl5keYeykt4C1P4rC7rCaNMqvpLiS',
  'Administrador',
  'super_admin',
  1
);

INSERT IGNORE INTO lvj_file_folders (name, slug, category) VALUES
('Imagenes', 'imagenes', 'imagenes'),
('Audios', 'audios', 'audios'),
('Documentos', 'documentos', 'documentos'),
('Videos', 'videos', 'videos'),
('Liturgia', 'liturgia', 'liturgia'),
('Santoral', 'santoral', 'santoral'),
('Rosario', 'rosario', 'rosario'),
('Capilla', 'capilla', 'capilla'),
('Logos', 'logos', 'logos'),
('Fondos', 'fondos', 'fondos');
