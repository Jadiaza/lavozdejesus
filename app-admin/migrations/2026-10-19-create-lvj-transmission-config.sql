-- Configuración independiente de la capa de transmisiones LVJPRAYER.
-- Ejecutar manualmente en la base de datos del panel antes de habilitar el módulo.
-- No modifica ni consulta tablas de Capilla.
CREATE TABLE IF NOT EXISTS lvj_tx_config (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL DEFAULT 'Capa de transmisión LVJPRAYER',
  proveedor VARCHAR(40) NOT NULL DEFAULT 'livepush',
  url_reproduccion VARCHAR(1000) NULL,
  modo_capa ENUM('desactivada','video','intenciones') NOT NULL DEFAULT 'desactivada',
  activa TINYINT(1) NOT NULL DEFAULT 0,
  programada TINYINT(1) NOT NULL DEFAULT 0,
  inicia_en DATETIME NULL,
  termina_en DATETIME NULL,
  segundos_tarjeta TINYINT UNSIGNED NOT NULL DEFAULT 5,
  solo_marcadas_overlay TINYINT(1) NOT NULL DEFAULT 1,
  posicion VARCHAR(30) NOT NULL DEFAULT 'inferior_derecha',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_lvj_tx_config_active (activa, modo_capa, inicia_en, termina_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO lvj_tx_config (id, nombre)
SELECT 1, 'Capa de transmisión LVJPRAYER'
WHERE NOT EXISTS (SELECT 1 FROM lvj_tx_config WHERE id = 1);
