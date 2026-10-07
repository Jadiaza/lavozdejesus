-- Coordenadas aproximadas de geolocalización para el mapa de audiencia.
-- Se obtienen de Cloudflare/GeoIP cuando el servidor las entrega.
-- No se almacena la IP original.

ALTER TABLE lvj_rad_sesiones
  ADD COLUMN IF NOT EXISTS latitud DECIMAL(10,7) NULL AFTER ciudad,
  ADD COLUMN IF NOT EXISTS longitud DECIMAL(10,7) NULL AFTER latitud;

CREATE INDEX IF NOT EXISTS idx_lvj_rad_sesion_coords
  ON lvj_rad_sesiones (latitud, longitud);
