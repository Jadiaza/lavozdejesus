-- Propuestas editoriales pendientes para SPAPLATENSE ↔ TORRESAMAT, Daniel 14.
-- Requiere que ambas versiones tengan DAN 14 y que Torres Amat tenga 40 versículos.
-- No aprueba relaciones. Platense 14:42 se conserva como unidad parcial sin texto equivalente en Torres Amat.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

DELIMITER $$

CREATE OR REPLACE PROCEDURE lvj_proponer_equivalencias_daniel_14_20260720()
MODIFIES SQL DATA
BEGIN
  DECLARE v_spa_version BIGINT UNSIGNED;
  DECLARE v_ta_version BIGINT UNSIGNED;
  DECLARE v_spa_libro BIGINT UNSIGNED;
  DECLARE v_ta_libro BIGINT UNSIGNED;
  DECLARE v_count INT DEFAULT 0;
  DECLARE v_unidades INT DEFAULT 0;
  DECLARE v_relaciones_spa INT DEFAULT 0;
  DECLARE v_relaciones_ta INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT COUNT(*),MIN(id) INTO v_count,v_spa_version
  FROM lvj_bib_versiones WHERE codigo='SPAPLATENSE' AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: SPAPLATENSE no es una versión activa única';
  END IF;
  SELECT COUNT(*),MIN(id) INTO v_count,v_ta_version
  FROM lvj_bib_versiones WHERE codigo='TORRESAMAT' AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: TORRESAMAT no es una versión activa única';
  END IF;

  SELECT COUNT(*),MIN(id) INTO v_count,v_spa_libro
  FROM lvj_bib_libros
  WHERE version_id=v_spa_version AND codigo='DAN' AND capitulos=14 AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: DAN/SPAPLATENSE no declara 14 capítulos de forma única';
  END IF;
  SELECT COUNT(*),MIN(id) INTO v_count,v_ta_libro
  FROM lvj_bib_libros
  WHERE version_id=v_ta_version AND codigo='DAN' AND capitulos=14 AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: DAN/TORRESAMAT no declara 14 capítulos de forma única';
  END IF;

  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=14
    AND estado=1 AND deleted_at IS NULL;
  IF v_count<>42 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: SPAPLATENSE Daniel 14 no contiene exactamente 42 versículos';
  END IF;
  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=14
    AND estado=1 AND deleted_at IS NULL;
  IF v_count<>40 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: TORRESAMAT Daniel 14 no contiene exactamente 40 versículos';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM lvj_bib_unidades_versiculos uv
  INNER JOIN lvj_bib_unidades_canonicas uc ON uc.id=uv.unidad_canonica_id AND uc.deleted_at IS NULL
  INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id AND v.deleted_at IS NULL
  WHERE uv.deleted_at IS NULL AND v.capitulo=14
    AND ((v.version_id=v_spa_version AND v.libro_id=v_spa_libro)
      OR (v.version_id=v_ta_version AND v.libro_id=v_ta_libro));
  IF v_count<>0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Daniel 14 ya posee relaciones canónicas; no se duplicaron';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_daniel_14_mapa;
  CREATE TEMPORARY TABLE tmp_daniel_14_mapa (
    codigo VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    spa_inicio INT NOT NULL,
    spa_fin INT NOT NULL,
    ta_inicio INT NULL,
    ta_fin INT NULL,
    tipo ENUM('exacta','parcial','combinada') NOT NULL,
    PRIMARY KEY (codigo)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  INSERT INTO tmp_daniel_14_mapa (codigo,spa_inicio,spa_fin,ta_inicio,ta_fin,tipo)
  WITH RECURSIVE numeros AS (
    SELECT 1 AS n
    UNION ALL SELECT n+1 FROM numeros WHERE n<39
  )
  SELECT CONCAT('DAN.VULG.014.',LPAD(n,3,'0')),n,n,n,n,'exacta'
  FROM numeros
  WHERE n NOT IN (19,20,25,26)
  UNION ALL SELECT 'DAN.VULG.014.019',19,19,19,19,'parcial'
  UNION ALL SELECT 'DAN.VULG.014.020',20,20,20,20,'parcial'
  UNION ALL SELECT 'DAN.VULG.014.025',25,25,25,25,'parcial'
  UNION ALL SELECT 'DAN.VULG.014.026',26,26,26,26,'parcial'
  UNION ALL SELECT 'DAN.VULG.014.040',40,40,40,40,'parcial'
  UNION ALL SELECT 'DAN.VULG.014.041-SIN-TA',41,41,NULL,NULL,'parcial'
  UNION ALL SELECT 'DAN.VULG.014.042-SIN-TA',42,42,NULL,NULL,'parcial';

  SELECT COUNT(*) INTO v_count FROM tmp_daniel_14_mapa;
  IF v_count<>42 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: el mapa editorial no contiene exactamente 42 unidades';
  END IF;

  START TRANSACTION;

  INSERT INTO lvj_bib_unidades_canonicas
    (libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones,created_at,updated_at,deleted_at)
  SELECT 'DAN',m.codigo,
         CONCAT('Daniel 14, correspondencia editorial ',m.spa_inicio,
                IF(m.spa_fin=m.spa_inicio,'',CONCAT('-',m.spa_fin))),
         'pendiente','Cotejo editorial LVJ 2026-07-20',
         CONCAT('SPAPLATENSE 14:',m.spa_inicio,
                IF(m.spa_fin=m.spa_inicio,'',CONCAT('-',m.spa_fin)),
                IF(m.ta_inicio IS NULL,' ↔ sin equivalente en TORRESAMAT',
                  CONCAT(' ↔ TORRESAMAT 14:',m.ta_inicio,
                    IF(m.ta_fin=m.ta_inicio,'',CONCAT('-',m.ta_fin))))),
         CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
  FROM tmp_daniel_14_mapa m;
  SET v_unidades=ROW_COUNT();
  IF v_unidades<>42 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se crearon exactamente 42 unidades pendientes';
  END IF;

  INSERT INTO lvj_bib_unidades_versiculos
    (unidad_canonica_id,versiculo_id,orden,tipo_equivalencia,estado_revision,created_at,updated_at,deleted_at)
  SELECT uc.id,v.id,v.versiculo-m.spa_inicio+1,m.tipo,'pendiente',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
  FROM tmp_daniel_14_mapa m
  INNER JOIN lvj_bib_unidades_canonicas uc ON uc.codigo_canonico=m.codigo AND uc.deleted_at IS NULL
  INNER JOIN lvj_bib_versiculos v
    ON v.version_id=v_spa_version AND v.libro_id=v_spa_libro AND v.capitulo=14
   AND v.versiculo BETWEEN m.spa_inicio AND m.spa_fin AND v.estado=1 AND v.deleted_at IS NULL;
  SET v_relaciones_spa=ROW_COUNT();
  IF v_relaciones_spa<>42 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se crearon exactamente 42 relaciones Platense';
  END IF;

  INSERT INTO lvj_bib_unidades_versiculos
    (unidad_canonica_id,versiculo_id,orden,tipo_equivalencia,estado_revision,created_at,updated_at,deleted_at)
  SELECT uc.id,v.id,v.versiculo-m.ta_inicio+1,m.tipo,'pendiente',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
  FROM tmp_daniel_14_mapa m
  INNER JOIN lvj_bib_unidades_canonicas uc ON uc.codigo_canonico=m.codigo AND uc.deleted_at IS NULL
  INNER JOIN lvj_bib_versiculos v
    ON v.version_id=v_ta_version AND v.libro_id=v_ta_libro AND v.capitulo=14
   AND v.versiculo BETWEEN m.ta_inicio AND m.ta_fin AND v.estado=1 AND v.deleted_at IS NULL;
  SET v_relaciones_ta=ROW_COUNT();
  IF v_relaciones_ta<>40 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se crearon exactamente 40 relaciones Torres Amat';
  END IF;

  COMMIT;

  SELECT 'PROPUESTAS_CREADAS' AS resultado,v_unidades AS unidades_pendientes,
         v_relaciones_spa AS relaciones_spaplatense,v_relaciones_ta AS relaciones_torresamat,
         42 AS versiculo_platense_mostrado_sin_equivalencia;
END$$

DELIMITER ;

CALL lvj_proponer_equivalencias_daniel_14_20260720();
DROP PROCEDURE IF EXISTS lvj_proponer_equivalencias_daniel_14_20260720;
