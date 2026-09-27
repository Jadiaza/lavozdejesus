-- LVJPRAYER · Podcast
-- Gestión de episodios para el panel administrativo.
-- Compatible con MySQL 8.x / MariaDB 10.6.
-- IMPORTANTE: esta migración es manual. No ejecutar automáticamente en producción.

CREATE TABLE IF NOT EXISTS lvj_pod_episodios (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  podcast_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  audio_url TEXT NOT NULL,
  imagen_url TEXT NULL,
  fecha_publicacion DATETIME NULL,
  duracion_segundos INT UNSIGNED NOT NULL DEFAULT 0,
  temporada_numero INT UNSIGNED NOT NULL DEFAULT 1,
  episodio_numero INT UNSIGNED NOT NULL DEFAULT 1,
  tipo_episodio VARCHAR(20) NOT NULL DEFAULT 'full',
  explicito TINYINT(1) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'publicado',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lvj_pod_episodios_podcast (podcast_id),
  KEY idx_lvj_pod_episodios_orden (podcast_id, temporada_numero, episodio_numero),
  KEY idx_lvj_pod_episodios_estado_fecha (estado, fecha_publicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
