/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
SERVICIO: sheetsService.ts
VERSION: 1.0.0

DESARROLLADO POR:
Ing. Jose Alberto Diaz Agresott

PROPIETARIO:
Emisora Catolica La Voz de Jesus

UBICACION:
Monteria - Cordoba - Colombia

DERECHOS RESERVADOS
Emisora La Voz de Jesus

DESCRIPCION:
Servicio de lectura publica para contenido servido desde APIs MySQL.

FUNCIONES:
- Lee endpoints backend conectados a MySQL.
- Normaliza encabezados, fechas y campos de texto.
- Filtra contenido por fecha actual y estado publicado.
- Provee fallbacks para que Vercel funcione aunque falten variables de entorno.
- Reserva metodos de escritura para una futura API segura de backend.

==============================================================================
*/

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
  evangelio_versiculo: string;
  evangelio_texto: string;
  palabra_hoy: string;
  reflexion: string;
  pregunta_meditar: string;
  oracion: string;
  compromiso: string;
  mensaje_final: string;
  audio_url: string;
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

export interface SantoDelDia {
  [key: string]: string;
  fecha: string;
  mes: string;
  dia: string;
  nombre: string;
  titulo: string;
  resumen: string;
  lucha_que_enfrento: string;
  secreto_de_santidad: string;
  ensenanza_para_hoy: string;
  como_puedo_imitarlo: string;
  paso_concreto: string;
  oracion_intercesion: string;
  imagen_url: string;
  frase_destacada: string;
  estado: EstadoContenido;
}

export interface ProgramacionRadio {
  id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  programa: string;
  descripcion: string;
  imagen_url: string;
  estado: EstadoContenido;
}

export interface AppConfig {
  radio_stream_url: string;
  radio_metadata_url: string;
  radio_default_title: string;
  radio_default_subtitle: string;
  radio_player_image_url: string;
  app_logo_url: string;
  social_facebook_url: string;
  social_instagram_url: string;
  social_youtube_url: string;
  contact_whatsapp_url: string;
  contact_email: string;
  ads_enabled: boolean;
  adsense_client_id: string;
  adsense_programacion_slot: string;
  adsense_radio_slot: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  radio_stream_url: "https://stream.zeno.fm/phybdd3ph98uv",
  radio_metadata_url:
    "https://api.zeno.fm/mounts/metadata/subscribe/phybdd3ph98uv",
  radio_default_title: "La Voz de Jesus",
  radio_default_subtitle: "Conecta tu espiritu",
  radio_player_image_url: "",
  app_logo_url: "/logo.png",
  social_facebook_url: "https://www.facebook.com/lavozdejesus.col/",
  social_instagram_url: "https://www.instagram.com/lavozdejesus.co/",
  social_youtube_url: "https://www.youtube.com/@lvjesusco",
  contact_whatsapp_url:
    "https://api.whatsapp.com/send?phone=573028375008&text=Hola%20escucho%20la%20La%20Voz%20de%20Jesus",
  contact_email: "contacto@lavozdejesus.co",
  ads_enabled: true,
  adsense_client_id: "ca-pub-4848923962603353",
  adsense_programacion_slot: "",
  adsense_radio_slot: "",
};

/* ==========================================================================
   FUENTES API MYSQL
   ==========================================================================
   La app ya no lee contenido desde hojas externas. El frontend solo consume
   endpoints backend; las credenciales MySQL permanecen fuera del navegador.
*/

const normalizeApiBaseUrl = (value: string | undefined) =>
  value?.trim().replace(/\/+$/, "") ?? "";

const DEFAULT_PRODUCTION_API_BASE_URL = "https://lavozdejesus.co";

const API_BASE_URL = normalizeApiBaseUrl(
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    (import.meta.env.PROD ? DEFAULT_PRODUCTION_API_BASE_URL : undefined),
);

