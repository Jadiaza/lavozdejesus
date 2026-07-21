-- Cuarentena reversible de equivalencias con fragmentos en BAR, DAN y EST.
-- No modifica ningún texto bíblico ni elimina relaciones.

CREATE TABLE IF NOT EXISTS lvj_bib_equiv_revision_backup (
  lote VARCHAR(80) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  entidad ENUM('unidad','relacion') NOT NULL,
  entidad_id BIGINT UNSIGNED NOT NULL,
  estado_revision VARCHAR(20) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (lote,entidad,entidad_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Corrige también la tabla si fue creada por una ejecución anterior que se
-- detuvo antes de aplicar la cuarentena.
ALTER TABLE lvj_bib_equiv_revision_backup
  MODIFY lote VARCHAR(80) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL;

DROP PROCEDURE IF EXISTS lvj_pausar_fragmentos_bar_dan_est_20260720;
DELIMITER $$
CREATE PROCEDURE lvj_pausar_fragmentos_bar_dan_est_20260720()
BEGIN
  DECLARE v_lote VARCHAR(80) CHARACTER SET ascii COLLATE ascii_general_ci
    DEFAULT 'AUDITORIA_FUENTE_BAR_DAN_EST_20260720';
  DECLARE v_existentes INT DEFAULT 0;
  DECLARE v_unidades INT DEFAULT 0;
  DECLARE v_relaciones INT DEFAULT 0;

  SELECT COUNT(*) INTO v_existentes
  FROM lvj_bib_equiv_revision_backup WHERE lote=v_lote;
  IF v_existentes<>0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Abortado: la cuarentena ya fue aplicada o existe un respaldo con este lote';
  END IF;

  START TRANSACTION;

  INSERT INTO lvj_bib_equiv_revision_backup(lote,entidad,entidad_id,estado_revision)
  SELECT v_lote,'unidad',uc.id,uc.estado_revision
  FROM lvj_bib_unidades_canonicas uc
  WHERE uc.libro_codigo IN ('BAR','DAN','EST') AND uc.deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM lvj_bib_unidades_versiculos uv
      WHERE uv.unidad_canonica_id=uc.id AND uv.deleted_at IS NULL
        AND (uv.fragmento_inicio IS NOT NULL OR uv.fragmento_longitud IS NOT NULL)
    );
  SET v_unidades=ROW_COUNT();

  INSERT INTO lvj_bib_equiv_revision_backup(lote,entidad,entidad_id,estado_revision)
  SELECT v_lote,'relacion',uv.id,uv.estado_revision
  FROM lvj_bib_unidades_versiculos uv
  INNER JOIN lvj_bib_equiv_revision_backup b
    ON b.lote=v_lote AND b.entidad='unidad' AND b.entidad_id=uv.unidad_canonica_id
  WHERE uv.deleted_at IS NULL;
  SET v_relaciones=ROW_COUNT();

  IF v_unidades=0 OR v_relaciones=0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT='Abortado: no se localizaron unidades con fragmentos para respaldar';
  END IF;

  UPDATE lvj_bib_unidades_versiculos uv
  INNER JOIN lvj_bib_equiv_revision_backup b
    ON b.lote=v_lote AND b.entidad='relacion' AND b.entidad_id=uv.id
  SET uv.estado_revision='pendiente',uv.updated_at=CURRENT_TIMESTAMP
  WHERE uv.deleted_at IS NULL AND uv.estado_revision<>'pendiente';

  UPDATE lvj_bib_unidades_canonicas uc
  INNER JOIN lvj_bib_equiv_revision_backup b
    ON b.lote=v_lote AND b.entidad='unidad' AND b.entidad_id=uc.id
  SET uc.estado_revision='pendiente',uc.updated_at=CURRENT_TIMESTAMP
  WHERE uc.deleted_at IS NULL AND uc.estado_revision<>'pendiente';

  COMMIT;

  SELECT 'CUARENTENA_APLICADA' AS resultado,v_lote AS lote,
         v_unidades AS unidades_respaldadas,v_relaciones AS relaciones_respaldadas;
END$$
DELIMITER ;

CALL lvj_pausar_fragmentos_bar_dan_est_20260720();
DROP PROCEDURE IF EXISTS lvj_pausar_fragmentos_bar_dan_est_20260720;

SELECT uc.libro_codigo,uc.estado_revision,COUNT(DISTINCT uc.id) AS unidades,
       SUM(uv.fragmento_inicio IS NOT NULL OR uv.fragmento_longitud IS NOT NULL)
         AS relaciones_con_fragmentos
FROM lvj_bib_unidades_canonicas uc
INNER JOIN lvj_bib_unidades_versiculos uv
  ON uv.unidad_canonica_id=uc.id AND uv.deleted_at IS NULL
WHERE uc.libro_codigo IN ('BAR','DAN','EST') AND uc.deleted_at IS NULL
GROUP BY uc.libro_codigo,uc.estado_revision
ORDER BY uc.libro_codigo,uc.estado_revision;
