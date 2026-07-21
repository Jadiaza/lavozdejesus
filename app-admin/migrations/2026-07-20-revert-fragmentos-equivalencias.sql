-- Reversión estructural. Se detiene si existen relaciones que usan fragmentos.
-- No elimina equivalencias ni textos bíblicos.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
DELIMITER $$

CREATE OR REPLACE PROCEDURE lvj_revertir_fragmentos_equivalencias_20260720()
MODIFIES SQL DATA
BEGIN
  DECLARE v_usos INT DEFAULT 0;

  SELECT COUNT(*) INTO v_usos
  FROM lvj_bib_unidades_versiculos
  WHERE fragmento_inicio IS NOT NULL OR fragmento_longitud IS NOT NULL
     OR referencia_editorial IS NOT NULL;

  IF v_usos<>0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Abortado: existen equivalencias que usan fragmentos';
  END IF;

  ALTER TABLE lvj_bib_unidades_versiculos
    DROP COLUMN referencia_editorial,
    DROP COLUMN fragmento_longitud,
    DROP COLUMN fragmento_inicio;
END$$

DELIMITER ;
CALL lvj_revertir_fragmentos_equivalencias_20260720();
DROP PROCEDURE IF EXISTS lvj_revertir_fragmentos_equivalencias_20260720;