const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) return path;

  const phpPath = path.endsWith(".php") ? path : `${path}.php`;
  return `${API_BASE_URL}${phpPath.startsWith("/") ? "" : "/"}${phpPath}`;
};

const CONFIG_API_URL =
  (import.meta.env.VITE_APP_CONFIG_API_URL as string | undefined) ??
  buildApiUrl("/api/config");

const LITURGIA_API_URL =
  (import.meta.env.VITE_LITURGIA_API_URL as string | undefined) ??
  buildApiUrl("/api/liturgia");

const LECTIO_API_URL =
  (import.meta.env.VITE_LECTIO_API_URL as string | undefined) ??
  buildApiUrl("/api/lectio");

const SANTORAL_API_URL =
  (import.meta.env.VITE_SANTORAL_API_URL as string | undefined) ??
  buildApiUrl("/api/santoral");

const PROGRAMACION_API_URL =
  (import.meta.env.VITE_PROGRAMACION_API_URL as string | undefined) ??
  buildApiUrl("/api/programacion");

const clean = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";

const preserveText = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(value)
        .replace(/\\n/g, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
    : "";

const getGoogleDriveId = (value: string) => {
  const driveFileMatch = value.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  const driveOpenMatch = value.match(/[?&]id=([^&]+)/i);

  return driveFileMatch?.[1] ?? driveOpenMatch?.[1] ?? "";
};

const normalizeImageUrl = (value: unknown) => {
  const raw = clean(value);
  if (!raw) return "";

  const driveId = getGoogleDriveId(raw);

  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
  }

  return raw;
};

const normalizeAudioUrl = (value: unknown) => {
  const raw = clean(value);
  if (!raw) return "";

  const driveId = getGoogleDriveId(raw);

  if (driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }

  return raw;
};

const normalizeExternalUrl = (value: unknown) => {
  const raw = clean(value);
  const markdownLink = raw.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/i);

  return normalizeImageUrl(markdownLink?.[2] ?? raw);
};

const normalizeBoolean = (value: unknown) => {
  const raw = clean(value).toLowerCase();
  return ["1", "true", "si", "sí", "yes", "activo", "publicado"].includes(raw);
};

export const getTodayISO = () => new Date().toLocaleDateString("sv-SE");

/* ==========================================================================
   NORMALIZACION DE FECHAS
   ==========================================================================
   La app puede recibir fechas como texto, formato latino o numero serial.
   Internamente trabaja con YYYY-MM-DD.
*/

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

async function getApiRows<T>(url: string, params: Record<string, string> = {}): Promise<T[]> {
  const requestUrl = new URL(url, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value) requestUrl.searchParams.set(key, value);
  });

  const response = await fetch(requestUrl.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data as T[];
  }

  if (Array.isArray(data?.data)) {
    return data.data as T[];
  }

  return [];
}

const visibleStates = new Set(["1", "true", "si", "sí", "yes", "activo", "publicado"]);

const isPublished = (estado: unknown) => visibleStates.has(clean(estado).toLowerCase());
const isVisibleContent = (estado: unknown) => {
  const value = clean(estado).toLowerCase();
  return !value || visibleStates.has(value);
};

/* ==========================================================================
   MAPEO DE FILAS
   ========================================================================== */

