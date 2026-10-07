-- Audiencia de Radio LVJ.
-- Registra sesiones de escucha tanto de usuarios registrados como de oyentes invitados.
-- usuario_id se relaciona lógicamente con lvj_com_usuarios.id; se evita una FK física
-- para mantener compatibilidad con instalaciones donde el esquema de usuarios difiere.

CREATE TABLE IF NOT EXISTS lvj_rad_sesiones (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NULL,
  session_token_hash CHAR(64) NOT NULL,
  stream_id BIGINT UNSIGNED NULL,
  stream_nombre VARCHAR(180) NULL,
  inicio_at DATETIME NOT NULL,
  ultima_actividad_at DATETIME NOT NULL,
  fin_at DATETIME NULL,
  duracion_segundos INT UNSIGNED NOT NULL DEFAULT 0,
  tipo_oyente VARCHAR(20) NOT NULL DEFAULT 'invitado',
  dispositivo VARCHAR(40) NULL,
  sistema_operativo VARCHAR(80) NULL,
  navegador VARCHAR(120) NULL,
  pais VARCHAR(100) NULL,
  region VARCHAR(120) NULL,
  ciudad VARCHAR(120) NULL,
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(500) NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lvj_rad_sesion_token (session_token_hash),
  KEY idx_lvj_rad_sesion_usuario_fecha (usuario_id, inicio_at),
  KEY idx_lvj_rad_sesion_estado_actividad (estado, ultima_actividad_at),
  KEY idx_lvj_rad_sesion_fecha (inicio_at),
  KEY idx_lvj_rad_sesion_pais (pais),
  KEY idx_lvj_rad_sesion_ciudad (ciudad),
  KEY idx_lvj_rad_sesion_stream (stream_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lvj_rad_eventos_audiencia (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sesion_id BIGINT UNSIGNED NOT NULL,
  evento VARCHAR(40) NOT NULL,
  fecha_at DATETIME NOT NULL,
  metadata_json JSON NULL,
  PRIMARY KEY (id),
  KEY idx_lvj_rad_evento_sesion_fecha (sesion_id, fecha_at),
  KEY idx_lvj_rad_evento_tipo_fecha (evento, fecha_at),
  CONSTRAINT fk_lvj_rad_evento_sesion
    FOREIGN KEY (sesion_id) REFERENCES lvj_rad_sesiones(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;