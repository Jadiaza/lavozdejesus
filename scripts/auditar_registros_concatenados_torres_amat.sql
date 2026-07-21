-- Segunda auditoría de solo lectura.
-- Muestra íntegros los seis registros concatenados detectados y su contexto.

SELECT ver.codigo AS version,l.codigo AS libro,v.id,v.capitulo,v.versiculo,
       CHAR_LENGTH(v.texto) AS caracteres,v.texto
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver ON ver.id=v.version_id AND ver.deleted_at IS NULL
INNER JOIN lvj_bib_libros l ON l.id=v.libro_id AND l.deleted_at IS NULL
WHERE ver.codigo='TORRESAMAT'
  AND ((l.codigo='BAR' AND ((v.capitulo=2 AND v.versiculo=25)
                         OR (v.capitulo=3 AND v.versiculo=27)
                         OR (v.capitulo=4 AND v.versiculo=32)
                         OR (v.capitulo=6 AND v.versiculo=20)))
       OR (l.codigo='DAN' AND v.capitulo=3 AND v.versiculo=23)
       OR (l.codigo='EST' AND v.capitulo=10 AND v.versiculo=3))
  AND v.deleted_at IS NULL
ORDER BY l.codigo,v.capitulo,v.versiculo;

-- Comparación de cantidades reales entre ambas versiones.
SELECT l.codigo,v.capitulo,
       SUM(ver.codigo='SPAPLATENSE') AS platense,
       SUM(ver.codigo='TORRESAMAT') AS torres_amat
FROM lvj_bib_versiculos v
INNER JOIN lvj_bib_versiones ver
  ON ver.id=v.version_id AND ver.codigo IN ('SPAPLATENSE','TORRESAMAT')
 AND ver.deleted_at IS NULL
INNER JOIN lvj_bib_libros l
  ON l.id=v.libro_id AND l.codigo IN ('BAR','DAN','EST') AND l.deleted_at IS NULL
WHERE v.estado=1 AND v.deleted_at IS NULL
GROUP BY l.codigo,v.capitulo
ORDER BY l.codigo,v.capitulo;

