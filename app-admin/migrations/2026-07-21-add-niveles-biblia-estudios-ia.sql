-- Niveles y versionado del formato maestro de estudios bíblicos IA.
-- Conserva los estudios existentes como nivel Formador, equivalente al esquema completo previo.

ALTER TABLE lvj_bib_estudios_ia
  ADD COLUMN nivel ENUM('pastoral','teologico','doctrinal','formador') NOT NULL DEFAULT 'formador' AFTER titulo,
  ADD COLUMN idioma VARCHAR(10) NOT NULL DEFAULT 'es' AFTER nivel,
  ADD COLUMN esquema_version VARCHAR(30) NOT NULL DEFAULT 'salmo8-1.0' AFTER metodo_version,
  ADD COLUMN texto_version VARCHAR(100) NOT NULL DEFAULT 'SPAPLATENSE+TORRESAMAT' AFTER esquema_version,
  ADD COLUMN notas_version VARCHAR(100) NOT NULL DEFAULT '1' AFTER texto_version,
  ADD KEY idx_bib_estudio_cobertura (libro_id,nivel,idioma,esquema_version,capitulo_inicio,capitulo_fin,versiculo_inicio,versiculo_fin),
  ADD KEY idx_bib_estudio_nivel_estado (nivel,estado);

-- La unicidad física continúa garantizada por hash_contexto + metodo_version.
-- El hash nuevo incorpora nivel, idioma, esquema, textos y notas.
