-- Complemento idempotente si el mapa Daniel 14 fue ejecutado antes de incorporar Platense 14:42.
-- Crea una unidad parcial pendiente con solo la relación SPAPLATENSE; no inventa texto TORRESAMAT.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
START TRANSACTION;

SET @spa_version := (SELECT id FROM lvj_bib_versiones WHERE codigo='SPAPLATENSE' AND estado=1 AND deleted_at IS NULL LIMIT 1);
SET @spa_dan := (SELECT id FROM lvj_bib_libros WHERE version_id=@spa_version AND codigo='DAN' AND estado=1 AND deleted_at IS NULL LIMIT 1);
SET @spa_14_42 := (SELECT id FROM lvj_bib_versiculos WHERE version_id=@spa_version AND libro_id=@spa_dan AND capitulo=14 AND versiculo=42 AND estado=1 AND deleted_at IS NULL LIMIT 1);

INSERT INTO lvj_bib_unidades_canonicas
  (libro_codigo,codigo_canonico,descripcion,estado_revision,fuente,observaciones,created_at,updated_at,deleted_at)
SELECT 'DAN','DAN.VULG.014.042-SIN-TA','Daniel 14, correspondencia editorial 42',
       'pendiente','Cotejo editorial LVJ 2026-07-20',
       'SPAPLATENSE 14:42 ↔ sin equivalente en TORRESAMAT',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
WHERE @spa_14_42 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM lvj_bib_unidades_canonicas
    WHERE codigo_canonico='DAN.VULG.014.042-SIN-TA' AND deleted_at IS NULL
  );

SET @unidad_42 := (SELECT id FROM lvj_bib_unidades_canonicas WHERE codigo_canonico='DAN.VULG.014.042-SIN-TA' AND deleted_at IS NULL LIMIT 1);

INSERT INTO lvj_bib_unidades_versiculos
  (unidad_canonica_id,versiculo_id,orden,tipo_equivalencia,estado_revision,created_at,updated_at,deleted_at)
SELECT @unidad_42,@spa_14_42,1,'parcial','pendiente',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,NULL
WHERE @unidad_42 IS NOT NULL AND @spa_14_42 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM lvj_bib_unidades_versiculos
    WHERE unidad_canonica_id=@unidad_42 AND versiculo_id=@spa_14_42 AND deleted_at IS NULL
  );

COMMIT;

SELECT uc.codigo_canonico,uc.estado_revision,v.capitulo,v.versiculo,uv.tipo_equivalencia
FROM lvj_bib_unidades_canonicas uc
INNER JOIN lvj_bib_unidades_versiculos uv ON uv.unidad_canonica_id=uc.id AND uv.deleted_at IS NULL
INNER JOIN lvj_bib_versiculos v ON v.id=uv.versiculo_id AND v.deleted_at IS NULL
WHERE uc.codigo_canonico='DAN.VULG.014.042-SIN-TA' AND uc.deleted_at IS NULL;