const normalizeLiturgia = (row: Partial<LiturgiaDia>): LiturgiaDia => {
  const rawRow = row as Partial<LiturgiaDia> & { versiculo?: unknown };

  return {
    fecha: normalizeDateISO(row.fecha),
    tiempo_liturgico: clean(row.tiempo_liturgico),
    celebracion: clean(row.celebracion),
    color_liturgico: clean(row.color_liturgico),
    primera_lectura_cita: clean(row.primera_lectura_cita),
    primera_lectura_texto: preserveText(row.primera_lectura_texto),
    salmo_cita: clean(row.salmo_cita),
    salmo_respuesta: preserveText(row.salmo_respuesta),
    salmo_texto: preserveText(row.salmo_texto),
    segunda_lectura_cita: clean(row.segunda_lectura_cita),
    segunda_lectura_texto: preserveText(row.segunda_lectura_texto),
    evangelio_cita: clean(row.evangelio_cita),
    evangelio_versiculo: clean(row.evangelio_versiculo || rawRow.versiculo),
    evangelio_texto: preserveText(row.evangelio_texto),
    palabra_hoy: preserveText(row.palabra_hoy),
    reflexion: preserveText(row.reflexion),
    pregunta_meditar: preserveText(row.pregunta_meditar),
    oracion: preserveText(row.oracion),
    compromiso: preserveText(row.compromiso),
    mensaje_final: preserveText(row.mensaje_final),
    audio_url: normalizeAudioUrl(row.audio_url),
    fuente: clean(row.fuente),
    estado: clean(row.estado).toLowerCase() as EstadoContenido,
  };
};

const normalizeLectio = (row: Partial<LectioDivina>): LectioDivina => ({
  fecha: normalizeDateISO(row.fecha),
  reflexion: preserveText(row.reflexion),
  pregunta_meditar: preserveText(row.pregunta_meditar),
  oracion: preserveText(row.oracion),
  compromiso: preserveText(row.compromiso),
  mensaje_final: preserveText(row.mensaje_final),
  audio_url: normalizeAudioUrl(row.audio_url),
  estado: clean(row.estado).toLowerCase() as EstadoContenido,
});

const santoKnownKeys = new Set([
  "fecha",
  "mes",
  "dia",
  "nombre",
  "titulo",
  "resumen",
  "lucha_que_enfrento",
  "secreto_de_santidad",
  "ensenanza_para_hoy",
  "como_puedo_imitarlo",
  "paso_concreto",
  "oracion_intercesion",
  "imagen_url",
  "frase_destacada",
  "estado",
]);

const normalizeSanto = (row: Partial<SantoDelDia>): SantoDelDia => {
  const santo: SantoDelDia = {
    fecha: normalizeDateISO(row.fecha),
    mes: clean(row.mes),
    dia: clean(row.dia),
    nombre: clean(row.nombre),
    titulo: clean(row.titulo),
    resumen: preserveText(row.resumen),
    lucha_que_enfrento: preserveText(row.lucha_que_enfrento),
    secreto_de_santidad: preserveText(row.secreto_de_santidad),
    ensenanza_para_hoy: preserveText(row.ensenanza_para_hoy),
    como_puedo_imitarlo: preserveText(row.como_puedo_imitarlo),
    paso_concreto: preserveText(row.paso_concreto),
    oracion_intercesion: preserveText(row.oracion_intercesion),
    imagen_url: normalizeImageUrl(row.imagen_url),
    frase_destacada: preserveText(row.frase_destacada),
    estado: clean(row.estado).toLowerCase() as EstadoContenido,
  };

  Object.entries(row).forEach(([key, value]) => {
    if (!santoKnownKeys.has(key)) {
      santo[key] = preserveText(value);
    }
  });

  return santo;
};

const padDatePart = (value: string) => value.padStart(2, "0");

const monthDayFromDate = (fecha?: string) =>
  fecha && fecha.length >= 10 ? fecha.slice(5, 10) : "";

const monthDayFromSanto = (row: SantoDelDia) => {
  if (row.mes && row.dia) {
    return `${padDatePart(row.mes)}-${padDatePart(row.dia)}`;
  }

  return monthDayFromDate(row.fecha);
};

export const santoMatchesDate = (row: SantoDelDia, fecha: string) => {
  const selectedMonthDay = monthDayFromDate(fecha);

  return (
    row.fecha === fecha ||
    (selectedMonthDay !== "" && monthDayFromSanto(row) === selectedMonthDay)
  );
};

