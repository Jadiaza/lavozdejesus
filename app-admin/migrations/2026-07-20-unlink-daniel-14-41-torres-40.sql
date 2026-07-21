-- Corrige una propuesta pendiente ya creada: Platense 14:41 debe mostrarse sin equivalente Torres Amat.
-- Conserva auditoría mediante borrado lógico de la relación incorrecta; no modifica textos bíblicos.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
START TRANSACTION;

SET @unidad_41 := (
  SELECT id FROM lvj_bib_unidades_canonicas
  WHERE codigo_canonico='DAN.VULG.014.041-PARCIAL-TA040'
    AND estado_revision='pendiente' AND deleted_at IS NULL
  LIMIT 1
);

UPDATE lvj_bib_unidades_versiculos uv
INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id
INNER JOIN lvj_bib_libros lib ON lib.id=v.libro_id
SET uv.deleted_at=CURRENT_TIMESTAMP,uv.updated_at=CURRENT_TIMESTAMP
WHERE uv.unidad_canonica_id=@unidad_41
  AND ver.codigo='TORRESAMAT' AND lib.codigo='DAN'
  AND v.capitulo=14 AND v.versiculo=40
  AND uv.estado_revision='pendiente' AND uv.deleted_at IS NULL;

UPDATE lvj_bib_unidades_canonicas
SET codigo_canonico='DAN.VULG.014.041-SIN-TA',
    descripcion='Daniel 14, correspondencia editorial parcial 41',
    observaciones='SPAPLATENSE 14:41 ↔ sin equivalente en TORRESAMAT',
    updated_at=CURRENT_TIMESTAMP
WHERE id=@unidad_41 AND estado_revision='pendiente' AND deleted_at IS NULL;

COMMIT;

SELECT uc.codigo_canonico,uc.estado_revision,v.capitulo,v.versiculo,ver.codigo AS version
FROM lvj_bib_unidades_canonicas uc
INNER JOIN lvj_bib_unidades_versiculos uv ON uv.unidad_canonica_id=uc.id AND uv.deleted_at IS NULL
INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id AND v.deleted_at IS NULL
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id
WHERE uc.codigo_canonico='DAN.VULG.014.041-SIN-TA' AND uc.deleted_at IS NULL;

