-- Libera el cupo marcado como completado por reintentos de estudios que terminaron en error.
-- Incluye errores archivados mediante "Regenerar", pero no toca estudios que sí tienen contenido.

UPDATE lvj_bib_estudios_ia_solicitudes AS solicitud
INNER JOIN lvj_bib_estudios_ia AS estudio
  ON estudio.id = solicitud.estudio_id
SET
  solicitud.estado = 'error',
  solicitud.consume_cupo = 0,
  solicitud.error_mensaje = COALESCE(
    solicitud.error_mensaje,
    estudio.error_mensaje,
    'Solicitud asociada a un estudio que no pudo generarse.'
  )
WHERE estudio.estado IN ('error', 'archivado')
  AND estudio.proveedor_ia IS NULL
  AND estudio.contenido_json = '{}'
  AND solicitud.estado = 'completada'
  AND solicitud.consume_cupo = 1;

-- Los intentos fallidos nunca deben consumir el cupo mensual.
UPDATE lvj_bib_estudios_ia_solicitudes
SET consume_cupo = 0
WHERE estado = 'error'
  AND consume_cupo = 1;
