-- Conecta el muro de intenciones de la Capilla Virtual con MySQL.
-- Compatible con MySQL 8.x y MariaDB 10.6.

CREATE TABLE IF NOT EXISTS lvj_com_peticiones_oracion (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id BIGINT UNSIGNED NULL,
  nombre VARCHAR(100) NOT NULL DEFAULT '',
  ciudad VARCHAR(100) NOT NULL DEFAULT '',
  peticion VARCHAR(300) NOT NULL,
  categoria VARCHAR(30) NOT NULL DEFAULT 'peticion',
  anonimo TINYINT(1) NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  total_oraciones INT UNSIGNED NOT NULL DEFAULT 0,
  es_urgente TINYINT(1) NOT NULL DEFAULT 0,
  destacada TINYINT(1) NOT NULL DEFAULT 0,
  mostrar_overlay TINYINT(1) NOT NULL DEFAULT 0,
  fecha_publicacion DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_peticiones_publicas (estado, deleted_at, fecha_publicacion),
  KEY idx_peticiones_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lvj_com_peticiones_apoyos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  peticion_id BIGINT UNSIGNED NOT NULL,
  identificador_sesion VARCHAR(128) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_peticion_apoyo_sesion (peticion_id, identificador_sesion),
  KEY idx_peticiones_apoyos_peticion (peticion_id),
  CONSTRAINT fk_peticiones_apoyos_peticion
    FOREIGN KEY (peticion_id) REFERENCES lvj_com_peticiones_oracion (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
