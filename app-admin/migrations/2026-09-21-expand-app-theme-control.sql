-- LVJPRAYER
-- Amplía la tabla existente lvj_cfg_apariencia para controlar la apariencia global de la app.
-- Idempotente: cada columna se agrega solo si no existe.
-- IMPORTANTE: no ejecutar automáticamente en producción; aplicar manualmente después de respaldo.

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_texto_secundario'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_texto_secundario VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_surface'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_surface VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_icono'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_icono VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_icono_activo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_icono_activo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_icono_inactivo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_icono_inactivo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_boton_primario_fondo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_boton_primario_fondo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_boton_primario_texto'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_boton_primario_texto VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_boton_primario_borde'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_boton_primario_borde VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_boton_secundario_fondo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_boton_secundario_fondo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_boton_secundario_texto'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_boton_secundario_texto VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_boton_secundario_borde'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_boton_secundario_borde VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_nav_fondo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_nav_fondo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_nav_borde'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_nav_borde VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_nav_icono_activo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_nav_icono_activo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_nav_icono_inactivo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_nav_icono_inactivo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_nav_texto_activo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_nav_texto_activo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_nav_texto_inactivo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_nav_texto_inactivo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_nav_indicador'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_nav_indicador VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_card_texto'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_card_texto VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_card_icono'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_card_icono VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_overlay'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_overlay VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'overlay_opacidad'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN overlay_opacidad DECIMAL(4,2) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_input_fondo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_input_fondo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_input_borde'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_input_borde VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_progress_fondo'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_progress_fondo VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_progress_relleno'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_progress_relleno VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_exito'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_exito VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_advertencia'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_advertencia VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_error'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_error VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

SET @lvj_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'lvj_cfg_apariencia'
      AND COLUMN_NAME = 'color_info'
  ),
  'SELECT 1',
  'ALTER TABLE lvj_cfg_apariencia ADD COLUMN color_info VARCHAR(7) NULL'
);
PREPARE lvj_stmt FROM @lvj_sql;
EXECUTE lvj_stmt;
DEALLOCATE PREPARE lvj_stmt;

