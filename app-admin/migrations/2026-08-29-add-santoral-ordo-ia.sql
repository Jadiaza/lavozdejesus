-- Santoral automático desde Ordo Colombiano con revisión humana.
-- NO ejecutar automáticamente en producción. Respaldar y validar primero.
-- Alcance exclusivo: lvj_san_santo_dia.

SET @lvj_schema := DATABASE();

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_san_santo_dia' AND COLUMN_NAME='ordo_santo_id') = 0,
  'ALTER TABLE lvj_san_santo_dia ADD COLUMN ordo_santo_id VARCHAR(60) NULL AFTER id',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_san_santo_dia' AND COLUMN_NAME='generada_ia') = 0,
  'ALTER TABLE lvj_san_santo_dia ADD COLUMN generada_ia TINYINT(1) NOT NULL DEFAULT 0 AFTER orden',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_san_santo_dia' AND COLUMN_NAME='modelo_ia') = 0,
  'ALTER TABLE lvj_san_santo_dia ADD COLUMN modelo_ia VARCHAR(120) NULL AFTER generada_ia',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_san_santo_dia' AND COLUMN_NAME='prompt_version') = 0,
  'ALTER TABLE lvj_san_santo_dia ADD COLUMN prompt_version VARCHAR(40) NULL AFTER modelo_ia',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_san_santo_dia' AND COLUMN_NAME='revisado_at') = 0,
  'ALTER TABLE lvj_san_santo_dia ADD COLUMN revisado_at DATETIME NULL AFTER prompt_version',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_san_santo_dia' AND INDEX_NAME='uq_lvj_san_ordo_santo_id') = 0,
  'ALTER TABLE lvj_san_santo_dia ADD UNIQUE KEY uq_lvj_san_ordo_santo_id (ordo_santo_id)',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

-- No se modifica ninguna otra tabla ni se crea una relación física nueva.
