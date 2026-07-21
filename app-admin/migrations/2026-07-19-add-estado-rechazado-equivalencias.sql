-- Permite conservar y auditar equivalencias descartadas editorialmente.
-- Ejecutar una sola vez después de la migración de equivalencias canónicas.

ALTER TABLE lvj_bib_unidades_canonicas
  MODIFY estado_revision ENUM('pendiente','revisado','aprobado','rechazado')
  NOT NULL DEFAULT 'pendiente';

ALTER TABLE lvj_bib_unidades_versiculos
  MODIFY estado_revision ENUM('pendiente','revisado','aprobado','rechazado')
  NOT NULL DEFAULT 'pendiente';

