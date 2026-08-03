-- Reversión estructural. Verificar antes que no existan estudios nuevos.

ALTER TABLE lvj_bib_estudios_ia
  DROP INDEX idx_bib_estudio_metodo_nivel,
  DROP COLUMN tecnica_estructural,
  DROP COLUMN modelo_referencia,
  DROP COLUMN metodo,
  MODIFY COLUMN nivel ENUM('pastoral','teologico','doctrinal','formador') NOT NULL DEFAULT 'formador';
