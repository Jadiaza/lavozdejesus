import { getMysqlPool, hasMysqlConfig } from "./_mysql";

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

const visible = (row: DbRow) => {
  const value = text(row, "estado", "status", "activo").toLowerCase();
  return !value || ["1", "activo", "publicado", "true", "si", "sí"].includes(value);
};

const rowsById = (rows: DbRow[]) =>
  rows.reduce<Record<string, DbRow>>((accumulator, row) => {
    const id = text(row, "id");
    if (id) accumulator[id] = row;
    return accumulator;
  }, {});

const optionalRows = async (sql: string) => {
  try {
    const [rows] = await getMysqlPool().execute(sql);
    return rows as DbRow[];
  } catch {
    return [];
  }
};

export default async function handler(_req: unknown, res: ApiResponse) {
  if (!hasMysqlConfig()) {
    res.status(503).json({ error: "MYSQL_ENV_NOT_CONFIGURED" });
    return;
  }

  try {
    const [schedule, programs] = await Promise.all([
      optionalRows("SELECT * FROM lvj_rad_programacion ORDER BY dia_semana ASC, hora_inicio ASC, id ASC LIMIT 1000"),
      optionalRows("SELECT * FROM lvj_rad_programas ORDER BY id ASC LIMIT 500"),
    ]);

    const programsById = rowsById(programs);
    const data = schedule
      .filter(visible)
      .map((row) => {
        const program = programsById[text(row, "programa_id")];
        return {
          id: text(row, "id"),
          dia_semana: text(row, "dia_semana", "dia", "dia_nombre") || "diario",
          hora_inicio: text(row, "hora_inicio", "inicio"),
          hora_fin: text(row, "hora_fin", "fin"),
          programa: text(row, "programa", "nombre") || text(program, "nombre", "titulo"),
          descripcion: text(row, "descripcion") || text(program, "descripcion"),
          imagen_url: text(row, "imagen_url", "image_url", "imagen") || text(program, "imagen_url", "image_url", "imagen"),
          estado: text(row, "estado", "status") || "publicado",
        };
      })
      .filter((row) => row.programa);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "PROGRAMACION_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
