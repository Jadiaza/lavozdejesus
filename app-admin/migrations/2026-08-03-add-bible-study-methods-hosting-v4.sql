-- LVJPRAYER
-- Migración V4 para hosting compartido / MariaDB.
-- No consulta information_schema.
-- No elimina datos.
--
-- Ejecutar dentro de la base de datos activa seleccionada en phpMyAdmin.

ALTER TABLE `lvj_bib_estudios_ia`
  ADD COLUMN IF NOT EXISTS `metodo`
    VARCHAR(32) NOT NULL DEFAULT 'integral_lvj'
    AFTER `referencia`,
  ADD COLUMN IF NOT EXISTS `modelo_referencia`
    VARCHAR(100) NULL
    AFTER `esquema_version`,
  ADD COLUMN IF NOT EXISTS `tecnica_estructural`
    VARCHAR(50) NULL
    AFTER `modelo_referencia`;

-- Clasificar registros existentes según el esquema guardado.
UPDATE `lvj_bib_estudios_ia`
SET `metodo` = CASE
  WHEN LOWER(COALESCE(`esquema_version`, '')) = 'salmo8-1.0'
    OR LOWER(COALESCE(`esquema_version`, '')) LIKE 'salmo%'
    THEN 'metodo_salmo'
  WHEN LOWER(COALESCE(`esquema_version`, '')) LIKE 'integral-lvj-%'
    THEN 'integral_lvj'
  WHEN `metodo` IS NULL OR TRIM(`metodo`) = ''
    THEN 'integral_lvj'
  ELSE `metodo`
END;

UPDATE `lvj_bib_estudios_ia`
SET
  `modelo_referencia` = 'salmo8-1.0',
  `tecnica_estructural` = NULL
WHERE `metodo` = 'metodo_salmo';

UPDATE `lvj_bib_estudios_ia`
SET
  `modelo_referencia` = NULL,
  `tecnica_estructural` = 'arcing'
WHERE `metodo` = 'integral_lvj';

-- Verificación permitida en hosting compartido.
SHOW COLUMNS FROM `lvj_bib_estudios_ia` LIKE 'metodo';
SHOW COLUMNS FROM `lvj_bib_estudios_ia` LIKE 'modelo_referencia';
SHOW COLUMNS FROM `lvj_bib_estudios_ia` LIKE 'tecnica_estructural';

SELECT
  `metodo`,
  COUNT(*) AS cantidad
FROM `lvj_bib_estudios_ia`
GROUP BY `metodo`
ORDER BY `metodo`;
