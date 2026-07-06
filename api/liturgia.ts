import { getMysqlPool, hasMysqlConfig } from "./_mysql";

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
  if (text(row, "deleted_at")) return false;

  const value = text(row, "estado", "status", "activo").toLowerCase();
  return !value || ["1", "activo", "publicado", "true", "si", "sí"].includes(value);
};

const normalizeDate = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const [, day, month, year] = slash;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return raw;
};

const optionalRows = async (sql: string) => {
  try {
    const [rows] = await getMysqlPool().execute(sql);
    return rows as DbRow[];
  } catch {
    return [];
  }
};

const rowsById = (rows: DbRow[]) =>
  rows.reduce<Record<string, DbRow>>((accumulator, row) => {
    const id = text(row, "id");
    if (id) accumulator[id] = row;
    return accumulator;
  }, {});

const rowsByKey = (rows: DbRow[], getKey: (row: DbRow) => string) =>
  rows.reduce<Record<string, DbRow>>((accumulator, row) => {
    const key = getKey(row);
    if (key && !accumulator[key]) accumulator[key] = row;
    return accumulator;
  }, {});

const cleanLiturgicalName = (value: string) =>
  value.replace(/^tiempo\s+/i, "").trim();

const monthDayFromDate = (value: string) => (value.length >= 10 ? value.slice(5, 10) : "");

const monthDayFromSaint = (row: DbRow) => {
  const month = text(row, "mes");
  const day = text(row, "dia");
  if (month && day) return `${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

  return monthDayFromDate(normalizeDate(row.fecha));
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!hasMysqlConfig()) {
    res.status(503).json({ error: "MYSQL_ENV_NOT_CONFIGURED" });
    return;
  }

  try {
    const url = new URL(req.url ?? "/api/liturgia", "http://localhost");
    const fecha = String(req.query?.fecha ?? url.searchParams.get("fecha") ?? "").slice(0, 10);

    const [lecturas, dias, palabras, tiempos, temas, santos, celebraciones, tipos] =
      await Promise.all([
        optionalRows("SELECT * FROM lvj_lit_lectura_dia ORDER BY fecha ASC, id ASC LIMIT 600"),
        optionalRows("SELECT * FROM lvj_lit_dia ORDER BY fecha ASC, id ASC LIMIT 600"),
        optionalRows("SELECT * FROM lvj_lit_palabra_dia ORDER BY fecha ASC, id ASC LIMIT 600"),
        optionalRows("SELECT * FROM lvj_lit_tiempos ORDER BY prioridad ASC, id ASC LIMIT 100"),
        optionalRows("SELECT * FROM lvj_lit_temas ORDER BY id ASC LIMIT 200"),
        optionalRows("SELECT * FROM lvj_san_santo_dia ORDER BY mes ASC, dia ASC, id ASC LIMIT 500"),
        optionalRows("SELECT * FROM lvj_lit_celebraciones ORDER BY mes ASC, dia ASC, id ASC LIMIT 500"),
        optionalRows("SELECT * FROM lvj_lit_tipos_celebracion ORDER BY prioridad ASC, id ASC LIMIT 100"),
      ]);

    const daysById = rowsById(dias);
    const daysByDate = rowsByKey(dias, (row) => normalizeDate(row.fecha));
    const wordsByLiturgiaId = rowsByKey(palabras, (row) => text(row, "liturgia_id"));
    const wordsByDate = rowsByKey(palabras, (row) => normalizeDate(row.fecha));
    const timesById = rowsById(tiempos);
    const themesById = rowsById(temas);
    const saintsById = rowsById(santos);
    const saintsByMonthDay = rowsByKey(santos, monthDayFromSaint);
    const celebrationsById = rowsById(celebraciones);
    const typesById = rowsById(tipos);
    const baseRows = lecturas.length > 0 ? lecturas : dias.length > 0 ? dias : palabras;

    const data = baseRows
      .filter(visible)
      .map((row) => {
        const rowDate = normalizeDate(row.fecha);
        const day = daysById[text(row, "liturgia_id")] || daysByDate[rowDate] || row;
        const liturgiaId = text(row, "liturgia_id") || text(day, "id") || text(row, "id");
        const word = wordsByLiturgiaId[liturgiaId] || wordsByDate[rowDate] || row;
        const normalizedDate = rowDate || normalizeDate(day.fecha) || normalizeDate(word.fecha);
        const tiempo = timesById[text(row, "tiempo_id") || text(day, "tiempo_id")];
        const tema = themesById[text(row, "tema_id") || text(day, "tema_id")];
        const santo =
          saintsById[text(row, "santo_id") || text(day, "santo_id")] ||
          saintsByMonthDay[monthDayFromDate(normalizedDate)];
        const celebracion =
          celebrationsById[text(row, "celebracion_id") || text(day, "celebracion_id")];
        const tipo = typesById[text(celebracion, "tipo_celebracion_id", "tipo_id")];

        const tiempoNombre =
          text(row, "tiempo_liturgico") ||
          text(day, "tiempo_liturgico") ||
          cleanLiturgicalName(text(tiempo, "nombre"));
        const celebracionNombre =
          text(row, "celebracion") ||
          text(day, "celebracion") ||
          text(celebracion, "nombre") ||
          text(santo, "nombre");
        const colorCelebracion = text(celebracion, "color_liturgico", "color");
        const colorTiempo = text(tiempo, "color_liturgico", "color");

        return {
          ...row,
          fecha: normalizedDate,
          tiempo_liturgico: tiempoNombre,
          celebracion: celebracionNombre,
          grado_celebracion: text(tipo, "nombre"),
          santo: text(santo, "nombre"),
          tema_devocional: text(tema, "nombre"),
          color_liturgico:
            text(row, "color_liturgico") ||
            text(day, "color_liturgico") ||
            colorCelebracion ||
            colorTiempo,
          primera_lectura_cita: text(row, "primera_lectura_cita"),
          primera_lectura_texto: text(row, "primera_lectura_texto"),
          salmo_cita: text(row, "salmo_cita"),
          salmo_respuesta: text(row, "salmo_respuesta"),
          salmo_texto: text(row, "salmo_texto"),
          segunda_lectura_cita: text(row, "segunda_lectura_cita"),
          segunda_lectura_texto: text(row, "segunda_lectura_texto"),
          evangelio_cita: text(row, "evangelio_cita"),
          evangelio_versiculo: text(row, "evangelio_versiculo", "versiculo"),
          evangelio_texto: text(row, "evangelio_texto"),
          palabra_hoy:
            text(row, "palabra_hoy", "frase_destacada") ||
            text(word, "texto", "frase_destacada", "palabra_hoy") ||
            text(row, "evangelio_cita"),
          fuente: text(row, "fuente"),
          estado: text(row, "estado") || text(day, "estado") || text(word, "estado") || "publicado",
        };
      })
      .filter((row) => !fecha || row.fecha === fecha);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "LITURGIA_QUERY_FAILED",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
