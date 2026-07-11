<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

function lvj_capilla_bool(mixed $value): bool
{
  return lvj_bool($value, false) || in_array(strtolower(trim((string) $value)), ['activa'], true);
}

function lvj_capilla_stream_normalize(?array $row): ?array
{
  if (!$row) {
    return null;
  }

  return [
    'id' => lvj_text($row, 'id'),
    'capilla_id' => lvj_text($row, 'capilla_id'),
    'nombre' => lvj_text($row, 'nombre'),
    'tipo_stream' => lvj_text($row, 'tipo_stream') ?: 'hls',
    'calidad' => lvj_text($row, 'calidad') ?: 'auto',
    'url_stream' => lvj_text($row, 'url_stream'),
    'url_origen' => lvj_text($row, 'url_origen'),
    'requiere_token' => lvj_capilla_bool($row['requiere_token'] ?? null),
    'requiere_referer' => lvj_capilla_bool($row['requiere_referer'] ?? null),
    'referer_url' => lvj_text($row, 'referer_url'),
    'es_principal' => lvj_capilla_bool($row['es_principal'] ?? null),
    'estado' => lvj_text($row, 'estado') ?: 'activo',
    'ultima_verificacion' => lvj_text($row, 'ultima_verificacion'),
    'updated_at' => lvj_text($row, 'updated_at'),
  ];
}

function lvj_capilla_config_normalize(array $row): array
{
  return [
    'id' => lvj_text($row, 'id'),
    'capilla_activa_id' => lvj_text($row, 'capilla_activa_id'),
    'stream_activo_id' => lvj_text($row, 'stream_activo_id'),
    'modo_reproduccion' => lvj_text($row, 'modo_reproduccion') ?: 'auto',
    'calidad_default' => lvj_text($row, 'calidad_default') ?: 'auto',
    'mostrar_nombre' => lvj_capilla_bool($row['mostrar_nombre'] ?? null),
    'mostrar_pais' => lvj_capilla_bool($row['mostrar_pais'] ?? null),
    'mostrar_intenciones' => lvj_capilla_bool($row['mostrar_intenciones'] ?? null),
    'mostrar_boton_radio' => lvj_capilla_bool($row['mostrar_boton_radio'] ?? null),
    'mensaje_carga' => lvj_text($row, 'mensaje_carga'),
    'mensaje_error' => lvj_text($row, 'mensaje_error'),
    'estado' => lvj_text($row, 'estado') ?: 'activo',
    'updated_at' => lvj_text($row, 'updated_at'),
  ];
}

function lvj_capilla_normalize(array $row, ?array $stream): array
{
  return [
    'id' => lvj_text($row, 'id'),
    'nombre' => lvj_text($row, 'nombre'),
    'subtitulo' => lvj_text($row, 'subtitulo'),
    'descripcion' => lvj_text($row, 'descripcion'),
    'pais' => lvj_text($row, 'pais'),
    'ciudad' => lvj_text($row, 'ciudad'),
    'sitio_web' => lvj_text($row, 'sitio_web'),
    'imagen_url' => lvj_text($row, 'imagen_url'),
    'logo_url' => lvj_text($row, 'logo_url'),
    'es_principal' => lvj_capilla_bool($row['es_principal'] ?? null),
    'es_respaldo' => lvj_capilla_bool($row['es_respaldo'] ?? null),
    'prioridad' => (int) (lvj_text($row, 'prioridad') ?: 0),
    'estado' => lvj_text($row, 'estado') ?: 'activo',
    'updated_at' => lvj_text($row, 'updated_at'),
    'stream' => lvj_capilla_stream_normalize($stream),
  ];
}

function lvj_capilla_payload_normalize(array $config, array $capilla, ?array $stream): array
{
  $capillaNormalizada = lvj_capilla_normalize($capilla, $stream);

  return array_merge($capillaNormalizada, [
    'config' => lvj_capilla_config_normalize($config),
    'capilla' => $capillaNormalizada,
  ]);
}

try {
  $pdo = lvj_db();
  $activeStatusSql = "LOWER(COALESCE(CAST(estado AS CHAR), '')) IN ('', '1', 'activo', 'activa', 'publicado')";

  $config = lvj_optional_first(
    $pdo,
    "
      SELECT *
      FROM lvj_capilla_config
      WHERE {$activeStatusSql}
      ORDER BY updated_at DESC, id DESC
      LIMIT 1
    ",
  );

  $capillaActivaId = $config ? lvj_text($config, 'capilla_activa_id') : '';
  if (!$config || !$capillaActivaId) {
    lvj_json_response([]);
  }

  $row = lvj_optional_first(
    $pdo,
    "
      SELECT *
      FROM lvj_capillas
      WHERE id = :capilla_id
        AND deleted_at IS NULL
        AND {$activeStatusSql}
      LIMIT 1
    ",
    ['capilla_id' => $capillaActivaId],
  );

  if (!$row) {
    lvj_json_response([]);
  }

  $stream = null;
  $streamActivoId = lvj_text($config, 'stream_activo_id');
  if ($streamActivoId) {
    $stream = lvj_optional_first(
      $pdo,
      "
        SELECT *
        FROM lvj_capilla_streams
        WHERE id = :stream_id
          AND capilla_id = :capilla_id
          AND deleted_at IS NULL
          AND {$activeStatusSql}
        LIMIT 1
      ",
      [
        'stream_id' => $streamActivoId,
        'capilla_id' => lvj_text($row, 'id'),
      ],
    );
  }

  lvj_json_response(lvj_capilla_payload_normalize($config, $row, $stream));
} catch (Throwable $error) {
  lvj_json_response([
    'error' => 'CAPILLA_QUERY_FAILED',
  ], 500);
}
