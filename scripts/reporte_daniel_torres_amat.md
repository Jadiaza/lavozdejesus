# Auditoría y corrección preparada — TORRESAMAT / Daniel 12:13

Fecha: 20 de julio de 2026  
Estado: **auditoría SQL confirmada; scripts operativos preparados, no ejecutados**

## Alcance

La inspección se limita a la versión `TORRESAMAT` y al libro `DAN`. No se ha ejecutado ninguna escritura
en MySQL. Salmos, Ester, las demás versiones y los demás libros permanecen fuera del alcance.

## Estructura encontrada en el proyecto

El código vigente consulta:

- `lvj_bib_versiones.id` y `lvj_bib_versiones.codigo`;
- `lvj_bib_libros.id`, `version_id`, `codigo` y `capitulos`;
- `lvj_bib_versiculos.id`, `version_id`, `libro_id`, `capitulo`, `versiculo`, `texto`,
  `titulo_seccion`, `tiene_nota`, `estado`, `created_at`, `updated_at` y `deleted_at`.

La API de producción devuelve `TORRESAMAT`, libro `DAN`, con `libro_id = 100` y `capitulos = 12`. La
auditoría confirmó MariaDB `10.11.18-MariaDB-cll-lve`, `version_id = 2`, `libro_id = 100` y
`Daniel 12:13 id = 57886`, además de las columnas anteriores.

## Evidencia observada

La consulta pública de solo lectura a Daniel 12 devolvió un único registro `12:13`, con `id = 57886`:

- 13.746 caracteres Unicode;
- 14.065 bytes UTF-8;
- Daniel 12:13 correcto al comienzo;
- Susana concatenada con marcadores consecutivos `1.` a `65.`;
- Bel y el dragón concatenado con marcadores consecutivos `1.` a `40.`.

Daniel 12:13 termina en:

> y gozarás de tu suerte al fin de los días.

Susana comienza inequívocamente en:

> 1. Había un varón, que habitaba en Babilonia, llamado Joakim;

Bel y el dragón comienza inequívocamente en:

> 1. Era Daniel uno de aquellos que comían a la mesa del rey

Las posiciones observadas en la representación UTF-8 de la API fueron:

- inicio de Susana: desplazamiento de byte 135 (base cero);
- inicio de Bel y el dragón: desplazamiento de byte 8.505 (base cero);
- longitud del bloque limpio Daniel 12:13: 127 caracteres.

MariaDB confirmó posiciones basadas en caracteres: final localizado en 86, inicio de Susana en 128 e
inicio de Bel y el dragón en 8.321. Los bloques miden respectivamente 127, 8.192 y 5.425 caracteres; su
recomposición mide 13.746 caracteres y coincide literalmente con el original.

Estas posiciones son informativas; la corrección no deberá depender de posiciones numéricas fijas. Deberá
localizar marcadores textuales exactos y validar la secuencia completa de numeraciones antes de escribir.

## Cantidades previstas

- Daniel 13 — Susana: **65 versículos**.
- Daniel 14 — Bel y el dragón: **40 versículos**.
- Daniel 12:13: **1 registro actualizado**, sin cambiar ninguna palabra.

La auditoría confirmó directamente que no existen filas vivas en los capítulos 13 o 14.

## Validaciones realizadas

- Versión pública confirmada como `TORRESAMAT`.
- Libro confirmado como `DAN`.
- Registro afectado confirmado como `12:13`.
- Límite Daniel 12 / Susana detectado una sola vez.
- Límite Susana / Bel detectado una sola vez.
- 65 marcadores consecutivos detectados en Susana.
- 40 marcadores consecutivos detectados en Bel y el dragón.
- No se ejecutaron escrituras.
- Los cuatro indicadores finales de seguridad devolvieron `1`.
- La reconstrucción literal devolvió `reconstruccion_identica = 1`.
- No se detectaron duplicados vivos en los capítulos 12, 13 o 14.

## Corrección preparada

`corregir_daniel_torres_amat.sql` repite todas las guardas dentro de un procedimiento con manejador de
errores y transacción. Antes de cambiar datos conserva literalmente Daniel 12:13 y el valor original de
`lvj_bib_libros.capitulos` en `lvj_bib_respaldo_daniel_torres_amat`. Después:

1. deja el texto limpio en el registro `57886`;
2. crea 65 registros consecutivos para Daniel 13;
3. crea 40 registros consecutivos para Daniel 14;
4. actualiza `lvj_bib_libros.capitulos` de 12 a 14 para que el API permita consultarlos;
5. reconstruye el texto original desde la base segmentada y exige igualdad binaria;
6. revierte toda la transacción ante cualquier diferencia, duplicado o cantidad inesperada.

`revertir_daniel_torres_amat.sql` exige el estado corregido exacto, elimina únicamente los 105 registros
creados, restaura literalmente el registro original y devuelve a 12 el total de capítulos. El respaldo
se conserva como evidencia de auditoría.

Registros previstos al aplicar la corrección:

- 1 copia persistente de respaldo;
- 1 `UPDATE` de `lvj_bib_versiculos` para Daniel 12:13;
- 105 `INSERT` en `lvj_bib_versiculos` (65 + 40);
- 1 `UPDATE` de `lvj_bib_libros` para declarar 14 capítulos.

## Ambigüedades

No quedan ambigüedades textuales ni estructurales dentro del alcance auditado. La corrección aún no ha
sido ejecutada y requiere respaldo general previo de MySQL y autorización operativa expresa.

## Compatibilidad de cotejo

Las primeras llamadas del procedimiento fueron detenidas por MariaDB con el error `#1267` antes del
`COMMIT`. La auditoría del error `LOCATE` confirmó que las columnas de texto bíblico usan
`utf8mb4_unicode_ci`, aunque variables no declaradas explícitamente podían heredar
`utf8mb4_unicode_520_ci` de la base. El script declara ahora conexión, variables, respaldo y tabla
temporal explícitamente como `utf8mb4_unicode_ci`. En ambas llamadas fallidas el manejador ejecutó
`ROLLBACK`; ninguna debe considerarse una corrección aplicada.
