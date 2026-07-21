-- Auditoría de solo lectura para BAR, DAN y EST en TORRESAMAT.
-- No crea, actualiza ni elimina registros.
-- Ejecutar completa en lavozdej_Radio y guardar todos los resultados.

SELECT DATABASE() AS base_actual, VERSION() AS version_mysql;

-- 1. Identidad y procedencia declarada de la versión importada.
SELECT id,nombre,abreviatura,codigo,fuente,fuente_url,copyright_notas,
       canon,versificacion,estado,created_at,updated_at
FROM lvj_bib_versiones
WHERE codigo='TORRESAMAT' AND deleted_at IS NULL;

-- 2. Estructura declarada y estructura realmente almacenada.
SELECT l.codigo,l.nombre,l.capitulos AS capitulos_declarados,
       COUNT(v.id) AS registros,
       MIN(v.capitulo) AS primer_capitulo,
       MAX(v.capitulo) AS ultimo_capitulo,
       MAX(CHAR_LENGTH(v.texto)) AS registro_mas_largo
FROM lvj_bib_versiones ver
INNER JOIN lvj_bib_libros l
  ON l.version_id=ver.id AND l.codigo IN ('BAR','DAN','EST')
 AND l.estado=1 AND l.deleted_at IS NULL
LEFT JOIN lvj_bib_versiculos v
  ON v.version_id=ver.id AND v.libro_id=l.id
 AND v.estado=1 AND v.deleted_at IS NULL
WHERE ver.codigo='TORRESAMAT' AND ver.deleted_at IS NULL
GROUP BY l.id,l.codigo,l.nombre,l.capitulos
ORDER BY l.orden,l.id;

-- 3. Cantidad de registros por capítulo. Permite detectar capítulos absorbidos.
SELECT l.codigo,v.capitulo,COUNT(*) AS registros,
       MIN(v.versiculo) AS primero,MAX(v.versiculo) AS ultimo,
       SUM(CHAR_LENGTH(v.texto)) AS caracteres
FROM lvj_bib_versiones ver
INNER JOIN lvj_bib_libros l
  ON l.version_id=ver.id AND l.codigo IN ('BAR','DAN','EST')
 AND l.deleted_at IS NULL
INNER JOIN lvj_bib_versiculos v
  ON v.version_id=ver.id AND v.libro_id=l.id
 AND v.estado=1 AND v.deleted_at IS NULL
WHERE ver.codigo='TORRESAMAT' AND ver.deleted_at IS NULL
GROUP BY l.codigo,v.capitulo
ORDER BY l.codigo,v.capitulo;

-- 4. Registros largos o con posibles números internos.
-- Los resultados son candidatos: notas al pie también pueden contener números.
SELECT l.codigo,v.id,v.capitulo,v.versiculo,
       CHAR_LENGTH(v.texto) AS caracteres,v.texto
FROM lvj_bib_versiones ver
INNER JOIN lvj_bib_libros l
  ON l.version_id=ver.id AND l.codigo IN ('BAR','DAN','EST')
 AND l.deleted_at IS NULL
INNER JOIN lvj_bib_versiculos v
  ON v.version_id=ver.id AND v.libro_id=l.id
 AND v.estado=1 AND v.deleted_at IS NULL
WHERE ver.codigo='TORRESAMAT' AND ver.deleted_at IS NULL
  AND (CHAR_LENGTH(v.texto)>=800
       OR v.texto REGEXP '(^|[[:space:]])[0-9]{1,3}[.)][[:space:]]')
ORDER BY l.codigo,v.capitulo,v.versiculo,v.id;

-- 5. Baruc 5:9 y todo Baruc 6, incluyendo el texto completo.
SELECT v.id,v.capitulo,v.versiculo,CHAR_LENGTH(v.texto) AS caracteres,
       v.titulo_seccion,v.texto
FROM lvj_bib_versiones ver
INNER JOIN lvj_bib_libros l
  ON l.version_id=ver.id AND l.codigo='BAR' AND l.deleted_at IS NULL
INNER JOIN lvj_bib_versiculos v
  ON v.version_id=ver.id AND v.libro_id=l.id AND v.deleted_at IS NULL
WHERE ver.codigo='TORRESAMAT' AND ver.deleted_at IS NULL
  AND ((v.capitulo=5 AND v.versiculo=9) OR v.capitulo=6)
ORDER BY v.capitulo,v.versiculo,v.id;

-- 6. Relaciones y fragmentos existentes en los tres libros.
SELECT uc.libro_codigo,uc.codigo_canonico,
       uc.estado_revision AS estado_unidad,
       ver.codigo AS version,l.codigo AS libro,
       v.id AS versiculo_id,v.capitulo,v.versiculo,
       uv.fragmento_inicio,uv.fragmento_longitud,
       uv.referencia_editorial,uv.tipo_equivalencia,
       uv.estado_revision AS estado_relacion
FROM lvj_bib_unidades_canonicas uc
INNER JOIN lvj_bib_unidades_versiculos uv
  ON uv.unidad_canonica_id=uc.id AND uv.deleted_at IS NULL
INNER JOIN lvj_bib_versiculos v
  ON v.id=uv.versiculo_id AND v.deleted_at IS NULL
INNER JOIN lvj_bib_versiones ver
  ON ver.id=v.version_id AND ver.deleted_at IS NULL
INNER JOIN lvj_bib_libros l
  ON l.id=v.libro_id AND l.deleted_at IS NULL
WHERE uc.libro_codigo IN ('BAR','DAN','EST') AND uc.deleted_at IS NULL
ORDER BY uc.libro_codigo,uc.codigo_canonico,ver.codigo,v.capitulo,v.versiculo,uv.id;

-- 7. Resumen para saber qué se aprobó y qué utiliza fragmentos.
SELECT uc.libro_codigo,uc.estado_revision AS estado_unidad,
       uv.estado_revision AS estado_relacion,
       COUNT(DISTINCT uc.id) AS unidades,
       COUNT(*) AS relaciones,
       SUM(uv.fragmento_inicio IS NOT NULL OR uv.fragmento_longitud IS NOT NULL)
         AS relaciones_con_fragmentos
FROM lvj_bib_unidades_canonicas uc
INNER JOIN lvj_bib_unidades_versiculos uv
  ON uv.unidad_canonica_id=uc.id AND uv.deleted_at IS NULL
WHERE uc.libro_codigo IN ('BAR','DAN','EST') AND uc.deleted_at IS NULL
GROUP BY uc.libro_codigo,uc.estado_revision,uv.estado_revision
ORDER BY uc.libro_codigo,uc.estado_revision,uv.estado_revision;

-- 8. Duplicados físicos por versión/libro/capítulo/versículo.
SELECT ver.codigo AS version,l.codigo,v.capitulo,v.versiculo,COUNT(*) AS duplicados
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id AND ver.deleted_at IS NULL
INNER JOIN lvj_bib_libros l ON l.id=v.libro_id AND l.deleted_at IS NULL
WHERE ver.codigo IN ('SPAPLATENSE','TORRESAMAT')
  AND l.codigo IN ('BAR','DAN','EST') AND v.deleted_at IS NULL
GROUP BY ver.codigo,l.codigo,v.capitulo,v.versiculo
HAVING COUNT(*)>1
ORDER BY l.codigo,ver.codigo,v.capitulo,v.versiculo;

