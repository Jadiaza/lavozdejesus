<?php

declare(strict_types=1);

define('LVJ_FORCE_NO_STORE', true);
require __DIR__ . '/bootstrap.php';

try {
  $pdo = lvj_db();
  $base = lvj_first(
    $pdo,
    "SELECT
      e.*,
      app.mostrar_splash,
      app.duracion_splash,
      app.mostrar_publicidad,
      app.mostrar_radio,
      app.mostrar_podcast,
      app.mostrar_santoral,
      app.mostrar_biblia,
      app.mostrar_lectio,
      app.mostrar_rosario,
      app.mostrar_eventos,
      app.idioma,
      app.version_app,
      apariencia.nombre_tema,
      apariencia.color_primario,
      apariencia.color_secundario,
      apariencia.color_acento,
      apariencia.color_texto,
      apariencia.color_fondo,
      apariencia.color_card,
      apariencia.color_borde,
      apariencia.tipografia_titulos,
      apariencia.tipografia_texto,
      apariencia.modo
    FROM lvj_cfg_emisora e
    LEFT JOIN lvj_cfg_app app
      ON app.emisora_id = e.id AND app.estado = 1
    LEFT JOIN lvj_cfg_apariencia apariencia
      ON apariencia.emisora_id = e.id AND apariencia.activo = 1
    WHERE e.estado = 1
    ORDER BY e.id ASC
    LIMIT 1",
  );

  if (!$base) {
    lvj_json_response(['error' => 'CONFIG_NOT_FOUND'], 404);
  }

  $emisoraId = (int) $base['id'];
  $appearance = lvj_optional_first(
    $pdo,
    'SELECT * FROM lvj_cfg_apariencia WHERE emisora_id = :emisora_id AND activo = 1 ORDER BY id DESC LIMIT 1',
    ['emisora_id' => $emisoraId],
  );

  $socialRows = lvj_optional_rows(
    $pdo,
    'SELECT nombre, url FROM lvj_cfg_redes_sociales WHERE emisora_id = :emisora_id AND activo = 1 ORDER BY orden ASC, id ASC',
    ['emisora_id' => $emisoraId],
  );

  $stream = lvj_optional_first(
    $pdo,
    'SELECT * FROM lvj_rad_streams WHERE emisora_id = :emisora_id ORDER BY id ASC LIMIT 1',
    ['emisora_id' => $emisoraId],
  );

  $adsense = lvj_optional_first(
    $pdo,
    'SELECT * FROM lvj_pub_adsense WHERE emisora_id = :emisora_id ORDER BY id ASC LIMIT 1',
    ['emisora_id' => $emisoraId],
  );

  lvj_json_response([
    'emisora_id' => (string) $emisoraId,
    'radio_stream_url' => lvj_text($stream, 'stream_url', 'url_stream', 'radio_stream_url'),
    'radio_metadata_url' => lvj_text($stream, 'metadata_url', 'url_metadata', 'radio_metadata_url'),
    'radio_default_title' => lvj_text($stream, 'titulo_default', 'radio_default_title') ?: lvj_text($base, 'nombre_emisora'),
    'radio_default_subtitle' => lvj_text($stream, 'subtitulo_default', 'radio_default_subtitle') ?: lvj_text($base, 'eslogan'),
    'radio_player_image_url' => lvj_text($stream, 'imagen_default', 'imagen_url', 'radio_player_image_url') ?: lvj_text($base, 'logo_principal', 'splash_imagen'),
    'app_logo_url' => lvj_text($base, 'logo_principal', 'logo_blanco', 'logo_oscuro'),
    'splash_imagen' => lvj_text($base, 'splash_imagen'),
    'splash_video' => lvj_text($base, 'splash_video'),
    'social_facebook_url' => lvj_social_url($socialRows, 'Facebook'),
    'social_instagram_url' => lvj_social_url($socialRows, 'Instagram'),
    'social_youtube_url' => lvj_social_url($socialRows, 'YouTube'),
    'contact_whatsapp_url' => lvj_social_url($socialRows, 'WhatsApp') ?: lvj_text($base, 'whatsapp'),
    'contact_email' => lvj_text($base, 'correo_principal'),
    'ads_enabled' => lvj_bool($base['mostrar_publicidad'] ?? null, true),
    'adsense_client_id' => lvj_text($adsense, 'cliente_id', 'client_id', 'adsense_client_id'),
    'adsense_programacion_slot' => lvj_text($adsense, 'slot_programacion', 'programacion_slot', 'adsense_programacion_slot'),
    'adsense_radio_slot' => lvj_text($adsense, 'slot_radio', 'radio_slot', 'adsense_radio_slot'),
    'mostrar_splash' => lvj_bool($base['mostrar_splash'] ?? null, true),
    'duracion_splash' => lvj_text($base, 'duracion_splash'),
    'mostrar_radio' => lvj_bool($base['mostrar_radio'] ?? null, true),
    'mostrar_podcast' => lvj_bool($base['mostrar_podcast'] ?? null, true),
    'mostrar_santoral' => lvj_bool($base['mostrar_santoral'] ?? null, true),
    'mostrar_biblia' => lvj_bool($base['mostrar_biblia'] ?? null, true),
    'mostrar_lectio' => lvj_bool($base['mostrar_lectio'] ?? null, true),
    'mostrar_rosario' => lvj_bool($base['mostrar_rosario'] ?? null, true),
    'mostrar_eventos' => lvj_bool($base['mostrar_eventos'] ?? null, true),
    'idioma' => lvj_text($base, 'idioma'),
    'version_app' => lvj_text($base, 'version_app'),
    'nombre_tema' => lvj_text($base, 'nombre_tema'),
    'color_primario' => lvj_text($base, 'color_primario'),
    'color_secundario' => lvj_text($base, 'color_secundario'),
    'color_acento' => lvj_text($base, 'color_acento'),
    'color_texto' => lvj_text($base, 'color_texto'),
    'color_fondo' => lvj_text($base, 'color_fondo'),
    'color_card' => lvj_text($base, 'color_card'),
    'color_borde' => lvj_text($base, 'color_borde'),
    'color_texto_secundario' => lvj_text($appearance, 'color_texto_secundario'),
    'color_surface' => lvj_text($appearance, 'color_surface'),
    'color_icono' => lvj_text($appearance, 'color_icono'),
    'color_icono_activo' => lvj_text($appearance, 'color_icono_activo'),
    'color_icono_inactivo' => lvj_text($appearance, 'color_icono_inactivo'),
    'color_boton_primario_fondo' => lvj_text($appearance, 'color_boton_primario_fondo'),
    'color_boton_primario_texto' => lvj_text($appearance, 'color_boton_primario_texto'),
    'color_boton_primario_borde' => lvj_text($appearance, 'color_boton_primario_borde'),
    'color_boton_secundario_fondo' => lvj_text($appearance, 'color_boton_secundario_fondo'),
    'color_boton_secundario_texto' => lvj_text($appearance, 'color_boton_secundario_texto'),
    'color_boton_secundario_borde' => lvj_text($appearance, 'color_boton_secundario_borde'),
    'color_nav_fondo' => lvj_text($appearance, 'color_nav_fondo'),
    'color_nav_borde' => lvj_text($appearance, 'color_nav_borde'),
    'color_nav_icono_activo' => lvj_text($appearance, 'color_nav_icono_activo'),
    'color_nav_icono_inactivo' => lvj_text($appearance, 'color_nav_icono_inactivo'),
    'color_nav_texto_activo' => lvj_text($appearance, 'color_nav_texto_activo'),
    'color_nav_texto_inactivo' => lvj_text($appearance, 'color_nav_texto_inactivo'),
    'color_nav_indicador' => lvj_text($appearance, 'color_nav_indicador'),
    'color_card_texto' => lvj_text($appearance, 'color_card_texto'),
    'color_card_icono' => lvj_text($appearance, 'color_card_icono'),
    'color_overlay' => lvj_text($appearance, 'color_overlay'),
    'overlay_opacidad' => lvj_text($appearance, 'overlay_opacidad'),
    'color_input_fondo' => lvj_text($appearance, 'color_input_fondo'),
    'color_input_borde' => lvj_text($appearance, 'color_input_borde'),
    'color_progress_fondo' => lvj_text($appearance, 'color_progress_fondo'),
    'color_progress_relleno' => lvj_text($appearance, 'color_progress_relleno'),
    'color_exito' => lvj_text($appearance, 'color_exito'),
    'color_advertencia' => lvj_text($appearance, 'color_advertencia'),
    'color_error' => lvj_text($appearance, 'color_error'),
    'color_info' => lvj_text($appearance, 'color_info'),
    'tipografia_titulos' => lvj_text($base, 'tipografia_titulos'),
    'tipografia_texto' => lvj_text($base, 'tipografia_texto'),
    'modo' => lvj_text($base, 'modo'),
  ]);
} catch (Throwable $error) {
  lvj_json_response([
    'error' => 'CONFIG_QUERY_FAILED',
    'detail' => $error->getMessage(),
  ], 500);
}
