-- Auditoría integral de solo lectura: SPAPLATENSE frente a TORRESAMAT.
-- Compatible con MariaDB 10.11. No modifica, inserta ni elimina información.
-- Los posibles textos concatenados son candidatos para revisión humana.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @spa_id := (
  SELECT MIN(id) FROM lvj_bib_versiones
  WHERE codigo COLLATE utf8mb4_unicode_ci = 'SPAPLATENSE' COLLATE utf8mb4_unicode_ci
    AND estado=1 AND deleted_at IS NULL
);
SET @ta_id := (
  SELECT MIN(id) FROM lvj_bib_versiones
  WHERE codigo COLLATE utf8mb4_unicode_ci = 'TORRESAMAT' COLLATE utf8mb4_unicode_ci
    AND estado=1 AND deleted_at IS NULL
);

-- 1. Guardas iniciales. Cada versión debe aparecer exactamente una vez.
SELECT DATABASE() AS base_actual, VERSION() AS version_mysql,
       @spa_id AS spaplatense_id, @ta_id AS torresamat_id,
       (SELECT COUNT(*) FROM lvj_bib_versiones
        WHERE codigo COLLATE utf8mb4_unicode_ci='SPAPLATENSE' COLLATE utf8mb4_unicode_ci
          AND estado=1 AND deleted_at IS NULL) AS versiones_spaplatense,
       (SELECT COUNT(*) FROM lvj_bib_versiones
        WHERE codigo COLLATE utf8mb4_unicode_ci='TORRESAMAT' COLLATE utf8mb4_unicode_ci
          AND estado=1 AND deleted_at IS NULL) AS versiones_torresamat;

-- 2. Libros ausentes en alguna versión o repetidos dentro de ella.
SELECT codigo, version, COUNT(*) AS registros
FROM (
  SELECT codigo, 'SPAPLATENSE' AS version
  FROM lvj_bib_libros WHERE version_id=@spa_id AND estado=1 AND deleted_at IS NULL
  UNION ALL
  SELECT codigo, 'TORRESAMAT'
  FROM lvj_bib_libros WHERE version_id=@ta_id AND estado=1 AND deleted_at IS NULL
) libros
GROUP BY codigo,version
HAVING COUNT(*)<>1
ORDER BY codigo,version;

SELECT x.codigo,
       SUM(x.version='SPAPLATENSE') AS existe_spaplatense,
       SUM(x.version='TORRESAMAT') AS existe_torresamat
FROM (
  SELECT codigo,'SPAPLATENSE' AS version
  FROM lvj_bib_libros WHERE version_id=@spa_id AND estado=1 AND deleted_at IS NULL
  UNION ALL
  SELECT codigo,'TORRESAMAT'
  FROM lvj_bib_libros WHERE version_id=@ta_id AND estado=1 AND deleted_at IS NULL
) x
GROUP BY x.codigo
HAVING existe_spaplatense<>1 OR existe_torresamat<>1
ORDER BY x.codigo;

-- 3. Capítulos declarados frente a capítulos realmente almacenados.
SELECT ver.codigo AS version,l.codigo AS libro,l.nombre,
       l.capitulos AS capitulos_declarados,
       COUNT(DISTINCT v.capitulo) AS capitulos_con_texto,
       MIN(v.capitulo) AS primer_capitulo,MAX(v.capitulo) AS ultimo_capitulo,
       COUNT(v.id) AS registros_versiculos
FROM lvj_bib_versiones ver
INNER JOIN lvj_bib_libros l
  ON l.version_id=ver.id AND l.estado=1 AND l.deleted_at IS NULL
LEFT JOIN lvj_bib_versiculos v
  ON v.version_id=ver.id AND v.libro_id=l.id AND v.estado=1 AND v.deleted_at IS NULL
WHERE ver.id IN (@spa_id,@ta_id)
GROUP BY ver.id,ver.codigo,l.id,l.codigo,l.nombre,l.capitulos
HAVING capitulos_con_texto<>l.capitulos
    OR primer_capitulo<>1 OR ultimo_capitulo<>l.capitulos
ORDER BY l.orden,ver.id;

-- 4. Comparación completa capítulo por capítulo.
-- tipo_diferencia indica capítulo ausente o diferencia en la secuencia de versículos.
SELECT spa.codigo AS libro,spa.nombre,
       cs.capitulo,
       cs.cantidad AS versiculos_spaplatense,
       ct.cantidad AS versiculos_torresamat,
       cs.primero AS primero_spaplatense,cs.ultimo AS ultimo_spaplatense,
       ct.primero AS primero_torresamat,ct.ultimo AS ultimo_torresamat,
       CASE
         WHEN ct.capitulo IS NULL THEN 'CAPITULO_AUSENTE_EN_TORRESAMAT'
         WHEN cs.cantidad<>ct.cantidad OR cs.primero<>ct.primero OR cs.ultimo<>ct.ultimo
           THEN 'NUMERACION_INTERNA_DIFERENTE'
         ELSE 'COMPATIBLE'
       END AS tipo_diferencia
