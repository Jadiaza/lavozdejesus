import { getMysqlPool, hasMysqlConfig } from "./_mysql.js";

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type DbRow = Record<string, unknown>;

const text = (row: DbRow | null | undefined, ...keys: string[]) => {
  if (!row) return "";

  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" || typeof value === "number") {
      const clean = String(value).trim();
      if (clean) return clean;
    }
  }

  return "";
};

const boolValue = (value: unknown, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  return ["1", "true", "si", "sí", "yes", "activo"].includes(
    String(value).trim().toLowerCase(),
  );
};

const firstRow = async (sql: string, params: DbRow = {}) => {
  const [rows] = await getMysqlPool().execute(sql, params);
  return (rows as DbRow[])[0] ?? null;
};

const optionalFirstRow = async (sql: string, params: DbRow = {}) => {
  try {
    return await firstRow(sql, params);
  } catch {
    return null;
  }
};

const optionalRows = async (sql: string, params: DbRow = {}) => {
  try {
    const [rows] = await getMysqlPool().execute(sql, params);
    return rows as DbRow[];
  } catch {
    return [];
  }
};

const getSocialUrl = (rows: DbRow[], name: string) =>
  text(
    rows.find(
      (row) => text(row, "nombre").toLowerCase() === name.toLowerCase(),
    ),
    "url",
  );

export default async function handler(_req: unknown, res: ApiResponse) {
  if (!hasMysqlConfig()) {
    res.status(503).json({
      error: "MYSQL_ENV_NOT_CONFIGURED",
    });
    return;
  }

  try {
    const base = await firstRow(`
      SELECT
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
      LIMIT 1
    `);

    if (!base) {
      res.status(404).json({
        error: "CONFIG_NOT_FOUND",
      });
      return;
    }

    const emisoraId = Number(base.id);
    const socialRows = await optionalRows(
      `
        SELECT nombre, url
        FROM lvj_cfg_redes_sociales
        WHERE emisora_id = :emisoraId AND activo = 1
        ORDER BY orden ASC, id ASC
      `,
      { emisoraId },
    );

    const stream = await optionalFirstRow(
      `
        SELECT *
        FROM lvj_rad_streams
        WHERE emisora_id = :emisoraId
        ORDER BY id ASC
        LIMIT 1
      `,
      { emisoraId },
    );

    const adsense = await optionalFirstRow(
      `
        SELECT *
        FROM lvj_pub_adsense
        WHERE emisora_id = :emisoraId
        ORDER BY id ASC
        LIMIT 1
      `,
      { emisoraId },
    );

    const config = {
      emisora_id: String(emisoraId),
      radio_stream_url: text(stream, "stream_url", "url_stream", "radio_stream_url"),
      radio_metadata_url: text(
        stream,
        "metadata_url",
        "url_metadata",
        "radio_metadata_url",
      ),
      radio_default_title:
        text(stream, "titulo_default", "radio_default_title") ||
        text(base, "nombre_emisora"),
      radio_default_subtitle:
        text(stream, "subtitulo_default", "radio_default_subtitle") ||
        text(base, "eslogan"),
      radio_player_image_url:
        text(stream, "imagen_default", "imagen_url", "radio_player_image_url") ||
        text(base, "logo_principal", "splash_imagen"),
      app_logo_url: text(base, "logo_principal", "logo_blanco", "logo_oscuro"),
      splash_imagen: text(base, "splash_imagen"),
      splash_video: text(base, "splash_video"),
      social_facebook_url: getSocialUrl(socialRows, "Facebook"),
      social_instagram_url: getSocialUrl(socialRows, "Instagram"),
      social_youtube_url: getSocialUrl(socialRows, "YouTube"),
      contact_whatsapp_url:
        getSocialUrl(socialRows, "WhatsApp") || text(base, "whatsapp"),
      contact_email: text(base, "correo_principal"),
      ads_enabled: boolValue(base.mostrar_publicidad, true),
      adsense_client_id: text(
        adsense,
        "cliente_id",
        "client_id",
        "adsense_client_id",
      ),
      adsense_programacion_slot: text(
        adsense,
        "slot_programacion",
        "programacion_slot",
        "adsense_programacion_slot",
      ),
      adsense_radio_slot: text(
        adsense,
        "slot_radio",
        "radio_slot",
        "adsense_radio_slot",
      ),
      mostrar_splash: boolValue(base.mostrar_splash, true),
      duracion_splash: text(base, "duracion_splash"),
      mostrar_radio: boolValue(base.mostrar_radio, true),
      mostrar_podcast: boolValue(base.mostrar_podcast, true),
      mostrar_santoral: boolValue(base.mostrar_santoral, true),
      mostrar_biblia: boolValue(base.mostrar_biblia, true),
      mostrar_lectio: boolValue(base.mostrar_lectio, true),
      mostrar_rosario: boolValue(base.mostrar_rosario, true),
      mostrar_eventos: boolValue(base.mostrar_eventos, true),
      idioma: text(base, "idioma"),
      version_app: text(base, "version_app"),
      nombre_tema: text(base, "nombre_tema"),
      color_primario: text(base, "color_primario"),
      color_secundario: text(base, "color_secundario"),
      color_acento: text(base, "color_acento"),
      color_texto: text(base, "color_texto"),
      color_fondo: text(base, "color_fondo"),
      color_card: text(base, "color_card"),
      color_borde: text(base, "color_borde"),
      tipografia_titulos: text(base, "tipografia_titulos"),
      tipografia_texto: text(base, "tipografia_texto"),
      modo: text(base, "modo"),
    };

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({
      error: "CONFIG_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
