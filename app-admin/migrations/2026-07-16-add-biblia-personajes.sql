-- Personajes bíblicos: primera etapa (galería y ficha editorial administrable).
-- Las imágenes se consumen mediante URL pública; MySQL conserva únicamente sus metadatos.

CREATE TABLE IF NOT EXISTS lvj_bib_personajes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  nombre_alternativo VARCHAR(180) NULL,
  testamento VARCHAR(20) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  resumen TEXT NOT NULL,
  pasajes_principales TEXT NULL,
  ensenanza TEXT NULL,
  imagen_url VARCHAR(500) NOT NULL,
  fuente VARCHAR(200) NOT NULL,
  fuente_url VARCHAR(500) NULL,
  licencia VARCHAR(120) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_bib_personajes_publicados (estado, orden, deleted_at),
  KEY idx_bib_personajes_filtros (testamento, categoria, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
