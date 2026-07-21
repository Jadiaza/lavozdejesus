-- Metadatos opcionales para relacionar una unidad canónica con una parte de un
-- versículo original. No modifica lvj_bib_versiculos ni duplica texto bíblico.
-- Compatible con MariaDB 10.6+ y MySQL 8.x.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE lvj_bib_unidades_versiculos
  ADD COLUMN IF NOT EXISTS fragmento_inicio INT UNSIGNED NULL AFTER versiculo_id,
  ADD COLUMN IF NOT EXISTS fragmento_longitud INT UNSIGNED NULL AFTER fragmento_inicio,
  ADD COLUMN IF NOT EXISTS referencia_editorial VARCHAR(60) NULL AFTER fragmento_longitud;

-- Las dos posiciones deben existir juntas y permanecer dentro del texto original.
-- MariaDB no aplica CHECK de la misma manera en todas las versiones soportadas;
-- estas condiciones se validan también en los scripts y en el backend.
SHOW COLUMNS FROM lvj_bib_unidades_versiculos;
