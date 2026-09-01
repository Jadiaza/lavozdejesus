import { getMysqlPool, hasMysqlConfig } from "./_mysql.js";

type ApiRequest = {
  url?: string;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type DbRow = Record<string, unknown>;

const text = (row: DbRow, ...keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" || typeof value === "number") {
      const clean = String(value).trim();
      if (clean) return clean;
    }
  }

  return "";
};

const visible = (row: DbRow) => {
  const value = text(row, "estado", "status", "activo").toLowerCase();
  return !value || ["1", "activo", "publicado", "true", "si", "sí"].includes(value);
};

const normalizeDate = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const raw = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : raw;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!hasMysqlConfig()) {
    res.status(503).json({ error: "MYSQL_ENV_NOT_CONFIGURED" });
    return;
  }

  try {
    const url = new URL(req.url ?? "/api/lectio", "http://localhost");
    const fecha = String(req.query?.fecha ?? url.searchParams.get("fecha") ?? "").slice(0, 10);

    const [rows] = await getMysqlPool().execute(
      "SELECT * FROM lvj_lit_lectio_divina ORDER BY fecha ASC, id ASC LIMIT 600",
    );

    const data = (rows as DbRow[])
      .filter(visible)
      .map((row) => ({
        ...row,
        fecha: normalizeDate(row.fecha),
        frase_destacada: text(row, "frase_destacada"),
        cita_destacada: text(row, "cita_destacada") || text(row, "cita"),
        reflexion: text(row, "reflexion"),
        pregunta_meditar: text(row, "pregunta_meditar"),
        oracion: text(row, "oracion"),
        compromiso: text(row, "compromiso"),
        mensaje_final: text(row, "mensaje_final"),
        audio_url: text(row, "audio_url"),
        estado: text(row, "estado") || "publicado",
      }))
      .filter((row) => !fecha || row.fecha === fecha);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "LECTIO_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
