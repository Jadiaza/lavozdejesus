-- Control de acceso para estudios bíblicos con IA.
-- Aplicar una sola vez después de 2026-07-14-connect-supabase-users.sql.

ALTER TABLE lvj_com_usuarios
  ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0 AFTER auth_subject,
  ADD COLUMN ia_autorizado TINYINT(1) NOT NULL DEFAULT 1 AFTER email_verificado,
  ADD COLUMN ultimo_acceso_at DATETIME NULL AFTER ia_autorizado,
  ADD KEY idx_com_usuario_ia_acceso (estado, ia_autorizado);

UPDATE lvj_com_usuarios
SET email_verificado = 1
WHERE auth_subject IS NOT NULL
  AND auth_subject <> '';
