-- Corrige el mapa pendiente ya creado para mostrar Platense 14:40 y 14:41 en filas separadas.
-- Torres Amat 14:40 queda únicamente frente a Platense 14:40; Platense 14:41 queda sin equivalente.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DELIMITER $$

CREATE OR REPLACE PROCEDURE lvj_separar_equivalencias_daniel_14_40_41_20260720()
MODIFIES SQL DATA
BEGIN
  DECLARE v_unidad_antigua BIGINT UNSIGNED;
  DECLARE v_unidad_41 BIGINT UNSIGNED;
  DECLARE v_spa_version BIGINT UNSIGNED;
  DECLARE v_ta_version BIGINT UNSIGNED;
  DECLARE v_spa_libro BIGINT UNSIGNED;
  DECLARE v_ta_libro BIGINT UNSIGNED;
  DECLARE v_spa_40 BIGINT UNSIGNED;
  DECLARE v_spa_41 BIGINT UNSIGNED;
  DECLARE v_ta_40 BIGINT UNSIGNED;
  DECLARE v_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT COUNT(*),MIN(id) INTO v_count,v_unidad_antigua
  FROM lvj_bib_unidades_canonicas
  WHERE codigo_canonico='DAN.VULG.014.040-041' AND estado_revision='pendiente' AND deleted_at IS NULL;
  IF v_count=0 AND EXISTS (
    SELECT 1 FROM lvj_bib_unidades_canonicas
    WHERE codigo_canonico='DAN.VULG.014.040' AND deleted_at IS NULL
  ) THEN
    SELECT 'YA_SEPARADO' AS resultado;
  ELSEIF v_count<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: la unidad pendiente 040-041 no existe de forma única';
  ELSE
    SELECT id INTO v_spa_version FROM lvj_bib_versiones WHERE codigo='SPAPLATENSE' AND estado=1 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ta_version FROM lvj_bib_versiones WHERE codigo='TORRESAMAT' AND estado=1 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_spa_libro FROM lvj_bib_libros WHERE version_id=v_spa_version AND codigo='DAN' AND estado=1 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ta_libro FROM lvj_bib_libros WHERE version_id=v_ta_version AND codigo='DAN' AND estado=1 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_spa_40 FROM lvj_bib_versiculos WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=14 AND versiculo=40 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_spa_41 FROM lvj_bib_versiculos WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=14 AND versiculo=41 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ta_40 FROM lvj_bib_versiculos WHERE version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=14 AND versiculo=40 AND deleted_at IS NULL LIMIT 1;
    IF v_spa_40 IS NULL OR v_spa_41 IS NULL OR v_ta_40 IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: faltan referencias 14:40/41 requeridas';
    END IF;

    SELECT COUNT(*) INTO v_count FROM lvj_bib_unidades_versiculos
    WHERE unidad_canonica_id=v_unidad_antigua AND deleted_at IS NULL;
    IF v_count<>3 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: la unidad antigua no contiene exactamente tres relaciones';
    END IF;

    START TRANSACTION;

    UPDATE lvj_bib_unidades_canonicas
    SET codigo_canonico='DAN.VULG.014.040',
        descripcion='Daniel 14, correspondencia editorial 40',
        observaciones='SPAPLATENSE 14:40 ↔ parcialmente TORRESAMAT 14:40',
        updated_at=CURRENT_TIMESTAMP
    WHERE id=v_unidad_antigua AND estado_revision='pendiente' AND deleted_at IS NULL;
    IF ROW_COUNT()<>1 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se actualizó la unidad Platense 14:40';
    END IF;

    UPDATE lvj_bib_unidades_versiculos
    SET tipo_equivalencia='parcial',updated_at=CURRENT_TIMESTAMP
    WHERE unidad_canonica_id=v_unidad_antigua AND versiculo_id IN (v_spa_40,v_ta_40) AND deleted_at IS NULL;
    IF ROW_COUNT()<>2 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se marcaron las dos relaciones parciales de 14:40';
    END IF;

    INSERT INTO lvj_bib_unidades_canonicas
      (libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones,created_at,updated_at,deleted_at)
    VALUES ('DAN','DAN.VULG.014.041-SIN-TA','Daniel 14, correspondencia editorial parcial 41',
            'pendiente','Cotejo editorial LVJ 2026-07-20',
            'SPAPLATENSE 14:41 ↔ sin equivalente en TORRESAMAT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL);
    SET v_unidad_41=LAST_INSERT_ID();

    UPDATE lvj_bib_unidades_versiculos
    SET unidad_canonica_id=v_unidad_41,tipo_equivalencia='parcial',orden=1,updated_at=CURRENT_TIMESTAMP
    WHERE unidad_canonica_id=v_unidad_antigua AND versiculo_id=v_spa_41 AND deleted_at IS NULL;
    IF ROW_COUNT()<>1 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se trasladó Platense 14:41';
    END IF;

    COMMIT;

    SELECT 'SEPARACION_APLICADA' AS resultado,
           'SPAPLATENSE 14:40 ↔ TORRESAMAT 14:40 parcial' AS unidad_40,
           'SPAPLATENSE 14:41 ↔ sin equivalente en TORRESAMAT' AS unidad_41;
  END IF;
END$$

DELIMITER ;

CALL lvj_separar_equivalencias_daniel_14_40_41_20260720();
DROP PROCEDURE IF EXISTS lvj_separar_equivalencias_daniel_14_40_41_20260720;
