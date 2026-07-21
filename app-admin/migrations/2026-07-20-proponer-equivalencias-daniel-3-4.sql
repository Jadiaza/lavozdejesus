-- Propuestas editoriales SPAPLATENSE -> TORRESAMAT para Daniel 3 y 4.
-- Conserva intactos todos los registros de lvj_bib_versiculos.
-- Requiere 2026-07-20-add-fragmentos-equivalencias.sql.
-- Crea propuestas pendientes; nunca las aprueba automáticamente.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
DELIMITER $$

CREATE OR REPLACE PROCEDURE lvj_proponer_equivalencias_daniel_3_4_20260720()
MODIFIES SQL DATA
BEGIN
  DECLARE v_spa_version BIGINT UNSIGNED;
  DECLARE v_ta_version BIGINT UNSIGNED;
  DECLARE v_spa_libro BIGINT UNSIGNED;
  DECLARE v_ta_libro BIGINT UNSIGNED;
  DECLARE v_ta_323 BIGINT UNSIGNED;
  DECLARE v_texto LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_n INT DEFAULT 24;
  DECLARE v_pos INT DEFAULT 0;
  DECLARE v_next INT DEFAULT 0;
  DECLARE v_previous INT DEFAULT 0;
  DECLARE v_occurrences INT DEFAULT 0;
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
  FROM lvj_bib_versiones
  WHERE codigo COLLATE utf8mb4_unicode_ci='SPAPLATENSE' COLLATE utf8mb4_unicode_ci
    AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: SPAPLATENSE no es única y activa'; END IF;

  SELECT COUNT(*),MIN(id) INTO v_count,v_ta_version
  FROM lvj_bib_versiones
  WHERE codigo COLLATE utf8mb4_unicode_ci='TORRESAMAT' COLLATE utf8mb4_unicode_ci
    AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: TORRESAMAT no es única y activa'; END IF;

  SELECT COUNT(*),MIN(id) INTO v_count,v_spa_libro
  FROM lvj_bib_libros
  WHERE version_id=v_spa_version AND codigo='DAN' AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: DAN/SPAPLATENSE no es único'; END IF;

  SELECT COUNT(*),MIN(id) INTO v_count,v_ta_libro
  FROM lvj_bib_libros
  WHERE version_id=v_ta_version AND codigo='DAN' AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: DAN/TORRESAMAT no es único'; END IF;

  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=3
    AND versiculo BETWEEN 1 AND 100 AND estado=1 AND deleted_at IS NULL;
  IF v_count<>100 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Platense Daniel 3 no contiene 1-100'; END IF;

  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=4
    AND versiculo BETWEEN 1 AND 34 AND estado=1 AND deleted_at IS NULL;
  IF v_count<>34 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Platense Daniel 4 no contiene 1-34'; END IF;

  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=3
    AND versiculo BETWEEN 1 AND 30 AND estado=1 AND deleted_at IS NULL;
  IF v_count<>30 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Torres Amat Daniel 3 no contiene 1-30'; END IF;

  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=4
    AND versiculo BETWEEN 1 AND 37 AND estado=1 AND deleted_at IS NULL;
  IF v_count<>37 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Torres Amat Daniel 4 no contiene 1-37'; END IF;

  SELECT COUNT(*) INTO v_count
  FROM lvj_bib_versiculos
  WHERE ((version_id=v_spa_version AND libro_id=v_spa_libro AND capitulo=4 AND versiculo=1)
      OR (version_id=v_ta_version AND libro_id=v_ta_libro AND capitulo=4 AND versiculo=4))
    AND texto COLLATE utf8mb4_unicode_ci LIKE '%Yo, Nabucodonosor%' COLLATE utf8mb4_unicode_ci
    AND estado=1 AND deleted_at IS NULL;
  IF v_count<>2 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Abortado: no se confirmó Platense 4:1 frente a Torres Amat 4:4';
  END IF;

  SELECT COUNT(*),MIN(id),MIN(texto) INTO v_count,v_ta_323,v_texto
  FROM lvj_bib_versiculos
  WHERE version_id=v_ta_version AND libro_id=v_ta_libro
    AND capitulo=3 AND versiculo=23 AND estado=1 AND deleted_at IS NULL;
  IF v_count<>1 OR CHAR_LENGTH(v_texto)<1000 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Torres Amat 3:23 no es el bloque concatenado esperado';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM lvj_bib_unidades_versiculos uv
  INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id AND v.deleted_at IS NULL
  WHERE uv.deleted_at IS NULL
    AND ((v.version_id=v_spa_version AND v.libro_id=v_spa_libro AND v.capitulo IN (3,4))
      OR (v.version_id=v_ta_version AND v.libro_id=v_ta_libro AND v.capitulo IN (3,4)));
  IF v_count<>0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Daniel 3 o 4 ya posee relaciones canónicas';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_dan_34_fragmentos;
  CREATE TEMPORARY TABLE tmp_dan_34_fragmentos (
    numero INT NOT NULL PRIMARY KEY,
    inicio INT UNSIGNED NOT NULL,
    longitud INT UNSIGNED NOT NULL
  ) ENGINE=InnoDB;

  SET v_pos=LOCATE(' 24. ' COLLATE utf8mb4_unicode_ci,v_texto COLLATE utf8mb4_unicode_ci);
  IF v_pos<=1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se detectó el marcador interno 24'; END IF;
  INSERT INTO tmp_dan_34_fragmentos VALUES (23,1,v_pos-1);
  SET v_previous=v_pos;

  WHILE v_n<=90 DO
    SET v_occurrences=(CHAR_LENGTH(v_texto)-CHAR_LENGTH(REPLACE(
      v_texto COLLATE utf8mb4_unicode_ci,
      CONCAT(' ',v_n,'. ') COLLATE utf8mb4_unicode_ci,'')))
      / CHAR_LENGTH(CONCAT(' ',v_n,'. '));
    IF v_occurrences<>1 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: un marcador interno no es único';
    END IF;
    SET v_pos=LOCATE(CONCAT(' ',v_n,'. ') COLLATE utf8mb4_unicode_ci,
                     v_texto COLLATE utf8mb4_unicode_ci,v_previous);
    IF v_pos=0 OR (v_n>24 AND v_pos<=v_previous) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: marcadores internos 24-90 incompletos o desordenados';
    END IF;
    IF v_n<90 THEN
      SET v_next=LOCATE(CONCAT(' ',v_n+1,'. ') COLLATE utf8mb4_unicode_ci,
                        v_texto COLLATE utf8mb4_unicode_ci,v_pos+1);
      IF v_next<=v_pos THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se pudo cerrar un fragmento interno';
      END IF;
    ELSE
      SET v_next=CHAR_LENGTH(v_texto)+1;
    END IF;
    INSERT INTO tmp_dan_34_fragmentos
      VALUES (v_n,v_pos+CHAR_LENGTH(CONCAT(' ',v_n,'. ')),
              v_next-(v_pos+CHAR_LENGTH(CONCAT(' ',v_n,'. '))));
    SET v_previous=v_pos+1;
    SET v_n=v_n+1;
  END WHILE;

  SELECT COUNT(*) INTO v_count FROM tmp_dan_34_fragmentos
  WHERE inicio<1 OR longitud<1 OR inicio+longitud-1>CHAR_LENGTH(v_texto);
  IF v_count<>0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: fragmentos fuera de los límites del texto'; END IF;
  SELECT COUNT(*) INTO v_count FROM tmp_dan_34_fragmentos;
  IF v_count<>68 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: se esperaban 68 fragmentos (23-90)'; END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_dan_34_mapa;
  CREATE TEMPORARY TABLE tmp_dan_34_mapa (
    spa_capitulo INT NOT NULL,spa_versiculo INT NOT NULL,
    ta_capitulo INT NOT NULL,ta_versiculo INT NOT NULL,
    fragmento_inicio INT UNSIGNED NULL,fragmento_longitud INT UNSIGNED NULL,
    referencia_editorial VARCHAR(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    tipo ENUM('exacta','parcial') NOT NULL,
    PRIMARY KEY (spa_capitulo,spa_versiculo)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  INSERT INTO tmp_dan_34_mapa
  WITH RECURSIVE numeros AS (SELECT 1 n UNION ALL SELECT n+1 FROM numeros WHERE n<100)
  SELECT 3,n,
         CASE WHEN n<=97 THEN 3 ELSE 4 END,
         CASE WHEN n<=23 THEN n WHEN n<=90 THEN 23 WHEN n<=97 THEN n-67 ELSE n-97 END,
         f.inicio,f.longitud,
         CASE
           WHEN n BETWEEN 23 AND 90 THEN CONCAT('3:',n,' interno en 3:23')
           WHEN n BETWEEN 91 AND 97 THEN CONCAT('Platense 3:',n,' / Torres Amat 3:',n-67)
           WHEN n BETWEEN 98 AND 100 THEN CONCAT('Platense 3:',n,' / Torres Amat 4:',n-97)
           ELSE NULL
         END,
         CASE WHEN n BETWEEN 23 AND 90 THEN 'parcial' ELSE 'exacta' END
  FROM numeros
  LEFT JOIN tmp_dan_34_fragmentos f ON f.numero=n;

  INSERT INTO tmp_dan_34_mapa
  WITH RECURSIVE numeros AS (SELECT 1 n UNION ALL SELECT n+1 FROM numeros WHERE n<34)
  SELECT 4,n,4,n+3,NULL,NULL,
         CONCAT('Platense 4:',n,' / Torres Amat 4:',n+3),'exacta'
  FROM numeros;

  SELECT COUNT(*) INTO v_count FROM tmp_dan_34_mapa;
  IF v_count<>134 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: el mapa no contiene 134 unidades'; END IF;

  START TRANSACTION;

  INSERT INTO lvj_bib_unidades_canonicas
    (libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones,created_at,updated_at,deleted_at)
  SELECT 'DAN',CONCAT('DAN.VULG.',LPAD(spa_capitulo,3,'0'),'.',LPAD(spa_versiculo,3,'0')),
         CONCAT('Daniel ',spa_capitulo,':',spa_versiculo,' — equivalencia editorial'),
         'pendiente','Cotejo editorial LVJ / Torres Amat 1825',
         CONCAT('SPAPLATENSE ',spa_capitulo,':',spa_versiculo,' ↔ TORRESAMAT ',
                ta_capitulo,':',ta_versiculo,
                IF(referencia_editorial IS NULL,'',CONCAT(' (',referencia_editorial,')'))),
         CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
  FROM tmp_dan_34_mapa ORDER BY spa_capitulo,spa_versiculo;
  SET v_unidades=ROW_COUNT();
  IF v_unidades<>134 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se crearon 134 unidades'; END IF;

  INSERT INTO lvj_bib_unidades_versiculos
    (unidad_canonica_id,versiculo_id,fragmento_inicio,fragmento_longitud,referencia_editorial,
     orden,tipo_equivalencia,estado_revision,created_at,updated_at,deleted_at)
  SELECT uc.id,v.id,NULL,NULL,NULL,1,m.tipo,'pendiente',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
  FROM tmp_dan_34_mapa m
  INNER JOIN lvj_bib_unidades_canonicas uc
    ON uc.codigo_canonico=CONCAT('DAN.VULG.',LPAD(m.spa_capitulo,3,'0'),'.',LPAD(m.spa_versiculo,3,'0'))
   AND uc.deleted_at IS NULL
  INNER JOIN lvj_bib_versiculos v
    ON v.version_id=v_spa_version AND v.libro_id=v_spa_libro
   AND v.capitulo=m.spa_capitulo AND v.versiculo=m.spa_versiculo
   AND v.estado=1 AND v.deleted_at IS NULL;
  SET v_relaciones_spa=ROW_COUNT();
  IF v_relaciones_spa<>134 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: faltan relaciones Platense'; END IF;

  INSERT INTO lvj_bib_unidades_versiculos
    (unidad_canonica_id,versiculo_id,fragmento_inicio,fragmento_longitud,referencia_editorial,
     orden,tipo_equivalencia,estado_revision,created_at,updated_at,deleted_at)
  SELECT uc.id,v.id,m.fragmento_inicio,m.fragmento_longitud,m.referencia_editorial,
         1,m.tipo,'pendiente',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
  FROM tmp_dan_34_mapa m
  INNER JOIN lvj_bib_unidades_canonicas uc
    ON uc.codigo_canonico=CONCAT('DAN.VULG.',LPAD(m.spa_capitulo,3,'0'),'.',LPAD(m.spa_versiculo,3,'0'))
   AND uc.deleted_at IS NULL
  INNER JOIN lvj_bib_versiculos v
    ON v.version_id=v_ta_version AND v.libro_id=v_ta_libro
   AND v.capitulo=m.ta_capitulo AND v.versiculo=m.ta_versiculo
   AND v.estado=1 AND v.deleted_at IS NULL;
  SET v_relaciones_ta=ROW_COUNT();
  IF v_relaciones_ta<>134 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: faltan relaciones Torres Amat'; END IF;

  COMMIT;
  SELECT 'PROPUESTAS_CREADAS' AS resultado,v_unidades AS unidades_pendientes,
         v_relaciones_spa AS relaciones_spaplatense,v_relaciones_ta AS relaciones_torresamat,
         68 AS fragmentos_sin_modificar_texto_original;
END$$

DELIMITER ;
CALL lvj_proponer_equivalencias_daniel_3_4_20260720();
DROP PROCEDURE IF EXISTS lvj_proponer_equivalencias_daniel_3_4_20260720;
