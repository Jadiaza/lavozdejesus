-- =============================================================================
-- LVJ - Mantenimiento por submódulo
-- Fecha: 2026-10-01
-- Tabla: lvj_cfg_submodulos
--
-- No modifica ni recrea lvj_cfg_modulos.
-- Permite bloquear funciones internas sin retirar el módulo completo.
-- =============================================================================

CREATE TABLE IF NOT EXISTS lvj_cfg_submodulos (
    id INT(11) NOT NULL AUTO_INCREMENT,
    emisora_id INT(11) NOT NULL,
    modulo VARCHAR(80) NOT NULL,
    submodulo VARCHAR(120) NOT NULL,
    modo_mantenimiento TINYINT(4) NOT NULL DEFAULT 0,
    mensaje_mantenimiento VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_lvj_cfg_submodulos_emisora_modulo_submodulo (emisora_id, modulo, submodulo),
    KEY idx_lvj_cfg_submodulos_emisora (emisora_id),
    KEY idx_lvj_cfg_submodulos_modulo (emisora_id, modulo),
    KEY idx_lvj_cfg_submodulos_mantenimiento (emisora_id, modo_mantenimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO lvj_cfg_submodulos
    (emisora_id, modulo, submodulo, modo_mantenimiento, mensaje_mantenimiento)
SELECT
    e.id,
    m.modulo,
    m.submodulo,
    0,
    'Este submódulo se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
FROM lvj_cfg_emisora e
CROSS JOIN (
    SELECT 'biblia' AS modulo, 'leer' AS submodulo
    UNION ALL SELECT 'biblia', 'estudio'
    UNION ALL SELECT 'biblia', 'planes'
    UNION ALL SELECT 'biblia', 'personajes'
    UNION ALL SELECT 'biblia', 'mapas'
    UNION ALL SELECT 'biblia', 'libros'
    UNION ALL SELECT 'biblia', 'favoritos'
    UNION ALL SELECT 'biblia', 'mi_biblia'
    UNION ALL SELECT 'biblia', 'comparar'
    UNION ALL SELECT 'rosario', 'modalidad'
    UNION ALL SELECT 'rosario', 'intencion'
    UNION ALL SELECT 'rosario', 'seleccionar_misterios'
    UNION ALL SELECT 'rosario', 'configuracion'
    UNION ALL SELECT 'rosario', 'digital'
    UNION ALL SELECT 'rosario', 'fisico'
    UNION ALL SELECT 'rosario', 'audio'
    UNION ALL SELECT 'rosario', 'misterios'
    UNION ALL SELECT 'rosario', 'descargas'
    UNION ALL SELECT 'rosario', 'diario'
    UNION ALL SELECT 'rosario', 'informacion'
    UNION ALL SELECT 'oraciones', 'categorias'
    UNION ALL SELECT 'oraciones', 'devociones'
    UNION ALL SELECT 'oraciones', 'liturgia_horas'
    UNION ALL SELECT 'oraciones', 'mis_oraciones'
    UNION ALL SELECT 'oraciones', 'peticion'
    UNION ALL SELECT 'oraciones', 'recordatorios'
    UNION ALL SELECT 'capilla_virtual', 'intenciones'
    UNION ALL SELECT 'podcast', 'series'
) AS m
WHERE e.estado = 1
  AND EXISTS (
    SELECT 1
    FROM lvj_cfg_modulos cm
    WHERE cm.emisora_id = e.id
      AND cm.modulo = m.modulo
  )
  AND NOT EXISTS (
    SELECT 1
    FROM lvj_cfg_submodulos cs
    WHERE cs.emisora_id = e.id
      AND cs.modulo = m.modulo
      AND cs.submodulo = m.submodulo
  );

-- Los registros son idempotentes: ejecutar nuevamente no duplica submódulos.