const normalizeProgramacion = (
  row: Partial<ProgramacionRadio>,
): ProgramacionRadio => {
  const rawRow = row as Partial<ProgramacionRadio> &
    Record<string, unknown> & {
      image_url?: unknown;
      imageurl?: unknown;
      imageUrl?: unknown;
      imagen?: unknown;
      imagen_programa?: unknown;
      foto_url?: unknown;
    };

  return {
    id: clean(row.id),
    dia_semana: clean(row.dia_semana),
    hora_inicio: clean(row.hora_inicio),
    hora_fin: clean(row.hora_fin),
    programa: clean(row.programa),
    descripcion: preserveText(row.descripcion),
    imagen_url: normalizeExternalUrl(
      row.imagen_url ||
        rawRow.image_url ||
        rawRow.imageurl ||
        rawRow.imageUrl ||
        rawRow.imagen ||
        rawRow.imagen_programa ||
        rawRow.foto_url,
    ),
    estado: clean(row.estado).toLowerCase() as EstadoContenido,
  };
};

/* ==========================================================================
   API PUBLICA DE CONSULTA
   ========================================================================== */

export async function getSheetData<T>(sheetName: string): Promise<T[]> {
  console.warn(
    `getSheetData(${sheetName}) esta deshabilitado: la app ahora consume APIs MySQL.`,
  );
  return [];
}

export async function getTodayLiturgia(
  fecha = getTodayISO(),
): Promise<LiturgiaDia | null> {
  const rows = await getApiRows<Partial<LiturgiaDia>>(LITURGIA_API_URL, { fecha });
  const todayRow = rows
    .map(normalizeLiturgia)
    .find((row) => row.fecha === fecha && isVisibleContent(row.estado));

  if (todayRow) return todayRow;

  const fallbackRows = await getApiRows<Partial<LiturgiaDia>>(LITURGIA_API_URL);

  return (
    fallbackRows
      .map(normalizeLiturgia)
      .filter((row) => row.fecha && isVisibleContent(row.estado))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))[0] ?? null
  );
}

