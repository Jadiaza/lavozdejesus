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

const boolValue = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  return ["1", "true", "si", "yes", "activo", "activa"].includes(
    String(value ?? "").trim().toLowerCase(),
  );
};

const normalizeStream = (row: DbRow | null) =>
  row
    ? {
        id: text(row, "id"),
        capilla_id: text(row, "capilla_id"),
        nombre: text(row, "nombre"),
        tipo_stream: text(row, "tipo_stream") || "hls",
        calidad: text(row, "calidad") || "auto",
        url_stream: text(row, "url_stream"),
        url_origen: text(row, "url_origen"),
        requiere_token: boolValue(row.requiere_token),
        requiere_referer: boolValue(row.requiere_referer),
        referer_url: text(row, "referer_url"),
        es_principal: boolValue(row.es_principal),
        estado: text(row, "estado") || "activo",
        ultima_verificacion: text(row, "ultima_verificacion"),
        updated_at: text(row, "updated_at"),
      }
    : null;

const normalizeChapel = (row: DbRow, stream: DbRow | null) => ({
  id: text(row, "id"),
  nombre: text(row, "nombre"),
  subtitulo: text(row, "subtitulo"),
  descripcion: text(row, "descripcion"),
  pais: text(row, "pais"),
  ciudad: text(row, "ciudad"),
  sitio_web: text(row, "sitio_web"),
  imagen_url: text(row, "imagen_url"),
  logo_url: text(row, "logo_url"),
  es_principal: boolValue(row.es_principal),
  es_respaldo: boolValue(row.es_respaldo),
  prioridad: Number(text(row, "prioridad") || 0),
  estado: text(row, "estado") || "activo",
  updated_at: text(row, "updated_at"),
  stream: normalizeStream(stream),
});

export default async function handler(_req: unknown, res: ApiResponse) {
  if (!hasMysqlConfig()) {
    res.status(503).json({ error: "MYSQL_ENV_NOT_CONFIGURED" });
    return;
  }

  try {
    const [chapelRows] = await getMysqlPool().execute(
      `
        SELECT *
        FROM lvj_capillas
        WHERE deleted_at IS NULL
          AND LOWER(COALESCE(estado, '')) IN ('', '1', 'activo', 'activa', 'publicado')
        ORDER BY es_principal DESC, es_respaldo ASC, prioridad ASC, id DESC
        LIMIT 1
      `,
    );

    const chapel = (chapelRows as DbRow[])[0] ?? null;
    let stream: DbRow | null = null;

    if (chapel) {
      const [streamRows] = await getMysqlPool().execute(
        `
          SELECT *
          FROM lvj_capilla_streams
          WHERE capilla_id = :capilla_id
            AND deleted_at IS NULL
            AND LOWER(COALESCE(estado, '')) IN ('', '1', 'activo', 'activa', 'publicado')
          ORDER BY es_principal DESC, calidad = 'auto' DESC, id DESC
          LIMIT 1
        `,
        { capilla_id: text(chapel, "id") },
      );
      stream = (streamRows as DbRow[])[0] ?? null;
    }

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json(chapel ? normalizeChapel(chapel, stream) : null);
  } catch (error) {
    res.status(500).json({
      error: "CAPILLA_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
