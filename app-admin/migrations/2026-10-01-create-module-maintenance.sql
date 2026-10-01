-- LVJPRAYER
-- Crea la configuración de mantenimiento individual por módulo.
-- Idempotente para instalación inicial.
-- IMPORTANTE: no ejecutar automáticamente en producción; aplicar manualmente después de respaldo
-- y de verificar el esquema real de lvj_cfg_emisora.

CREATE TABLE IF NOT EXISTS lvj_cfg_modulos (
    id INT(11) NOT NULL AUTO_INCREMENT,
    emisora_id INT(11) NOT NULL,
    modulo VARCHAR(80) NOT NULL,
    modo_mantenimiento TINYINT(4) NOT NULL DEFAULT 0,
    mensaje_mantenimiento VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_lvj_cfg_modulos_emisora_modulo (emisora_id, modulo),
    KEY idx_lvj_cfg_modulos_emisora (emisora_id),
    KEY idx_lvj_cfg_modulos_mantenimiento (emisora_id, modo_mantenimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Configuración inicial de los módulos funcionales oficiales.
-- Solo se insertan si todavía no existe la combinación emisora + módulo.
INSERT INTO lvj_cfg_modulos
    (emisora_id, modulo, modo_mantenimiento, mensaje_mantenimiento)
SELECT 1, m.modulo, 0,
       'Este módulo se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.'
FROM (
    SELECT 'inicio' AS modulo
    UNION ALL SELECT 'radio'
    UNION ALL SELECT 'programacion'
    UNION ALL SELECT 'capilla_virtual'
    UNION ALL SELECT 'liturgia'
    UNION ALL SELECT 'biblia'
    UNION ALL SELECT 'biblioteca'
    UNION ALL SELECT 'comunidad'
    UNION ALL SELECT 'podcast'
    UNION ALL SELECT 'noticias'
    UNION ALL SELECT 'donaciones'
    UNION ALL SELECT 'publicidad'
) AS m
WHERE EXISTS (
    SELECT 1
    FROM lvj_cfg_emisora e
    WHERE e.id = 1
)
AND NOT EXISTS (
    SELECT 1
    FROM lvj_cfg_modulos cm
    WHERE cm.emisora_id = 1
      AND cm.modulo = m.modulo
);

-- Verificación sugerida después de ejecutar:
-- SELECT id, emisora_id, modulo, modo_mantenimiento,
--        mensaje_mantenimiento, created_at, updated_at
-- FROM lvj_cfg_modulos
-- ORDER BY emisora_id, modulo;
