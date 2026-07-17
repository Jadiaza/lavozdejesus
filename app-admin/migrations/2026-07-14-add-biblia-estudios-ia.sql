-- Estudios bíblicos asistidos por IA.
-- Aplicar después de verificar que existen lvj_bib_libros y lvj_com_usuarios.

CREATE TABLE IF NOT EXISTS lvj_bib_estudios_ia (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  libro_id BIGINT UNSIGNED NOT NULL,
  capitulo_inicio INT NOT NULL,
  versiculo_inicio INT NOT NULL,
  capitulo_fin INT NOT NULL,
  versiculo_fin INT NOT NULL,
  referencia VARCHAR(120) NOT NULL,
  titulo VARCHAR(255) NULL,
  metodo_version VARCHAR(30) NOT NULL DEFAULT '1.0',
  proveedor_ia VARCHAR(50) NULL,
  modelo_ia VARCHAR(100) NULL,
  contenido_json LONGTEXT NOT NULL,
  contenido_html LONGTEXT NULL,
  hash_contexto CHAR(64) NOT NULL,
  estado ENUM('generando','revision','publicado','error','archivado') NOT NULL DEFAULT 'generando',
  revisado TINYINT(1) NOT NULL DEFAULT 0,
  revisado_por BIGINT UNSIGNED NULL,
  es_publico TINYINT(1) NOT NULL DEFAULT 0,
  tokens_entrada INT NULL,
  tokens_salida INT NULL,
  costo_estimado DECIMAL(12,6) NULL,
  error_mensaje TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  UNIQUE KEY uq_bib_estudio_contexto_metodo (hash_contexto, metodo_version),
  KEY idx_bib_estudio_referencia (libro_id, capitulo_inicio, versiculo_inicio),
  KEY idx_bib_estudio_estado (estado),
  KEY idx_bib_estudio_publico (es_publico),
  CONSTRAINT fk_bib_estudio_libro FOREIGN KEY (libro_id) REFERENCES lvj_bib_libros(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lvj_bib_estudios_ia_solicitudes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  estudio_id BIGINT UNSIGNED NULL,
  usuario_id BIGINT UNSIGNED NULL,
  referencia VARCHAR(120) NOT NULL,
  estado ENUM('pendiente','procesando','completada','error') NOT NULL DEFAULT 'pendiente',
  origen ENUM('lector','liturgia','plan','administrador') NOT NULL DEFAULT 'lector',
  consume_cupo TINYINT(1) NOT NULL DEFAULT 1,
  error_mensaje TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  KEY idx_bib_solicitud_usuario_fecha (usuario_id, created_at),
  KEY idx_bib_solicitud_estado (estado),
  KEY idx_bib_solicitud_estudio (estudio_id),
  CONSTRAINT fk_bib_solicitud_estudio FOREIGN KEY (estudio_id) REFERENCES lvj_bib_estudios_ia(id),
  CONSTRAINT fk_bib_solicitud_usuario FOREIGN KEY (usuario_id) REFERENCES lvj_com_usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