FROM lvj_bib_libros spa
INNER JOIN lvj_bib_libros ta
  ON ta.version_id=@ta_id
 AND ta.codigo COLLATE utf8mb4_unicode_ci=spa.codigo COLLATE utf8mb4_unicode_ci
 AND ta.estado=1 AND ta.deleted_at IS NULL
INNER JOIN (
  SELECT libro_id,capitulo,COUNT(DISTINCT versiculo) AS cantidad,
         MIN(versiculo) AS primero,MAX(versiculo) AS ultimo
  FROM lvj_bib_versiculos
  WHERE version_id=@spa_id AND estado=1 AND deleted_at IS NULL
  GROUP BY libro_id,capitulo
) cs ON cs.libro_id=spa.id
LEFT JOIN (
  SELECT libro_id,capitulo,COUNT(DISTINCT versiculo) AS cantidad,
         MIN(versiculo) AS primero,MAX(versiculo) AS ultimo
  FROM lvj_bib_versiculos
  WHERE version_id=@ta_id AND estado=1 AND deleted_at IS NULL
  GROUP BY libro_id,capitulo
) ct ON ct.libro_id=ta.id AND ct.capitulo=cs.capitulo
WHERE spa.version_id=@spa_id AND spa.estado=1 AND spa.deleted_at IS NULL
  AND (ct.capitulo IS NULL OR cs.cantidad<>ct.cantidad
       OR cs.primero<>ct.primero OR cs.ultimo<>ct.ultimo)
UNION ALL
SELECT spa.codigo,spa.nombre,ct.capitulo,
       NULL,ct.cantidad,NULL,NULL,ct.primero,ct.ultimo,
       'CAPITULO_AUSENTE_EN_SPAPLATENSE'
FROM lvj_bib_libros spa
INNER JOIN lvj_bib_libros ta
  ON ta.version_id=@ta_id
 AND ta.codigo COLLATE utf8mb4_unicode_ci=spa.codigo COLLATE utf8mb4_unicode_ci
 AND ta.estado=1 AND ta.deleted_at IS NULL
INNER JOIN (
  SELECT libro_id,capitulo,COUNT(DISTINCT versiculo) AS cantidad,
         MIN(versiculo) AS primero,MAX(versiculo) AS ultimo
  FROM lvj_bib_versiculos
  WHERE version_id=@ta_id AND estado=1 AND deleted_at IS NULL
  GROUP BY libro_id,capitulo
) ct ON ct.libro_id=ta.id
LEFT JOIN (
  SELECT libro_id,capitulo
  FROM lvj_bib_versiculos
  WHERE version_id=@spa_id AND estado=1 AND deleted_at IS NULL
  GROUP BY libro_id,capitulo
) cs ON cs.libro_id=spa.id AND cs.capitulo=ct.capitulo
WHERE spa.version_id=@spa_id AND spa.estado=1 AND spa.deleted_at IS NULL
  AND cs.capitulo IS NULL
ORDER BY libro,capitulo;

-- 5. Referencias duplicadas. El resultado correcto es cero filas.
SELECT ver.codigo AS version,l.codigo AS libro,v.capitulo,v.versiculo,
       COUNT(*) AS duplicados,GROUP_CONCAT(v.id ORDER BY v.id) AS ids
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id
INNER JOIN lvj_bib_libros l ON l.id=v.libro_id
WHERE v.version_id IN (@spa_id,@ta_id) AND v.estado=1 AND v.deleted_at IS NULL
GROUP BY v.version_id,v.libro_id,v.capitulo,v.versiculo
HAVING COUNT(*)>1
ORDER BY l.orden,v.capitulo,v.versiculo;

-- 6. Capítulos con saltos, inicio distinto de 1 o números repetidos.
SELECT ver.codigo AS version,l.codigo AS libro,v.capitulo,
       COUNT(*) AS registros,COUNT(DISTINCT v.versiculo) AS numeros_distintos,
       MIN(v.versiculo) AS primero,MAX(v.versiculo) AS ultimo,
       (MAX(v.versiculo)-MIN(v.versiculo)+1)-COUNT(DISTINCT v.versiculo) AS numeros_faltantes
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id
INNER JOIN lvj_bib_libros l ON l.id=v.libro_id
WHERE v.version_id IN (@spa_id,@ta_id) AND v.estado=1 AND v.deleted_at IS NULL
GROUP BY v.version_id,v.libro_id,v.capitulo
HAVING primero<>1 OR registros<>numeros_distintos
    OR numeros_distintos<>(ultimo-primero+1)
ORDER BY l.orden,v.capitulo,ver.id;

