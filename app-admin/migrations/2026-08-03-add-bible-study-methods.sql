-- Implementa método y nivel como dimensiones independientes.
-- No ejecutar automáticamente en producción. Respaldar y validar primero.

ALTER TABLE lvj_bib_estudios_ia
  ADD COLUMN metodo ENUM('metodo_salmo','integral_lvj') NULL AFTER titulo,
  MODIFY COLUMN nivel ENUM('pastoral','teologico','doctrinal','formador','formativo') NOT NULL DEFAULT 'formativo',
  ADD COLUMN modelo_referencia VARCHAR(50) NULL AFTER esquema_version,
  ADD COLUMN tecnica_estructural VARCHAR(50) NULL AFTER modelo_referencia,
  ADD INDEX idx_bib_estudio_metodo_nivel (metodo, nivel, esquema_version);

-- Inferencia segura exclusivamente para el esquema histórico conocido.
UPDATE lvj_bib_estudios_ia
SET metodo = 'metodo_salmo',
    modelo_referencia = COALESCE(modelo_referencia, 'salmo8-1.0')
WHERE metodo IS NULL
  AND esquema_version = 'salmo8-1.0';

-- Los registros cuyo método no puede inferirse permanecen NULL y la API los
-- presenta como metodo_no_determinado. No se reescriben estudios publicados.
