import Papa from "papaparse";

export type EstadoContenido = "borrador" | "pendiente" | "publicado" | "archivado" | "";

export interface LiturgiaDia {
  fecha: string;
  tiempo_liturgico: string;
  celebracion: string;
  color_liturgico: string;
  primera_lectura_cita: string;
  primera_lectura_texto: string;
  salmo_cita: string;
  salmo_respuesta: string;
  salmo_texto: string;
  segunda_lectura_cita: string;
  segunda_lectura_texto: string;
  evangelio_cita: string;
  evangelio_texto: string;
  palabra_hoy: string;
  fuente: string;
  estado: EstadoContenido;
}

export interface LectioDivina {
  fecha: string;
  reflexion: string;
  pregunta_meditar: string;
  oracion: string;
  compromiso: string;
  mensaje_final: string;
  audio_url: string;
  estado: EstadoContenido;
}

const DEFAULT_LITURGIA_DIA_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7j7j9nNJ9DP7pFXM68yMrFUOan_pmUuGscDseMbkSWo4T1srKj2VsyUYE8XWnJlRpMAuR9QvQ2KVS/pub?gid=0&single=true&output=csv";

const DEFAULT_LECTIO_DIVINA_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7j7j9nNJ9DP7pFXM68yMrFUOan_pmUuGscDseMbkSWo4T1srKj2VsyUYE8XWnJlRpMAuR9QvQ2KVS/pub?gid=1951794410&single=true&output=csv";

const LITURGIA_DIA_CSV_URL =
  (import.meta.env.VITE_LITURGIA_DIA_CSV_URL as string | undefined) ??
  DEFAULT_LITURGIA_DIA_CSV_URL;

const LECTIO_DIVINA_CSV_URL =
  (import.meta.env.VITE_LECTIO_DIVINA_CSV_URL as string | undefined) ??
  DEFAULT_LECTIO_DIVINA_CSV_URL;

const clean = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";

const normalizeHeader = (header: string) =>
  header.trim().toLowerCase().replace(/\s+/g, "_");

export const getTodayISO = () => new Date().toLocaleDateString("sv-SE");

const excelSerialToISO = (serial: number) => {
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  return date.toISOString().slice(0, 10);
};

export const normalizeDateISO = (value: unknown) => {
  const raw = clean(value);

  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d+(\.\d+)?$/.test(raw)) return excelSerialToISO(Number(raw));

  const slashDate = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashDate) {
    const [, day, month, year] = slashDate;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const dashDate = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashDate) {
    const [, day, month, year] = dashDate;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toISOString().slice(0, 10);
};

async function getCsvRows<T>(url: string): Promise<T[]> {
  const requestUrl = new URL(url);
  requestUrl.searchParams.set("_ts", String(Date.now()));
  const response = await fetch(requestUrl.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudo leer la hoja: ${response.status}`);
  }

  const csv = await response.text();
  const result = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  return result.data;
}

const isPublished = (estado: unknown) => clean(estado).toLowerCase() === "publicado";

const normalizeLiturgia = (row: Partial<LiturgiaDia>): LiturgiaDia => ({
  fecha: normalizeDateISO(row.fecha),
  tiempo_liturgico: clean(row.tiempo_liturgico),
  celebracion: clean(row.celebracion),
  color_liturgico: clean(row.color_liturgico),
  primera_lectura_cita: clean(row.primera_lectura_cita),
  primera_lectura_texto: clean(row.primera_lectura_texto),
  salmo_cita: clean(row.salmo_cita),
  salmo_respuesta: clean(row.salmo_respuesta),
  salmo_texto: clean(row.salmo_texto),
  segunda_lectura_cita: clean(row.segunda_lectura_cita),
  segunda_lectura_texto: clean(row.segunda_lectura_texto),
  evangelio_cita: clean(row.evangelio_cita),
  evangelio_texto: clean(row.evangelio_texto),
  palabra_hoy: clean(row.palabra_hoy),
  fuente: clean(row.fuente),
  estado: clean(row.estado).toLowerCase() as EstadoContenido,
});

const normalizeLectio = (row: Partial<LectioDivina>): LectioDivina => ({
  fecha: normalizeDateISO(row.fecha),
  reflexion: clean(row.reflexion),
  pregunta_meditar: clean(row.pregunta_meditar),
  oracion: clean(row.oracion),
  compromiso: clean(row.compromiso),
  mensaje_final: clean(row.mensaje_final),
  audio_url: clean(row.audio_url),
  estado: clean(row.estado).toLowerCase() as EstadoContenido,
});

export async function getSheetData<T>(sheetName: string): Promise<T[]> {
  const envKey = `VITE_${sheetName.toUpperCase()}_CSV_URL`;
  const url = import.meta.env[envKey] as string | undefined;

  if (!url) return [];

  return getCsvRows<T>(url);
}

export async function getTodayLiturgia(
  fecha = getTodayISO(),
): Promise<LiturgiaDia | null> {
  if (!LITURGIA_DIA_CSV_URL) {
    return null;
  }

  const rows = await getCsvRows<Partial<LiturgiaDia>>(LITURGIA_DIA_CSV_URL);

  return (
    rows
      .map(normalizeLiturgia)
      .find((row) => row.fecha === fecha && isPublished(row.estado)) ?? null
  );
}

export async function getTodayLectio(
  fecha = getTodayISO(),
): Promise<LectioDivina | null> {
  if (!LECTIO_DIVINA_CSV_URL) return null;

  const rows = await getCsvRows<Partial<LectioDivina>>(LECTIO_DIVINA_CSV_URL);

  return (
    rows
      .map(normalizeLectio)
      .find((row) => row.fecha === fecha && isPublished(row.estado)) ?? null
  );
}

export async function getSantoDelDia() {
  return getSheetData("SANTO_DEL_DIA");
}

export async function getRosarios() {
  return getSheetData("ROSARIOS");
}

export async function getPodcasts() {
  return getSheetData("PODCASTS");
}

export async function getPeticiones() {
  return getSheetData("PETICIONES_ORACION");
}

export async function getComunidad() {
  return getSheetData("COMUNIDAD");
}

export async function getCategoriasMusicales() {
  return getSheetData("CATEGORIAS_MUSICALES");
}

export async function getCapillaVirtual() {
  return getSheetData("CAPILLA_VIRTUAL");
}

export async function getFrasesCatolicas() {
  return getSheetData("FRASES_CATOLICAS");
}

export async function getConfiguracion() {
  return getSheetData<{ clave: string; valor: string }>("CONFIGURACION_GENERAL");
}

export async function getConfigValue(key: string) {
  const config = await getConfiguracion();
  return config.find((item) => clean(item.clave) === key)?.valor ?? "";
}

export async function createRow() {
  throw new Error("createRow debe implementarse desde una API segura del backend.");
}

export async function updateRow() {
  throw new Error("updateRow debe implementarse desde una API segura del backend.");
}

export async function approveContent() {
  throw new Error("approveContent debe implementarse desde una API segura del backend.");
}

export async function publishContent() {
  throw new Error("publishContent debe implementarse desde una API segura del backend.");
}