export async function getPublishedLiturgias(): Promise<LiturgiaDia[]> {
  const rows = await getApiRows<Partial<LiturgiaDia>>(LITURGIA_API_URL);

  return rows
    .map(normalizeLiturgia)
    .filter((row) => row.fecha && isVisibleContent(row.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export async function getTodayLectio(
  fecha = getTodayISO(),
): Promise<LectioDivina | null> {
  const rows = await getApiRows<Partial<LectioDivina>>(LECTIO_API_URL, { fecha });

  return (
    rows
      .map(normalizeLectio)
      .find((row) => row.fecha === fecha && isPublished(row.estado)) ?? null
  );
}

export async function getPublishedLectios(): Promise<LectioDivina[]> {
  const rows = await getApiRows<Partial<LectioDivina>>(LECTIO_API_URL);

  return rows
    .map(normalizeLectio)
    .filter((row) => row.fecha && isPublished(row.estado))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export async function getTodaySantoDelDia(
  fecha = getTodayISO(),
): Promise<SantoDelDia | null> {
  const rows = await getApiRows<Partial<SantoDelDia>>(SANTORAL_API_URL, { fecha });

  return (
    rows
      .map(normalizeSanto)
      .find(
        (row) =>
          santoMatchesDate(row, fecha) && row.nombre && isVisibleContent(row.estado),
      ) ??
    null
  );
}

export async function getPublishedSantosDelDia(): Promise<SantoDelDia[]> {
  const rows = await getApiRows<Partial<SantoDelDia>>(SANTORAL_API_URL);

  return rows
    .map(normalizeSanto)
    .filter(
      (row) =>
        row.nombre &&
        (row.fecha || (row.mes && row.dia)) &&
        isVisibleContent(row.estado),
    )
    .sort((a, b) => monthDayFromSanto(a).localeCompare(monthDayFromSanto(b)));
}

export async function getSantoDelDia() {
  return getPublishedSantosDelDia();
}

export async function getPublishedProgramacion(): Promise<ProgramacionRadio[]> {
  const rows = await getApiRows<Partial<ProgramacionRadio>>(PROGRAMACION_API_URL);

  return rows
    .map(normalizeProgramacion)
    .filter((row) => row.programa && isVisibleContent(row.estado));
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

export async function getConfiguracion(): Promise<Record<string, string>> {
  const apiConfig = await getConfiguracionFromApi();

  if (Object.keys(apiConfig).length > 0) {
    return apiConfig;
  }

  return {};
}

async function getConfiguracionFromApi(): Promise<Record<string, string>> {
  if (!CONFIG_API_URL) return {};

  try {
    const response = await fetch(CONFIG_API_URL, {
      cache: "no-store",
    });

    if (!response.ok) return {};

    const data = (await response.json()) as Record<string, unknown>;

    return Object.entries(data).reduce<Record<string, string>>(
      (accumulator, [key, value]) => {
        if (typeof value === "boolean") {
          accumulator[key] = value ? "true" : "false";
          return accumulator;
        }

        accumulator[key] = clean(value);
        return accumulator;
      },
      {},
    );
  } catch {
    return {};
  }
}

export async function getConfigValue(key: string) {
  const config = await getConfiguracion();
  return config[key] ?? "";
}

export async function getAppConfig(): Promise<AppConfig> {
  const config = await getConfiguracion();

  return {
    radio_stream_url:
      normalizeExternalUrl(config.radio_stream_url) ||
      DEFAULT_APP_CONFIG.radio_stream_url,
    radio_metadata_url:
      normalizeExternalUrl(config.radio_metadata_url) ||
      DEFAULT_APP_CONFIG.radio_metadata_url,
    radio_default_title:
      clean(config.radio_default_title) || DEFAULT_APP_CONFIG.radio_default_title,
    radio_default_subtitle:
      clean(config.radio_default_subtitle) ||
      DEFAULT_APP_CONFIG.radio_default_subtitle,
    radio_player_image_url:
      normalizeExternalUrl(config.radio_player_image_url) ||
      normalizeExternalUrl(config.app_logo_url) ||
      DEFAULT_APP_CONFIG.radio_player_image_url,
    app_logo_url:
      normalizeExternalUrl(config.app_logo_url) || DEFAULT_APP_CONFIG.app_logo_url,
    social_facebook_url:
      normalizeExternalUrl(config.social_facebook_url) ||
      DEFAULT_APP_CONFIG.social_facebook_url,
    social_instagram_url:
      normalizeExternalUrl(config.social_instagram_url) ||
      DEFAULT_APP_CONFIG.social_instagram_url,
    social_youtube_url:
      normalizeExternalUrl(config.social_youtube_url) ||
      DEFAULT_APP_CONFIG.social_youtube_url,
    contact_whatsapp_url:
      normalizeExternalUrl(config.contact_whatsapp_url) ||
      DEFAULT_APP_CONFIG.contact_whatsapp_url,
    contact_email: clean(config.contact_email) || DEFAULT_APP_CONFIG.contact_email,
    ads_enabled:
      config.ads_enabled === undefined
        ? DEFAULT_APP_CONFIG.ads_enabled
        : normalizeBoolean(config.ads_enabled),
    adsense_client_id:
      clean(config.adsense_client_id) || DEFAULT_APP_CONFIG.adsense_client_id,
    adsense_programacion_slot:
      clean(config.adsense_programacion_slot) ||
      DEFAULT_APP_CONFIG.adsense_programacion_slot,
    adsense_radio_slot:
      clean(config.adsense_radio_slot) || DEFAULT_APP_CONFIG.adsense_radio_slot,
  };
}

/* ==========================================================================
   ESCRITURA SEGURA PENDIENTE
   ==========================================================================
   No escribir directamente desde el frontend. Estas acciones deben pasar por
   una API backend con credenciales protegidas.
*/

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
