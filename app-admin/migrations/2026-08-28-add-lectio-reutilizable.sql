-- Lectio Divina reutilizable por cita bíblica exacta.
-- NO ejecutar automáticamente en producción. Respaldar y validar primero.
-- Alcance exclusivo: lvj_lit_lectio_divina.
-- La columna fecha conserva la fecha de origen/primera generación.

SET @lvj_schema := DATABASE();

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND COLUMN_NAME='cita') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD COLUMN cita VARCHAR(160) NULL AFTER fecha',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND COLUMN_NAME='cita_clave') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD COLUMN cita_clave VARCHAR(190) NULL AFTER cita',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND COLUMN_NAME='frase_destacada') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD COLUMN frase_destacada TEXT NULL AFTER cita_clave',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND COLUMN_NAME='generada_ia') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD COLUMN generada_ia TINYINT(1) NOT NULL DEFAULT 0 AFTER audio_url',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND COLUMN_NAME='modelo_ia') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD COLUMN modelo_ia VARCHAR(120) NULL AFTER generada_ia',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND COLUMN_NAME='prompt_version') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD COLUMN prompt_version VARCHAR(40) NULL AFTER modelo_ia',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND COLUMN_NAME='revisado_at') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD COLUMN revisado_at DATETIME NULL AFTER prompt_version',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND INDEX_NAME='uq_lvj_lit_lectio_cita_clave') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD UNIQUE KEY uq_lvj_lit_lectio_cita_clave (cita_clave)',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;

-- No se modifica lvj_lit_lectura_dia, lvj_lit_dia, Biblia ni otros módulos.
