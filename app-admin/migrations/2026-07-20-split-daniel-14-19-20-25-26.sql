-- Separa propuestas pendientes agrupadas para mostrar una fila por versículo Platense.
-- Resultado: 19↔19 parcial, 20↔20 parcial, 25↔25 parcial y 26↔26 parcial.
-- No modifica ningún texto bíblico.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DELIMITER $$

CREATE OR REPLACE PROCEDURE lvj_separar_daniel_14_19_20_25_26_20260720()
MODIFIES SQL DATA
BEGIN
  DECLARE v_spa_version BIGINT UNSIGNED;
  DECLARE v_ta_version BIGINT UNSIGNED;
  DECLARE v_spa_libro BIGINT UNSIGNED;
  DECLARE v_ta_libro BIGINT UNSIGNED;
  DECLARE v_old BIGINT UNSIGNED;
  DECLARE v_new BIGINT UNSIGNED;
  DECLARE v_spa_a BIGINT UNSIGNED;
  DECLARE v_spa_b BIGINT UNSIGNED;
  DECLARE v_ta_a BIGINT UNSIGNED;
  DECLARE v_ta_b BIGINT UNSIGNED;
  DECLARE v_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT id INTO v_spa_version FROM lvj_bib_versiones WHERE codigo='SPAPLATENSE' AND estado=1 AND deleted_at IS NULL LIMIT 1;
  SELECT id INTO v_ta_version FROM lvj_bib_versiones WHERE codigo='TORRESAMAT' AND estado=1 AND deleted_at IS NULL LIMIT 1;
  SELECT id INTO v_spa_libro FROM lvj_bib_libros WHERE version_id=v_spa_version AND codigo='DAN' AND estado=1 AND deleted_at IS NULL LIMIT 1;
  SELECT id INTO v_ta_libro FROM lvj_bib_libros WHERE version_id=v_ta_version AND codigo='DAN' AND estado=1 AND deleted_at IS NULL LIMIT 1;

  START TRANSACTION;

  -- Separación 19–20.
  SELECT COUNT(*),MIN(id) INTO v_count,v_old FROM lvj_bib_unidades_canonicas
  WHERE codigo_canonico='DAN.VULG.014.019-020' AND estado_revision='pendiente' AND deleted_at IS NULL;
  IF v_count=1 THEN
    SELECT id INTO v_spa_a FROM lvj_bib_versiculos WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=14 AND versiculo=19 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_spa_b FROM lvj_bib_versiculos WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=14 AND versiculo=20 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ta_a FROM lvj_bib_versiculos WHERE version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=14 AND versiculo=19 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ta_b FROM lvj_bib_versiculos WHERE version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=14 AND versiculo=20 AND deleted_at IS NULL LIMIT 1;
    SELECT COUNT(*) INTO v_count FROM lvj_bib_unidades_versiculos WHERE unidad_canonica_id=v_old AND deleted_at IS NULL;
    IF v_count<>4 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: unidad 19-20 no contiene cuatro relaciones'; END IF;

    UPDATE lvj_bib_unidades_canonicas
    SET codigo_canonico='DAN.VULG.014.019',descripcion='Daniel 14, correspondencia editorial parcial 19',
        observaciones='SPAPLATENSE 14:19 ↔ parcialmente TORRESAMAT 14:19',updated_at=CURRENT_TIMESTAMP
    WHERE id=v_old;
    UPDATE lvj_bib_unidades_versiculos SET tipo_equivalencia='parcial',orden=1,updated_at=CURRENT_TIMESTAMP
    WHERE unidad_canonica_id=v_old AND versiculo_id IN (v_spa_a,v_ta_a) AND deleted_at IS NULL;

    INSERT INTO lvj_bib_unidades_canonicas
      (libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones,created_at,updated_at,deleted_at)
    VALUES ('DAN','DAN.VULG.014.020','Daniel 14, correspondencia editorial parcial 20','pendiente',
            'Cotejo editorial LVJ 2026-07-20','SPAPLATENSE 14:20 ↔ parcialmente TORRESAMAT 14:20',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL);
    SET v_new=LAST_INSERT_ID();
    UPDATE lvj_bib_unidades_versiculos SET unidad_canonica_id=v_new,tipo_equivalencia='parcial',orden=1,updated_at=CURRENT_TIMESTAMP
    WHERE unidad_canonica_id=v_old AND versiculo_id IN (v_spa_b,v_ta_b) AND deleted_at IS NULL;
    IF ROW_COUNT()<>2 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se trasladaron las relaciones de 14:20'; END IF;
  ELSEIF v_count<>0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: unidad 19-20 no es única';
  END IF;

  -- Separación 25–26.
  SELECT COUNT(*),MIN(id) INTO v_count,v_old FROM lvj_bib_unidades_canonicas
  WHERE codigo_canonico='DAN.VULG.014.025-026' AND estado_revision='pendiente' AND deleted_at IS NULL;
  IF v_count=1 THEN
    SELECT id INTO v_spa_a FROM lvj_bib_versiculos WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=14 AND versiculo=25 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_spa_b FROM lvj_bib_versiculos WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=14 AND versiculo=26 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ta_a FROM lvj_bib_versiculos WHERE version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=14 AND versiculo=25 AND deleted_at IS NULL LIMIT 1;
    SELECT id INTO v_ta_b FROM lvj_bib_versiculos WHERE version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=14 AND versiculo=26 AND deleted_at IS NULL LIMIT 1;
    SELECT COUNT(*) INTO v_count FROM lvj_bib_unidades_versiculos WHERE unidad_canonica_id=v_old AND deleted_at IS NULL;
    IF v_count<>4 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: unidad 25-26 no contiene cuatro relaciones'; END IF;

    UPDATE lvj_bib_unidades_canonicas
    SET codigo_canonico='DAN.VULG.014.025',descripcion='Daniel 14, correspondencia editorial parcial 25',
        observaciones='SPAPLATENSE 14:25 ↔ parcialmente TORRESAMAT 14:25',updated_at=CURRENT_TIMESTAMP
    WHERE id=v_old;
    UPDATE lvj_bib_unidades_versiculos SET tipo_equivalencia='parcial',orden=1,updated_at=CURRENT_TIMESTAMP
    WHERE unidad_canonica_id=v_old AND versiculo_id IN (v_spa_a,v_ta_a) AND deleted_at IS NULL;

    INSERT INTO lvj_bib_unidades_canonicas
      (libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones,created_at,updated_at,deleted_at)
    VALUES ('DAN','DAN.VULG.014.026','Daniel 14, correspondencia editorial parcial 26','pendiente',
            'Cotejo editorial LVJ 2026-07-20','SPAPLATENSE 14:26 ↔ parcialmente TORRESAMAT 14:26',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL);
    SET v_new=LAST_INSERT_ID();
    UPDATE lvj_bib_unidades_versiculos SET unidad_canonica_id=v_new,tipo_equivalencia='parcial',orden=1,updated_at=CURRENT_TIMESTAMP
    WHERE unidad_canonica_id=v_old AND versiculo_id IN (v_spa_b,v_ta_b) AND deleted_at IS NULL;
    IF ROW_COUNT()<>2 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se trasladaron las relaciones de 14:26'; END IF;
  ELSEIF v_count<>0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: unidad 25-26 no es única';
  END IF;

  COMMIT;

  SELECT 'SEPARACION_APLICADA' AS resultado,
         '14:19, 14:20, 14:25 y 14:26 ahora son unidades independientes' AS detalle;
END$$

DELIMITER ;

CALL lvj_separar_daniel_14_19_20_25_26_20260720();
DROP PROCEDURE IF EXISTS lvj_separar_daniel_14_19_20_25_26_20260720;

