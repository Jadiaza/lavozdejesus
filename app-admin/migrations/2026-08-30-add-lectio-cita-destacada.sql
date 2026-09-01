-- Cita bíblica correspondiente a la frase destacada de Lectio Divina.
-- NO ejecutar automáticamente en producción. Respaldar y validar primero.
SET @lvj_schema := DATABASE();
SET @lvj_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA=@lvj_schema AND TABLE_NAME='lvj_lit_lectio_divina' AND COLUMN_NAME='cita_destacada') = 0,
  'ALTER TABLE lvj_lit_lectio_divina ADD COLUMN cita_destacada VARCHAR(80) NULL AFTER frase_destacada',
  'SELECT 1'
);
PREPARE lvj_stmt FROM @lvj_sql; EXECUTE lvj_stmt; DEALLOCATE PREPARE lvj_stmt;