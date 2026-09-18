-- Biblioteca de oraciones LVJPRAYER.
-- Amplía la tabla existente sin borrar ni renombrar información.

ALTER TABLE lvj_ora_oraciones
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) NOT NULL DEFAULT 'independiente' AFTER devocion_id,
  ADD COLUMN IF NOT EXISTS subtitulo VARCHAR(255) NULL AFTER titulo,
  ADD COLUMN IF NOT EXISTS texto_completo LONGTEXT NULL AFTER descripcion,
  ADD COLUMN IF NOT EXISTS contenido_json LONGTEXT NULL AFTER texto_completo,
  ADD COLUMN IF NOT EXISTS tema_visual VARCHAR(50) NOT NULL DEFAULT 'oracion' AFTER contenido_json,
  ADD COLUMN IF NOT EXISTS audio_url VARCHAR(500) NULL AFTER imagen,
  ADD COLUMN IF NOT EXISTS fuente VARCHAR(255) NULL AFTER audio_url,
  ADD COLUMN IF NOT EXISTS pagina_fuente VARCHAR(50) NULL AFTER fuente,
  ADD COLUMN IF NOT EXISTS derechos_revisados TINYINT(1) NOT NULL DEFAULT 0 AFTER pagina_fuente,
  ADD COLUMN IF NOT EXISTS destacada TINYINT(1) NOT NULL DEFAULT 0 AFTER derechos_revisados,
  ADD COLUMN IF NOT EXISTS disponible_offline TINYINT(1) NOT NULL DEFAULT 1 AFTER destacada,
  ADD COLUMN IF NOT EXISTS orden INT NOT NULL DEFAULT 0 AFTER disponible_offline,
  ADD COLUMN IF NOT EXISTS estado_revision VARCHAR(30) NOT NULL DEFAULT 'borrador' AFTER orden,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_ora_oraciones_categoria_estado
  ON lvj_ora_oraciones (categoria, estado_revision);

CREATE INDEX IF NOT EXISTS idx_ora_oraciones_devocion
  ON lvj_ora_oraciones (devocion_id);
