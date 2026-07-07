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

const pad = (value: string) => value.padStart(2, "0");

const dateFromSaint = (row: DbRow, year: string) => {
  const month = text(row, "mes");
  const day = text(row, "dia");
  if (month && day) return `${year}-${pad(month)}-${pad(day)}`;

  const raw = text(row, "fecha");
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return `${year}-${raw.slice(5, 10)}`;
  }

  return raw;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!hasMysqlConfig()) {
    res.status(503).json({ error: "MYSQL_ENV_NOT_CONFIGURED" });
    return;
  }

  try {
    const url = new URL(req.url ?? "/api/santoral", "http://localhost");
    const fecha = String(req.query?.fecha ?? url.searchParams.get("fecha") ?? "").slice(0, 10);
    const year = fecha.slice(0, 4) || new Date().getFullYear().toString();

    const [rows] = await getMysqlPool().execute(
      "SELECT * FROM lvj_san_santo_dia ORDER BY mes ASC, dia ASC, id ASC LIMIT 600",
    );

    const data = (rows as DbRow[])
      .filter(visible)
      .map((row) => ({
        ...row,
        fecha: dateFromSaint(row, year),
        nombre: text(row, "nombre"),
        titulo: text(row, "titulo"),
        resumen: text(row, "resumen", "quien_fue"),
        historia: text(row, "historia", "quien_fue"),
        lectura_espiritual: text(row, "lectura_espiritual", "ensenanza_para_hoy"),
        imagen_url: text(row, "imagen_url"),
        frase_destacada: text(row, "frase_destacada"),
        estado: text(row, "estado") || "publicado",
      }))
      .filter((row) => !fecha || row.fecha === fecha);

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "SANTORAL_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
