-- Vincula la identidad externa de Supabase con la identidad oficial LVJ.
-- Ejecutar una sola vez después de revisar que las columnas no existan.
ALTER TABLE lvj_com_usuarios
  ADD COLUMN auth_provider VARCHAR(30) NULL AFTER rol_id,
  ADD COLUMN auth_subject VARCHAR(191) NULL AFTER auth_provider,
  ADD UNIQUE KEY uq_com_usuario_auth (auth_provider, auth_subject);
