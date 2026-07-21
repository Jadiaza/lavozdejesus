-- Revierte exactamente los estados guardados por la cuarentena.
-- No modifica textos, unidades ni relaciones distintas al lote indicado.

ALTER TABLE lvj_bib_equiv_revision_backup
  MODIFY lote VARCHAR(80) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL;

DROP PROCEDURE IF EXISTS lvj_revertir_pausa_fragmentos_bar_dan_est_20260720;
DELIMITER $$
CREATE PROCEDURE lvj_revertir_pausa_fragmentos_bar_dan_est_20260720()
BEGIN
  DECLARE v_lote VARCHAR(80) CHARACTER SET ascii COLLATE ascii_general_ci
    DEFAULT 'AUDITORIA_FUENTE_BAR_DAN_EST_20260720';
  DECLARE v_existentes INT DEFAULT 0;

  SELECT COUNT(*) INTO v_existentes
  FROM lvj_bib_equiv_revision_backup WHERE lote=v_lote;
  IF v_existentes=0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Abortado: no existe el respaldo de la cuarentena';
  END IF;

  START TRANSACTION;

  UPDATE lvj_bib_unidades_versiculos uv
  INNER JOIN lvj_bib_equiv_revision_backup b
    ON b.lote=v_lote AND b.entidad='relacion' AND b.entidad_id=uv.id
  SET uv.estado_revision=b.estado_revision,uv.updated_at=CURRENT_TIMESTAMP
  WHERE uv.deleted_at IS NULL;

  UPDATE lvj_bib_unidades_canonicas uc
  INNER JOIN lvj_bib_equiv_revision_backup b
    ON b.lote=v_lote AND b.entidad='unidad' AND b.entidad_id=uc.id
  SET uc.estado_revision=b.estado_revision,uc.updated_at=CURRENT_TIMESTAMP
  WHERE uc.deleted_at IS NULL;

  DELETE FROM lvj_bib_equiv_revision_backup WHERE lote=v_lote;
  COMMIT;

  SELECT 'CUARENTENA_REVERTIDA' AS resultado,v_lote AS lote;
END$$
DELIMITER ;

CALL lvj_revertir_pausa_fragmentos_bar_dan_est_20260720();
DROP PROCEDURE IF EXISTS lvj_revertir_pausa_fragmentos_bar_dan_est_20260720;
