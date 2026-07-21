-- Recupera estudios que quedaron en estado "generando" tras perder la conexión
-- con MySQL durante una llamada al proveedor de IA.

UPDATE lvj_bib_estudios_ia_solicitudes AS solicitud
INNER JOIN lvj_bib_estudios_ia AS estudio
  ON estudio.id = solicitud.estudio_id
SET
  solicitud.estado = 'error',
  solicitud.consume_cupo = 0,
  solicitud.error_mensaje = COALESCE(
    solicitud.error_mensaje,
    'La generación fue interrumpida y puede intentarse nuevamente.'
  ),
  solicitud.completed_at = COALESCE(solicitud.completed_at, NOW())
WHERE estudio.estado = 'generando'
  AND estudio.updated_at < (UTC_TIMESTAMP() - INTERVAL 5 MINUTE)
  AND solicitud.estado IN ('pendiente', 'procesando');

UPDATE lvj_bib_estudios_ia
SET
  hash_contexto = SHA2(CONCAT(hash_contexto, '|stale|', id, '|', UTC_TIMESTAMP(6)), 256),
  estado = 'archivado',
  es_publico = 0,
  error_mensaje = COALESCE(
    error_mensaje,
    'Generación interrumpida por pérdida de conexión con MySQL.'
  ),
  deleted_at = NOW(),
  updated_at = NOW()
WHERE estado = 'generando'
  AND updated_at < (UTC_TIMESTAMP() - INTERVAL 5 MINUTE);
