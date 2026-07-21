-- Reversión de scripts/corregir_daniel_torres_amat.sql.
-- Elimina únicamente los 105 versículos creados y restaura literalmente el respaldo de 12:13.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE lvj_bib_respaldo_daniel_torres_amat
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

DELIMITER $$

CREATE OR REPLACE PROCEDURE lvj_revertir_daniel_torres_amat_20260720()
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
  DECLARE v_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  SELECT COUNT(*),MIN(original_id),MIN(version_id),MIN(libro_id),MIN(capitulos_libro_original),
         MIN(libro_updated_at_original),MIN(texto)
    INTO v_count,v_original_id,v_version_id,v_libro_id,v_capitulos_original,
         v_libro_updated_at_original,v_texto_original
  FROM lvj_bib_respaldo_daniel_torres_amat
  WHERE clave_ejecucion=v_clave;
  IF v_count<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no existe un respaldo único para revertir';
  END IF;

  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_version_id AND libro_id=v_libro_id AND capitulo=13 AND deleted_at IS NULL;
  IF v_count<>65 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Daniel 13 ya no contiene exactamente 65 registros';
  END IF;
  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_version_id AND libro_id=v_libro_id AND capitulo=14 AND deleted_at IS NULL;
  IF v_count<>40 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Daniel 14 ya no contiene exactamente 40 registros';
  END IF;
  SELECT COUNT(*) INTO v_count FROM lvj_bib_libros
  WHERE id=v_libro_id AND version_id=v_version_id AND codigo='DAN' AND capitulos=14 AND deleted_at IS NULL;
  IF v_count<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: el libro DAN ya no se encuentra en el estado corregido esperado';
  END IF;

  START TRANSACTION;

  DELETE FROM lvj_bib_versiculos
  WHERE version_id=v_version_id AND libro_id=v_libro_id
    AND capitulo IN (13,14) AND deleted_at IS NULL;
  IF ROW_COUNT()<>105 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se eliminaron exactamente los 105 registros creados';
  END IF;

  UPDATE lvj_bib_versiculos v
  INNER JOIN lvj_bib_respaldo_daniel_torres_amat b
    ON b.original_id=v.id AND b.clave_ejecucion=v_clave
  SET v.version_id=b.version_id,
      v.libro_id=b.libro_id,
      v.capitulo=b.capitulo,
      v.versiculo=b.versiculo,
      v.texto=b.texto,
      v.titulo_seccion=b.titulo_seccion,
      v.tiene_nota=b.tiene_nota,
      v.estado=b.estado,
      v.created_at=b.created_at,
      v.updated_at=b.updated_at,
      v.deleted_at=b.deleted_at
  WHERE v.id=v_original_id;
  IF ROW_COUNT()<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se restauró exactamente Daniel 12:13';
  END IF;

  UPDATE lvj_bib_libros
  SET capitulos=v_capitulos_original,updated_at=v_libro_updated_at_original
  WHERE id=v_libro_id AND version_id=v_version_id AND codigo='DAN' AND capitulos=14 AND deleted_at IS NULL;
  IF ROW_COUNT()<>1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no se restauró el total original de capítulos';
  END IF;

  SELECT COUNT(*) INTO v_count FROM lvj_bib_versiculos
  WHERE version_id=v_version_id AND libro_id=v_libro_id
    AND capitulo IN (13,14) AND deleted_at IS NULL;
  IF v_count<>0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: persistieron registros en Daniel 13 o 14';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM lvj_bib_versiculos
    WHERE id=v_original_id AND BINARY texto=BINARY v_texto_original
      AND capitulo=12 AND versiculo=13 AND deleted_at IS NULL
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: Daniel 12:13 no coincide literalmente con el respaldo';
  END IF;

  COMMIT;

  SELECT 'REVERSION_APLICADA' AS resultado,v_original_id AS registro_restaurado,
         v_capitulos_original AS capitulos_restaurados,CHAR_LENGTH(v_texto_original) AS caracteres_restaurados;
END$$

DELIMITER ;

CALL lvj_revertir_daniel_torres_amat_20260720();
DROP PROCEDURE IF EXISTS lvj_revertir_daniel_torres_amat_20260720;
