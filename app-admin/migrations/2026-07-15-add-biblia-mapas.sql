-- Mapas bíblicos: primera etapa (galería estática administrable).
-- Las imágenes se consumen mediante URL pública; MySQL conserva solo sus metadatos.

CREATE TABLE IF NOT EXISTS lvj_bib_mapas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  periodo VARCHAR(100) NULL,
  imagen_url VARCHAR(500) NOT NULL,
  fuente VARCHAR(200) NULL,
  fuente_url VARCHAR(500) NULL,
  licencia VARCHAR(120) NULL,
  orden INT NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_bib_mapas_publicados (estado, orden, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
