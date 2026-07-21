-- Corrección reversible de segmentación: TORRESAMAT / DAN 12:13, 13 y 14.
-- Validado para MariaDB 10.11 contra la auditoría del 20 de julio de 2026.
-- NO modifica palabras del texto: convierte los marcadores "n. " en columnas versiculo.
-- Ejecutar una sola vez, completa, después de realizar un respaldo general de MySQL.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION group_concat_max_len = 1048576;

-- Respaldo persistente y acotado al registro/libro afectados. La tabla se conserva
-- para permitir ejecutar scripts/revertir_daniel_torres_amat.sql posteriormente.
CREATE TABLE IF NOT EXISTS lvj_bib_respaldo_daniel_torres_amat (
  backup_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave_ejecucion VARCHAR(80) NOT NULL,
  original_id BIGINT UNSIGNED NOT NULL,
  version_id BIGINT UNSIGNED NULL,
  libro_id BIGINT UNSIGNED NULL,
  capitulos_libro_original INT NULL,
  libro_updated_at_original TIMESTAMP NULL,
  capitulo INT NOT NULL,
  versiculo INT NOT NULL,
  texto LONGTEXT NOT NULL,
  titulo_seccion VARCHAR(255) NULL,
  tiene_nota TINYINT(1) NULL,
  estado VARCHAR(30) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  respaldado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (backup_id),
  UNIQUE KEY uq_bib_respaldo_daniel_clave (clave_ejecucion, original_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Las columnas de texto bíblico utilizan utf8mb4_unicode_ci. La declaración
-- explícita evita que las variables hereden el cotejo general _520_ci.
ALTER TABLE lvj_bib_respaldo_daniel_torres_amat
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DELIMITER $$

CREATE OR REPLACE PROCEDURE lvj_corregir_daniel_torres_amat_20260720()
MODIFIES SQL DATA
BEGIN
  DECLARE v_clave VARCHAR(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    DEFAULT 'TORRESAMAT_DAN_20260720_SEGMENTACION_V1';
  DECLARE v_version_id BIGINT UNSIGNED;
  DECLARE v_libro_id BIGINT UNSIGNED;
  DECLARE v_original_id BIGINT UNSIGNED;
  DECLARE v_capitulos_original INT;
  DECLARE v_libro_updated_at_original TIMESTAMP;
  DECLARE v_texto_original LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_bloque_12 LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_bloque_13 LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_bloque_14 LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_reconstruido_13 LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_reconstruido_14 LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_reconstruido_total LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  DECLARE v_marca_susana VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    DEFAULT ' 1. Había un varón, que habitaba en Babilonia, llamado Joakim;';
  DECLARE v_marca_bel VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    DEFAULT ' 1. Era Daniel uno de aquellos que comían a la mesa del rey';
  DECLARE v_fin_12 VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    DEFAULT 'y gozarás de tu suerte al fin de los días.';
  DECLARE v_inicio_susana INT;
  DECLARE v_inicio_bel INT;
  DECLARE v_pos_fin_12 INT;
  DECLARE v_count INT DEFAULT 0;
  DECLARE v_respaldo_count INT DEFAULT 0;
  DECLARE v_insertados_13 INT DEFAULT 0;
  DECLARE v_insertados_14 INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT COUNT(*), MIN(id)
    INTO v_count, v_version_id
  FROM lvj_bib_versiones
  WHERE codigo='TORRESAMAT' AND estado=1 AND deleted_at IS NULL;
  IF v_count <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: TORRESAMAT no es una versión activa única';
  END IF;

  SELECT COUNT(*), MIN(id), MIN(capitulos), MIN(updated_at)
    INTO v_count, v_libro_id, v_capitulos_original, v_libro_updated_at_original
  FROM lvj_bib_libros
  WHERE version_id=v_version_id AND codigo='DAN' AND estado=1 AND deleted_at IS NULL;
  IF v_count <> 1 OR v_capitulos_original <> 12 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: DAN no es único o ya no declara exactamente 12 capítulos';
  END IF;

  SELECT COUNT(*), MIN(id), MIN(texto)
    INTO v_count, v_original_id, v_texto_original
  FROM lvj_bib_versiculos
  WHERE version_id=v_version_id AND libro_id=v_libro_id
    AND capitulo=12 AND versiculo=13 AND deleted_at IS NULL;
  IF v_count <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Daniel 12:13 no es un registro vivo único';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM lvj_bib_versiculos
  WHERE version_id=v_version_id AND libro_id=v_libro_id
    AND capitulo IN (13,14) AND deleted_at IS NULL;
  IF v_count <> 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Daniel 13 o 14 ya contienen registros vivos';
  END IF;

  SET v_inicio_susana = LOCATE(v_marca_susana, v_texto_original);
  SET v_inicio_bel = LOCATE(v_marca_bel, v_texto_original);
  SET v_pos_fin_12 = LOCATE(v_fin_12, v_texto_original);
  IF v_inicio_susana <= 0 OR v_inicio_bel <= v_inicio_susana OR v_pos_fin_12 <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se detectaron inequívocamente los tres bloques';
  END IF;
  IF (CHAR_LENGTH(v_texto_original)-CHAR_LENGTH(REPLACE(v_texto_original,v_marca_susana,''))) / CHAR_LENGTH(v_marca_susana) <> 1
     OR (CHAR_LENGTH(v_texto_original)-CHAR_LENGTH(REPLACE(v_texto_original,v_marca_bel,''))) / CHAR_LENGTH(v_marca_bel) <> 1
     OR (CHAR_LENGTH(v_texto_original)-CHAR_LENGTH(REPLACE(v_texto_original,v_fin_12,''))) / CHAR_LENGTH(v_fin_12) <> 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: uno de los límites aparece cero o múltiples veces';
  END IF;

  SET v_bloque_12 = LEFT(v_texto_original, v_inicio_susana - 1);
  SET v_bloque_13 = SUBSTRING(v_texto_original, v_inicio_susana + 1, v_inicio_bel - v_inicio_susana - 1);
  SET v_bloque_14 = SUBSTRING(v_texto_original, v_inicio_bel + 1);
  IF NOT (v_texto_original <=> CONCAT(v_bloque_12,' ',v_bloque_13,' ',v_bloque_14)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: la separación preliminar perdería caracteres';
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_daniel_segmentos;
  CREATE TEMPORARY TABLE tmp_daniel_segmentos (
    capitulo INT NOT NULL,
    versiculo INT NOT NULL,
    texto LONGTEXT NOT NULL,
    PRIMARY KEY (capitulo,versiculo)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

  INSERT INTO tmp_daniel_segmentos (capitulo,versiculo,texto)
  WITH RECURSIVE numeros AS (
    SELECT 1 AS n
    UNION ALL SELECT n+1 FROM numeros WHERE n<65
  )
  SELECT 13,n,
         SUBSTRING(
           v_bloque_13,
           LOCATE(CONCAT(IF(n=1,'',' '),n,'. '),v_bloque_13)
             + CHAR_LENGTH(CONCAT(IF(n=1,'',' '),n,'. ')),
           (CASE WHEN n=65 THEN CHAR_LENGTH(v_bloque_13)+1
                 ELSE LOCATE(CONCAT(' ',n+1,'. '),v_bloque_13) END)
             - (LOCATE(CONCAT(IF(n=1,'',' '),n,'. '),v_bloque_13)
                + CHAR_LENGTH(CONCAT(IF(n=1,'',' '),n,'. ')))
         )
  FROM numeros
  WHERE LOCATE(CONCAT(IF(n=1,'',' '),n,'. '),v_bloque_13)>0;

  INSERT INTO tmp_daniel_segmentos (capitulo,versiculo,texto)
  WITH RECURSIVE numeros AS (
    SELECT 1 AS n
    UNION ALL SELECT n+1 FROM numeros WHERE n<40
  )
  SELECT 14,n,
         SUBSTRING(
           v_bloque_14,
           LOCATE(CONCAT(IF(n=1,'',' '),n,'. '),v_bloque_14)
             + CHAR_LENGTH(CONCAT(IF(n=1,'',' '),n,'. ')),
           (CASE WHEN n=40 THEN CHAR_LENGTH(v_bloque_14)+1
                 ELSE LOCATE(CONCAT(' ',n+1,'. '),v_bloque_14) END)
             - (LOCATE(CONCAT(IF(n=1,'',' '),n,'. '),v_bloque_14)
                + CHAR_LENGTH(CONCAT(IF(n=1,'',' '),n,'. ')))
         )
  FROM numeros
  WHERE LOCATE(CONCAT(IF(n=1,'',' '),n,'. '),v_bloque_14)>0;

  SELECT COUNT(*) INTO v_count FROM tmp_daniel_segmentos WHERE capitulo=13;
  IF v_count<>65 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Susana no produjo exactamente 65 versículos';
  END IF;
  SELECT COUNT(*) INTO v_count FROM tmp_daniel_segmentos WHERE capitulo=14;
  IF v_count<>40 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Bel y el dragón no produjo exactamente 40 versículos';
  END IF;
  SELECT COUNT(*) INTO v_count FROM tmp_daniel_segmentos WHERE texto='';
  IF v_count<>0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: se detectaron versículos vacíos';
  END IF;

  SELECT GROUP_CONCAT(CONCAT(versiculo,'. ',texto) ORDER BY versiculo SEPARATOR ' ')
    INTO v_reconstruido_13 FROM tmp_daniel_segmentos WHERE capitulo=13;
  SELECT GROUP_CONCAT(CONCAT(versiculo,'. ',texto) ORDER BY versiculo SEPARATOR ' ')
    INTO v_reconstruido_14 FROM tmp_daniel_segmentos WHERE capitulo=14;
  SET v_reconstruido_total=CONCAT(v_bloque_12,' ',v_reconstruido_13,' ',v_reconstruido_14);
  IF NOT (BINARY v_texto_original <=> BINARY v_reconstruido_total) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: los versículos segmentados no reconstruyen el original';
  END IF;

  SELECT COUNT(*) INTO v_respaldo_count
  FROM lvj_bib_respaldo_daniel_torres_amat
  WHERE clave_ejecucion=v_clave AND original_id=v_original_id;
  IF v_respaldo_count>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: existe más de un respaldo para la operación';
  END IF;
  IF v_respaldo_count=1 AND NOT EXISTS (
    SELECT 1 FROM lvj_bib_respaldo_daniel_torres_amat
    WHERE clave_ejecucion=v_clave AND original_id=v_original_id
      AND BINARY texto=BINARY v_texto_original AND capitulos_libro_original=v_capitulos_original
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: el respaldo existente no coincide con el original actual';
  END IF;

  START TRANSACTION;

  IF v_respaldo_count=0 THEN
    INSERT INTO lvj_bib_respaldo_daniel_torres_amat
      (clave_ejecucion,original_id,version_id,libro_id,capitulos_libro_original,libro_updated_at_original,
       capitulo,versiculo,texto,titulo_seccion,tiene_nota,estado,created_at,updated_at,deleted_at)
    SELECT v_clave,id,version_id,libro_id,v_capitulos_original,v_libro_updated_at_original,
           capitulo,versiculo,texto,titulo_seccion,tiene_nota,estado,created_at,updated_at,deleted_at
    FROM lvj_bib_versiculos WHERE id=v_original_id;
  END IF;

  UPDATE lvj_bib_versiculos
  SET texto=v_bloque_12,updated_at=CURRENT_TIMESTAMP
  WHERE id=v_original_id AND version_id=v_version_id AND libro_id=v_libro_id
    AND capitulo=12 AND versiculo=13 AND deleted_at IS NULL;
  IF ROW_COUNT()<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se actualizó exactamente Daniel 12:13';
  END IF;

  INSERT INTO lvj_bib_versiculos
    (version_id,libro_id,capitulo,versiculo,texto,titulo_seccion,tiene_nota,estado,created_at,updated_at,deleted_at)
  SELECT v_version_id,v_libro_id,s.capitulo,s.versiculo,s.texto,NULL,0,1,
         CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
  FROM tmp_daniel_segmentos s
  ORDER BY s.capitulo,s.versiculo;

  SET v_insertados_14=ROW_COUNT();
  IF v_insertados_14<>105 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se insertaron exactamente 105 versículos';
  END IF;

  UPDATE lvj_bib_libros
  SET capitulos=14,updated_at=CURRENT_TIMESTAMP
  WHERE id=v_libro_id AND version_id=v_version_id AND codigo='DAN' AND capitulos=12 AND deleted_at IS NULL;
  IF ROW_COUNT()<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se actualizó a 14 el total de capítulos de DAN';
  END IF;

  SELECT COUNT(*) INTO v_insertados_13 FROM lvj_bib_versiculos
  WHERE version_id=v_version_id AND libro_id=v_libro_id AND capitulo=13 AND deleted_at IS NULL;
  SELECT COUNT(*) INTO v_insertados_14 FROM lvj_bib_versiculos
  WHERE version_id=v_version_id AND libro_id=v_libro_id AND capitulo=14 AND deleted_at IS NULL;
  IF v_insertados_13<>65 OR v_insertados_14<>40 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: las cantidades finales 65/40 no coinciden';
  END IF;

  IF EXISTS (
    SELECT 1 FROM lvj_bib_versiculos
    WHERE id=v_original_id
      AND (LOCATE(v_marca_susana,texto)>0 OR LOCATE(v_marca_bel,texto)>0)
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Daniel 12:13 aún contiene bloques de Susana o Bel';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT capitulo,versiculo FROM lvj_bib_versiculos
    WHERE version_id=v_version_id AND libro_id=v_libro_id
      AND capitulo IN (12,13,14) AND deleted_at IS NULL
    GROUP BY capitulo,versiculo HAVING COUNT(*)>1
  ) duplicados;
  IF v_count<>0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: la validación final detectó versículos duplicados';
  END IF;

  SELECT CONCAT(
    (SELECT texto FROM lvj_bib_versiculos WHERE id=v_original_id),
    ' ',
    (SELECT GROUP_CONCAT(CONCAT(versiculo,'. ',texto) ORDER BY versiculo SEPARATOR ' ')
     FROM lvj_bib_versiculos WHERE version_id=v_version_id AND libro_id=v_libro_id AND capitulo=13 AND deleted_at IS NULL),
    ' ',
    (SELECT GROUP_CONCAT(CONCAT(versiculo,'. ',texto) ORDER BY versiculo SEPARATOR ' ')
     FROM lvj_bib_versiculos WHERE version_id=v_version_id AND libro_id=v_libro_id AND capitulo=14 AND deleted_at IS NULL)
  ) INTO v_reconstruido_total;
  IF NOT (BINARY v_texto_original <=> BINARY v_reconstruido_total) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: la base segmentada no reconstruye exactamente el original';
  END IF;

  COMMIT;

  SELECT
    'CORRECCION_APLICADA' AS resultado,
    v_original_id AS registro_actualizado,
    v_insertados_13 AS versiculos_daniel_13,
    v_insertados_14 AS versiculos_daniel_14,
    14 AS capitulos_declarados,
    CHAR_LENGTH(v_texto_original) AS caracteres_originales,
    CHAR_LENGTH(v_reconstruido_total) AS caracteres_reconstruidos,
    (BINARY v_texto_original <=> BINARY v_reconstruido_total) AS reconstruccion_identica;
END$$

DELIMITER ;

CALL lvj_corregir_daniel_torres_amat_20260720();
DROP PROCEDURE IF EXISTS lvj_corregir_daniel_torres_amat_20260720;

-- Validación visible posterior. Debe devolver 13, 65 y 40 filas respectivamente.
SELECT capitulo,COUNT(*) AS versiculos,MIN(versiculo) AS primero,MAX(versiculo) AS ultimo
FROM lvj_bib_versiculos
WHERE version_id=(SELECT id FROM lvj_bib_versiones WHERE codigo='TORRESAMAT' AND estado=1 AND deleted_at IS NULL LIMIT 1)
  AND libro_id=(SELECT id FROM lvj_bib_libros WHERE version_id=(SELECT id FROM lvj_bib_versiones WHERE codigo='TORRESAMAT' AND estado=1 AND deleted_at IS NULL LIMIT 1) AND codigo='DAN' AND estado=1 AND deleted_at IS NULL LIMIT 1)
  AND capitulo IN (12,13,14) AND deleted_at IS NULL
GROUP BY capitulo ORDER BY capitulo;