-- 7. Referencias fuera del rango declarado o con números inválidos.
SELECT ver.codigo AS version,l.codigo AS libro,l.capitulos AS capitulos_declarados,
       v.id,v.capitulo,v.versiculo,CHAR_LENGTH(v.texto) AS caracteres
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id
INNER JOIN lvj_bib_libros l ON l.id=v.libro_id
WHERE v.version_id IN (@spa_id,@ta_id) AND v.estado=1 AND v.deleted_at IS NULL
  AND (v.capitulo<1 OR v.capitulo>l.capitulos OR v.versiculo<1)
ORDER BY l.orden,v.capitulo,v.versiculo;

-- 8. Textos vacíos. El resultado correcto es cero filas.
SELECT ver.codigo AS version,l.codigo AS libro,v.id,v.capitulo,v.versiculo,
       CHAR_LENGTH(v.texto) AS caracteres
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id
INNER JOIN lvj_bib_libros l ON l.id=v.libro_id
WHERE v.version_id IN (@spa_id,@ta_id) AND v.estado=1 AND v.deleted_at IS NULL
  AND (v.texto IS NULL OR CHAR_LENGTH(TRIM(v.texto))=0)
ORDER BY l.orden,v.capitulo,v.versiculo;

-- 9. Versículos anormalmente extensos respecto del promedio de su libro.
-- El umbral combinado reduce falsos positivos: mínimo 800 caracteres y 6 veces el promedio.
SELECT ver.codigo AS version,l.codigo AS libro,v.id,v.capitulo,v.versiculo,
       CHAR_LENGTH(v.texto) AS caracteres,
       ROUND(prom.promedio,1) AS promedio_libro,
       LEFT(v.texto,300) AS inicio_texto
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id
INNER JOIN lvj_bib_libros l ON l.id=v.libro_id
INNER JOIN (
  SELECT version_id,libro_id,AVG(CHAR_LENGTH(texto)) AS promedio
  FROM lvj_bib_versiculos
  WHERE version_id IN (@spa_id,@ta_id) AND estado=1 AND deleted_at IS NULL
  GROUP BY version_id,libro_id
) prom ON prom.version_id=v.version_id AND prom.libro_id=v.libro_id
WHERE v.version_id IN (@spa_id,@ta_id) AND v.estado=1 AND v.deleted_at IS NULL
  AND CHAR_LENGTH(v.texto)>=800
  AND CHAR_LENGTH(v.texto)>=prom.promedio*6
ORDER BY CHAR_LENGTH(v.texto) DESC;

-- 10. Candidatos con numeraciones internas que podrían contener varios versículos concatenados.
-- Puede producir falsos positivos en genealogías, edades, cantidades o citas numéricas.
SELECT ver.codigo AS version,l.codigo AS libro,v.id,v.capitulo,v.versiculo,
       CHAR_LENGTH(v.texto) AS caracteres,
       LEFT(v.texto,500) AS inicio_texto
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id
INNER JOIN lvj_bib_libros l ON l.id=v.libro_id
WHERE v.version_id IN (@spa_id,@ta_id) AND v.estado=1 AND v.deleted_at IS NULL
  AND CHAR_LENGTH(v.texto)>=300
  AND v.texto REGEXP '[[:space:]][0-9]{1,3}[.)][[:space:]]'
ORDER BY CHAR_LENGTH(v.texto) DESC,l.orden,v.capitulo,v.versiculo;

-- 11. Cobertura de equivalencias existentes por libro y estado.
SELECT l.codigo AS libro,ver.codigo AS version,
       COUNT(DISTINCT v.id) AS versiculos_totales,
       COUNT(DISTINCT uv.versiculo_id) AS versiculos_con_equivalencia,
       COUNT(DISTINCT CASE WHEN uc.estado_revision='aprobado'
                           AND uv.estado_revision='aprobado' THEN uv.versiculo_id END)
         AS versiculos_con_equivalencia_aprobada
FROM lvj_bib_versiones ver
INNER JOIN lvj_bib_libros l
  ON l.version_id=ver.id AND l.estado=1 AND l.deleted_at IS NULL
INNER JOIN lvj_bib_versiculos v
  ON v.version_id=ver.id AND v.libro_id=l.id AND v.estado=1 AND v.deleted_at IS NULL
LEFT JOIN lvj_bib_unidades_versiculos uv
  ON uv.versiculo_id=v.id AND uv.deleted_at IS NULL
LEFT JOIN lvj_bib_unidades_canonicas uc
  ON uc.id=uv.unidad_canonica_id AND uc.deleted_at IS NULL
WHERE ver.id IN (@spa_id,@ta_id)
GROUP BY l.codigo,ver.codigo,l.orden
ORDER BY l.orden,ver.id;

-- Fin. Esta auditoría no ejecuta UPDATE, INSERT, DELETE, ALTER ni CREATE.
