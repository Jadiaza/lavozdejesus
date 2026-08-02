-- Habilita la versión Scío cuando ya existe al menos un libro revisado.
-- Los libros pendientes conservan estado=0 y continúan fuera de las consultas públicas.
UPDATE lvj_bib_versiones AS version
SET version.estado = 1,
    version.updated_at = NOW()
WHERE UPPER(version.codigo) = 'SCIO'
  AND version.deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM lvj_bib_libros AS libro
    WHERE libro.version_id = version.id
      AND libro.estado = 1
      AND libro.deleted_at IS NULL
  );
