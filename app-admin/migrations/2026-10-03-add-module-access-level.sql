-- LVJ - Acceso dinámico por módulo/submódulo. Ejecutar una sola vez en producción.
ALTER TABLE lvj_cfg_modulos ADD COLUMN nivel_acceso VARCHAR(20) NOT NULL DEFAULT 'publico' AFTER modo_mantenimiento;
ALTER TABLE lvj_cfg_submodulos ADD COLUMN nivel_acceso VARCHAR(20) NOT NULL DEFAULT 'publico' AFTER modo_mantenimiento;

UPDATE lvj_cfg_modulos SET nivel_acceso='registrado' WHERE modulo IN ('biblia','comunidad','podcast');
UPDATE lvj_cfg_modulos SET nivel_acceso='publico' WHERE modulo NOT IN ('biblia','comunidad','podcast');

UPDATE lvj_cfg_submodulos SET nivel_acceso='registrado'
WHERE (modulo='capilla_virtual' AND submodulo='intenciones')
   OR (modulo='oraciones' AND submodulo IN ('mis_oraciones','peticion','recordatorios'))
   OR (modulo='rosario' AND submodulo='diario')
   OR modulo='biblia'
   OR modulo='podcast';

UPDATE lvj_cfg_submodulos SET nivel_acceso='publico'
WHERE nivel_acceso NOT IN ('registrado','premium');

ALTER TABLE lvj_cfg_modulos ADD INDEX idx_lvj_cfg_modulos_nivel_acceso (emisora_id,nivel_acceso);
ALTER TABLE lvj_cfg_submodulos ADD INDEX idx_lvj_cfg_submodulos_nivel_acceso (emisora_id,modulo,nivel_acceso);
