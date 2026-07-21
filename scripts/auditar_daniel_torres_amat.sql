-- Auditoría de solo lectura: TORRESAMAT / DAN / capítulos 12, 13 y 14.
-- No modifica datos ni crea tablas.
-- Ejecutar completa en la base de producción y conservar toda la salida.

SELECT DATABASE() AS base_actual, VERSION() AS version_mysql;

SHOW CREATE TABLE lvj_bib_versiones;
SHOW CREATE TABLE lvj_bib_libros;
SHOW CREATE TABLE lvj_bib_versiculos;

SHOW COLUMNS FROM lvj_bib_versiones;
SHOW COLUMNS FROM lvj_bib_libros;
SHOW COLUMNS FROM lvj_bib_versiculos;

SET @version_id := (
  SELECT id
  FROM lvj_bib_versiones
  WHERE codigo = 'TORRESAMAT' AND estado = 1 AND deleted_at IS NULL
  ORDER BY id
  LIMIT 1
);

SET @libro_id := (
  SELECT id
  FROM lvj_bib_libros
  WHERE version_id = @version_id AND codigo = 'DAN'
    AND estado = 1 AND deleted_at IS NULL
  ORDER BY id
  LIMIT 1
);

SELECT
  @version_id AS version_id,
  @libro_id AS libro_id,
  (SELECT COUNT(*) FROM lvj_bib_versiones
   WHERE codigo = 'TORRESAMAT' AND estado = 1 AND deleted_at IS NULL) AS versiones_coincidentes,
  (SELECT COUNT(*) FROM lvj_bib_libros
   WHERE version_id = @version_id AND codigo = 'DAN'
     AND estado = 1 AND deleted_at IS NULL) AS libros_coincidentes;

SELECT id, version_id, codigo, nombre, abreviatura, capitulos, estado, deleted_at
FROM lvj_bib_libros
WHERE version_id = @version_id AND codigo = 'DAN';

-- Todos los registros existentes de los capítulos afectados.
SELECT id, version_id, libro_id, capitulo, versiculo, texto,
       CHAR_LENGTH(texto) AS caracteres, LENGTH(texto) AS bytes,
       titulo_seccion, tiene_nota, estado, created_at, updated_at, deleted_at
FROM lvj_bib_versiculos
WHERE version_id = @version_id AND libro_id = @libro_id
  AND capitulo IN (12, 13, 14)
ORDER BY capitulo, versiculo, id;

-- Daniel 12:13 completo y sin truncamiento intencional.
SELECT id, CHAR_LENGTH(texto) AS caracteres, LENGTH(texto) AS bytes, texto
FROM lvj_bib_versiculos
WHERE version_id = @version_id AND libro_id = @libro_id
  AND capitulo = 12 AND versiculo = 13 AND deleted_at IS NULL
ORDER BY id;

SET @texto_original := (
  SELECT texto
  FROM lvj_bib_versiculos
  WHERE version_id = @version_id AND libro_id = @libro_id
    AND capitulo = 12 AND versiculo = 13 AND deleted_at IS NULL
  ORDER BY id
  LIMIT 1
);

SET @marca_susana := ' 1. Había un varón, que habitaba en Babilonia, llamado Joakim;';
SET @marca_bel := ' 1. Era Daniel uno de aquellos que comían a la mesa del rey';
SET @fin_daniel_12 := 'y gozarás de tu suerte al fin de los días.';
SET @inicio_susana := LOCATE(@marca_susana, @texto_original);
SET @inicio_bel := LOCATE(@marca_bel, @texto_original);
SET @fin_12 := LOCATE(@fin_daniel_12, @texto_original);

