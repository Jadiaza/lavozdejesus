-- Equivalencias canónicas entre versiones bíblicas.
-- Arquitectura aprobada en AGENTS.md v2.1.
-- Compatible con MySQL 8.x y MariaDB 10.6.
--
-- Antes de ejecutar:
--   1. Realizar un respaldo completo de la Base de Datos.
--   2. Confirmar que lvj_bib_versiculos.id es BIGINT UNSIGNED.
--   3. Ejecutar primero en el ambiente de desarrollo.
--
-- Esta migración crea únicamente la estructura. No genera ni aprueba
-- equivalencias y no modifica los textos de lvj_bib_versiculos.

CREATE TABLE IF NOT EXISTS lvj_bib_unidades_canonicas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  libro_codigo VARCHAR(10) NOT NULL,
  codigo_canonico VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL,
  estado_revision ENUM('pendiente','revisado','aprobado') NOT NULL DEFAULT 'pendiente',
  fuente VARCHAR(255) NULL,
  observaciones TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bib_unidad_codigo (codigo_canonico),
  KEY idx_bib_unidad_libro (libro_codigo),
  KEY idx_bib_unidad_revision (estado_revision, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lvj_bib_unidades_versiculos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  unidad_canonica_id BIGINT UNSIGNED NOT NULL,
  versiculo_id BIGINT UNSIGNED NOT NULL,
  fragmento_inicio INT UNSIGNED NULL,
  fragmento_longitud INT UNSIGNED NULL,
  referencia_editorial VARCHAR(60) NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  tipo_equivalencia ENUM('exacta','parcial','combinada','dividida') NOT NULL DEFAULT 'exacta',
  estado_revision ENUM('pendiente','revisado','aprobado') NOT NULL DEFAULT 'pendiente',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bib_unidad_versiculo (unidad_canonica_id, versiculo_id),
  KEY idx_bib_equiv_versiculo (versiculo_id),
  KEY idx_bib_equiv_revision (estado_revision, deleted_at),
  CONSTRAINT fk_bib_equiv_unidad
    FOREIGN KEY (unidad_canonica_id)
    REFERENCES lvj_bib_unidades_canonicas (id),
  CONSTRAINT fk_bib_equiv_versiculo
    FOREIGN KEY (versiculo_id)
    REFERENCES lvj_bib_versiculos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Validaciones posteriores recomendadas:
--
-- SHOW CREATE TABLE lvj_bib_unidades_canonicas;
-- SHOW CREATE TABLE lvj_bib_unidades_versiculos;
--
-- SELECT uv.id
-- FROM lvj_bib_unidades_versiculos AS uv
-- LEFT JOIN lvj_bib_unidades_canonicas AS uc
--   ON uc.id = uv.unidad_canonica_id
-- LEFT JOIN lvj_bib_versiculos AS v
--   ON v.id = uv.versiculo_id
-- WHERE uc.id IS NULL OR v.id IS NULL;
--
-- La consulta anterior debe devolver cero registros.
--
-- Reversión manual, únicamente si las tablas siguen vacías y existe autorización:
-- DROP TABLE lvj_bib_unidades_versiculos;
-- DROP TABLE lvj_bib_unidades_canonicas;
