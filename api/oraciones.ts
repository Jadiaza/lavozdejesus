import { getMysqlPool, hasMysqlConfig } from "./_mysql.js";

type ApiRequest = { query?: Record<string, string | string[] | undefined> };
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => { json: (body: unknown) => void };
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

const boolValue = (value: unknown, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  return ["1", "true", "si", "sí", "yes", "activo"].includes(String(value).trim().toLowerCase());
};

const jsonObject = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const normalize = (row: DbRow) => {
  const content = jsonObject(row.contenido_json);
  const contentText = (...keys: string[]) => {
    if (!content) return "";
    for (const key of keys) {
      const value = content[key];
      if (typeof value === "string" || typeof value === "number") {
        const clean = String(value).trim();
        if (clean) return clean;
      }
    }
    return "";
  };
  const sections = Array.isArray(content?.secciones) ? content.secciones : [];
  const firstSection = sections.find((section) => section && typeof section === "object") as Record<string, unknown> | undefined;
  const fullText = text(row, "texto_completo", "texto", "oracion") ||
    contentText("texto_completo", "texto", "oracion") ||
    (typeof firstSection?.texto === "string" ? firstSection.texto.trim() : "");

  return {
    id: text(row, "id"),
    titulo: text(row, "titulo", "nombre") || contentText("titulo", "nombre"),
    subtitulo: text(row, "subtitulo") || contentText("subtitulo"),
    categoria: text(row, "categoria") || contentText("categoria") || "Oraciones del cristiano",
    descripcion: text(row, "descripcion") || contentText("descripcion"),
    texto_completo: fullText,
    tema_visual: text(row, "tema_visual") || contentText("tema_visual") || "oracion",
    imagen: text(row, "imagen", "imagen_url") || contentText("imagen", "imagen_url"),
    audio_url: text(row, "audio_url", "audio") || contentText("audio_url", "audio"),
    fuente: text(row, "fuente") || contentText("fuente") || "Biblioteca de oraciones LVJPRAYER",
    pagina_fuente: text(row, "pagina_fuente") || contentText("pagina_fuente"),
    destacada: boolValue(row.destacada),
    disponible_offline: boolValue(row.disponible_offline, true),
    orden: Number(text(row, "orden") || 0),
    estado_revision: text(row, "estado_revision"),
  };
};

const isVisible = (row: DbRow) => {
  const status = text(row, "estado", "activo", "status").toLowerCase();
  const review = text(row, "estado_revision").toLowerCase();
  return !["0", "inactivo", "inactiva", "eliminado", "deleted"].includes(status) &&
    !["rechazada", "archivada", "eliminada"].includes(review);
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!hasMysqlConfig()) {
    res.status(503).json({ success: false, error: "MYSQL_ENV_NOT_CONFIGURED" });
    return;
  }

  try {
    const [rows] = await getMysqlPool().execute(
      "SELECT * FROM lvj_ora_oraciones ORDER BY orden ASC, id ASC LIMIT 500",
    );
    const records = (rows as DbRow[]).filter(isVisible).map(normalize).filter((item) => item.titulo && item.texto_completo);
    const rawId = Array.isArray(req.query?.id) ? req.query?.id[0] : req.query?.id;
    const rawCategory = Array.isArray(req.query?.categoria) ? req.query?.categoria[0] : req.query?.categoria;

    if (rawId) {
      const prayer = records.find((item) => item.id === String(rawId));
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      res.status(prayer ? 200 : 404).json(prayer ? { success: true, oracion: prayer } : { success: false, error: "ORACION_NO_ENCONTRADA" });
      return;
    }

    const category = String(rawCategory ?? "").trim().toLowerCase();
    const filtered = category
      ? records.filter((item) => item.categoria.trim().toLowerCase() === category)
      : records;
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ success: true, total: filtered.length, oraciones: filtered });
  } catch {
    res.status(500).json({ success: false, error: "ORACIONES_QUERY_FAILED" });
  }
}
