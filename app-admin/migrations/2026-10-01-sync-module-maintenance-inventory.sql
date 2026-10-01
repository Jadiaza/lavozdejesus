-- =============================================================================
-- LVJ - Sincronización del inventario funcional de mantenimiento por módulo
-- Fecha: 2026-10-01
-- Tabla: lvj_cfg_modulos
--
-- Esta migración NO recrea la tabla. La tabla ya existe en producción.
-- Ajusta únicamente los registros de mantenimiento para que coincidan con el
-- inventario funcional oficial documentado en AGENTS.md.
-- =============================================================================

INSERT INTO lvj_cfg_modulos
    (emisora_id, modulo, modo_mantenimiento, mensaje_mantenimiento)
SELECT
    e.id,
    m.modulo,
    0,
    'Este módulo se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
FROM lvj_cfg_emisora e
CROSS JOIN (
    SELECT 'oraciones' AS modulo
    UNION ALL SELECT 'rosario'
    UNION ALL SELECT 'santoral'
    UNION ALL SELECT 'formacion'
    UNION ALL SELECT 'eventos'
    UNION ALL SELECT 'testimonios'
) AS m
WHERE e.estado = 1
  AND NOT EXISTS (
    SELECT 1
    FROM lvj_cfg_modulos cm
    WHERE cm.emisora_id = e.id
      AND cm.modulo = m.modulo
  );

DELETE cm
FROM lvj_cfg_modulos cm
INNER JOIN lvj_cfg_emisora e ON e.id = cm.emisora_id
WHERE e.estado = 1
  AND cm.modulo = 'noticias';

-- =============================================================================
-- Inventario funcional resultante:
--
-- inicio
-- radio
-- programacion
-- capilla_virtual
-- oraciones
-- rosario
-- liturgia
-- santoral
-- biblia
-- biblioteca
-- formacion
-- comunidad
-- podcast
-- eventos
-- testimonios
-- donaciones
-- publicidad
-- =============================================================================
