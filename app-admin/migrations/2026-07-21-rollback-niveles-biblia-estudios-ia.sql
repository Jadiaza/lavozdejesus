-- Reversión estructural de los niveles de estudios bíblicos IA.
-- Antes de aplicarla, verificar que no existan estudios de niveles distintos de Formador.

ALTER TABLE lvj_bib_estudios_ia
  DROP KEY idx_bib_estudio_nivel_estado,
  DROP KEY idx_bib_estudio_cobertura,
  DROP COLUMN notas_version,
  DROP COLUMN texto_version,
  DROP COLUMN esquema_version,
  DROP COLUMN idioma,
  DROP COLUMN nivel;