SELECT
  CHAR_LENGTH(@texto_original) AS caracteres_originales,
  LENGTH(@texto_original) AS bytes_originales,
  @fin_12 AS posicion_fin_daniel_12,
  @inicio_susana AS posicion_inicio_susana,
  @inicio_bel AS posicion_inicio_bel,
  SUBSTRING(@texto_original, GREATEST(1, @fin_12 - 80), 160) AS contexto_fin_daniel_12,
  SUBSTRING(@texto_original, @inicio_susana, 180) AS contexto_inicio_susana,
  SUBSTRING(@texto_original, @inicio_bel, 180) AS contexto_inicio_bel;

SET @bloque_12 := IF(@inicio_susana > 0,
  LEFT(@texto_original, @inicio_susana - 1), NULL);
SET @bloque_13 := IF(@inicio_susana > 0 AND @inicio_bel > @inicio_susana,
  SUBSTRING(@texto_original, @inicio_susana + 1, @inicio_bel - @inicio_susana - 1), NULL);
SET @bloque_14 := IF(@inicio_bel > 0,
  SUBSTRING(@texto_original, @inicio_bel + 1), NULL);

SELECT
  CHAR_LENGTH(@bloque_12) AS caracteres_daniel_12_13,
  CHAR_LENGTH(@bloque_13) AS caracteres_susana,
  CHAR_LENGTH(@bloque_14) AS caracteres_bel_dragon,
  CHAR_LENGTH(CONCAT(@bloque_12, ' ', @bloque_13, ' ', @bloque_14)) AS caracteres_recompuestos,
  (@texto_original <=> CONCAT(@bloque_12, ' ', @bloque_13, ' ', @bloque_14)) AS reconstruccion_identica;

-- Confirma que los marcadores 1..65 y 1..40 aparecen una vez y en orden.
WITH RECURSIVE numeros AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM numeros WHERE n < 65
)
SELECT
  'DAN 13' AS bloque,
  COUNT(*) AS marcadores_esperados,
  SUM(LOCATE(CONCAT(IF(n = 1, '', ' '), n, '. '), @bloque_13) > 0) AS marcadores_detectados,
  MIN(LOCATE(CONCAT(IF(n = 1, '', ' '), n, '. '), @bloque_13)) AS primera_posicion,
  MAX(LOCATE(CONCAT(IF(n = 1, '', ' '), n, '. '), @bloque_13)) AS ultima_posicion
FROM numeros
UNION ALL
SELECT
  'DAN 14',
  COUNT(*),
  SUM(LOCATE(CONCAT(IF(n = 1, '', ' '), n, '. '), @bloque_14) > 0),
  MIN(LOCATE(CONCAT(IF(n = 1, '', ' '), n, '. '), @bloque_14)),
  MAX(LOCATE(CONCAT(IF(n = 1, '', ' '), n, '. '), @bloque_14))
FROM numeros
WHERE n <= 40;

-- Debe devolver cero filas si no existen duplicados vivos.
SELECT capitulo, versiculo, COUNT(*) AS duplicados
FROM lvj_bib_versiculos
WHERE version_id = @version_id AND libro_id = @libro_id
  AND capitulo IN (12, 13, 14) AND deleted_at IS NULL
GROUP BY capitulo, versiculo
HAVING COUNT(*) > 1;

-- Guardas que deberán ser verdaderas antes de preparar la corrección.
SELECT
  ((SELECT COUNT(*) FROM lvj_bib_versiculos
    WHERE version_id=@version_id AND libro_id=@libro_id
      AND capitulo=12 AND versiculo=13 AND deleted_at IS NULL) = 1) AS un_solo_daniel_12_13,
  ((SELECT COUNT(*) FROM lvj_bib_versiculos
    WHERE version_id=@version_id AND libro_id=@libro_id
      AND capitulo IN (13,14) AND deleted_at IS NULL) = 0) AS capitulos_13_14_vacios,
  (@inicio_susana > 0 AND @inicio_bel > @inicio_susana AND @fin_12 > 0) AS tres_bloques_detectados,
  (@texto_original <=> CONCAT(@bloque_12, ' ', @bloque_13, ' ', @bloque_14)) AS ningun_caracter_perdido;

