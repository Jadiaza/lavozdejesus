import { deleteMeta, getMeta, setMeta } from "@/features/biblia/db";

export type ReadingTheme = "oscuro" | "claro" | "sepia";
export type ReadingFont = "literata" | "georgia" | "garamond" | "atkinson" | "sans";
export type ReadingAlignment = "izquierda" | "justificada";
export type ReadingWidth = "estrecho" | "normal" | "amplio";

export interface ReadingPreferences {
  tam: number;
  tema: ReadingTheme;
  fuente: ReadingFont;
  pesoFuente: number;
  interlineado: number;
  alineacion: ReadingAlignment;
  margenLectura: ReadingWidth;
}

export const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  tam: 17,
  tema: "oscuro",
  fuente: "literata",
  pesoFuente: 400,
  interlineado: 1.9,
  alineacion: "izquierda",
  margenLectura: "normal",
};

const STORAGE_KEY = "prefsLectura";

export async function loadReadingPreferences(): Promise<ReadingPreferences> {
  const saved = await getMeta<Partial<ReadingPreferences> & { fuente?: ReadingFont | "bookerly" }>(STORAGE_KEY);
  if (!saved) return DEFAULT_READING_PREFERENCES;
  return {
    ...DEFAULT_READING_PREFERENCES,
    ...saved,
    fuente: !saved.fuente || saved.fuente === "bookerly" ? "literata" : saved.fuente,
  };
}

export async function saveReadingPreferences(value: ReadingPreferences): Promise<void> {
  await setMeta(STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent("lvj:reading-preferences", { detail: value }));
}

export async function resetReadingPreferences(): Promise<ReadingPreferences> {
  await deleteMeta(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("lvj:reading-preferences", { detail: DEFAULT_READING_PREFERENCES }));
  return DEFAULT_READING_PREFERENCES;
}
