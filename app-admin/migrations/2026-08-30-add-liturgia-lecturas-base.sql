-- Biblioteca reutilizable de lecturas por ciclo litúrgico.
-- NO ejecutar automáticamente en producción. Respaldar y validar primero.
-- Conserva lvj_lit_lectura_dia como asignación diaria canónica y no elimina datos.
CREATE TABLE IF NOT EXISTS lvj_lit_lecturas_base (
 id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, clave_liturgica VARCHAR(190) NOT NULL, hash_contenido CHAR(64) NOT NULL,
 pais CHAR(2) NOT NULL DEFAULT 'CO', rito VARCHAR(40) NOT NULL DEFAULT 'romano', ciclo_dominical CHAR(1) NULL, ciclo_ferial VARCHAR(2) NULL,
 tiempo_liturgico VARCHAR(120) NULL, celebracion VARCHAR(255) NULL, grado_celebracion VARCHAR(120) NULL, color_liturgico VARCHAR(60) NULL,
 primera_lectura_cita VARCHAR(255) NULL, primera_lectura_texto LONGTEXT NULL, salmo_cita VARCHAR(255) NULL, salmo_respuesta TEXT NULL, salmo_texto LONGTEXT NULL,
 segunda_lectura_cita VARCHAR(255) NULL, segunda_lectura_texto LONGTEXT NULL, evangelio_cita VARCHAR(255) NULL, evangelio_texto LONGTEXT NULL,
 fuente VARCHAR(120) NULL, fuente_edicion VARCHAR(120) NULL, version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
 created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY (id), UNIQUE KEY uq_lvj_lit_base_clave_hash (clave_liturgica, hash_contenido), KEY idx_lvj_lit_base_ciclos (ciclo_dominical, ciclo_ferial), KEY idx_lvj_lit_base_hash (hash_contenido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET @lvj_schema := DATABASE();
SET @lvj_sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectura_dia' AND COLUMN_NAME='lectura_base_id')=0,'ALTER TABLE lvj_lit_lectura_dia ADD COLUMN lectura_base_id BIGINT UNSIGNED NULL AFTER id','SELECT 1');
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;
SET @lvj_sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectura_dia' AND COLUMN_NAME='ciclo_dominical')=0,'ALTER TABLE lvj_lit_lectura_dia ADD COLUMN ciclo_dominical CHAR(1) NULL AFTER fecha','SELECT 1');
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;
SET @lvj_sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectura_dia' AND COLUMN_NAME='ciclo_ferial')=0,'ALTER TABLE lvj_lit_lectura_dia ADD COLUMN ciclo_ferial VARCHAR(2) NULL AFTER ciclo_dominical','SELECT 1');
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;
SET @lvj_sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectura_dia' AND COLUMN_NAME='clave_liturgica')=0,'ALTER TABLE lvj_lit_lectura_dia ADD COLUMN clave_liturgica VARCHAR(190) NULL AFTER ciclo_ferial','SELECT 1');
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;
SET @lvj_sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectura_dia' AND COLUMN_NAME='hash_contenido')=0,'ALTER TABLE lvj_lit_lectura_dia ADD COLUMN hash_contenido CHAR(64) NULL AFTER clave_liturgica','SELECT 1');
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;
SET @lvj_sql := IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectura_dia' AND INDEX_NAME='idx_lvj_lit_dia_base')=0,'ALTER TABLE lvj_lit_lectura_dia ADD KEY idx_lvj_lit_dia_base (lectura_base_id)','SELECT 1');
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;
-- La FK se omite hasta verificar que los tipos físicos sean compatibles.
-- Los registros históricos permanecen intactos y siguen funcionando como datos legacy.