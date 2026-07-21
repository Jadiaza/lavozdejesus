-- Revierte únicamente las propuestas pendientes creadas para Daniel 3 y 4.
-- Se detiene si alguna unidad o relación ya fue revisada, aprobada o rechazada.
-- No modifica lvj_bib_versiculos.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
DELIMITER $$

CREATE OR REPLACE PROCEDURE lvj_revertir_equivalencias_daniel_3_4_20260720()
MODIFIES SQL DATA
BEGIN
  DECLARE v_unidades INT DEFAULT 0;
  DECLARE v_relaciones INT DEFAULT 0;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT COUNT(*) INTO v_unidades
  FROM lvj_bib_unidades_canonicas
  WHERE libro_codigo='DAN' AND deleted_at IS NULL
    AND (codigo_canonico LIKE 'DAN.VULG.003.%' OR codigo_canonico LIKE 'DAN.VULG.004.%')
    AND estado_revision='pendiente';
  IF v_unidades<>134 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no existen exactamente 134 unidades pendientes';
  END IF;

  SELECT COUNT(*) INTO v_relaciones
  FROM lvj_bib_unidades_versiculos uv
  INNER JOIN lvj_bib_unidades_canonicas uc ON uc.id=uv.unidad_canonica_id
  WHERE uc.libro_codigo='DAN' AND uc.deleted_at IS NULL AND uv.deleted_at IS NULL
    AND (uc.codigo_canonico LIKE 'DAN.VULG.003.%' OR uc.codigo_canonico LIKE 'DAN.VULG.004.%')
    AND uc.estado_revision='pendiente' AND uv.estado_revision='pendiente';
  IF v_relaciones<>268 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no existen exactamente 268 relaciones pendientes';
  END IF;

  START TRANSACTION;
  DELETE uv FROM lvj_bib_unidades_versiculos uv
  INNER JOIN lvj_bib_unidades_canonicas uc ON uc.id=uv.unidad_canonica_id
  WHERE uc.libro_codigo='DAN'
    AND (uc.codigo_canonico LIKE 'DAN.VULG.003.%' OR uc.codigo_canonico LIKE 'DAN.VULG.004.%')
    AND uc.estado_revision='pendiente' AND uv.estado_revision='pendiente'
    AND uc.deleted_at IS NULL AND uv.deleted_at IS NULL;
  IF ROW_COUNT()<>268 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: cambió el número de relaciones'; END IF;

  DELETE FROM lvj_bib_unidades_canonicas
  WHERE libro_codigo='DAN' AND estado_revision='pendiente' AND deleted_at IS NULL
    AND (codigo_canonico LIKE 'DAN.VULG.003.%' OR codigo_canonico LIKE 'DAN.VULG.004.%');
  IF ROW_COUNT()<>134 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: cambió el número de unidades'; END IF;
  COMMIT;

  SELECT 'REVERSION_APLICADA' AS resultado,134 AS unidades_eliminadas,268 AS relaciones_eliminadas;
END$$

DELIMITER ;
CALL lvj_revertir_equivalencias_daniel_3_4_20260720();
DROP PROCEDURE IF EXISTS lvj_revertir_equivalencias_daniel_3_4_20260720;

