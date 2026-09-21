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

export const READING_FONT_FAMILIES: Record<ReadingFont, string> = {
  literata: "'Literata', Georgia, serif",
  georgia: "Georgia, 'Times New Roman', serif",
  garamond: "'EB Garamond', Garamond, serif",
  atkinson: "'Atkinson Hyperlegible', Arial, sans-serif",
  sans: "'Montserrat', system-ui, sans-serif",
};

export const READING_THEME_PALETTES: Record<ReadingTheme, { background: string; surface: string; text: string; muted: string; accent: string; border: string }> = {
  oscuro: { background: "#050505", surface: "#0B0B0B", text: "#F8F5EA", muted: "#B8B2A6", accent: "#D4AF37", border: "rgba(212,175,55,.24)" },
  claro: { background: "#F8F5EA", surface: "#FFFDF8", text: "#17140D", muted: "#665F54", accent: "#9A6A10", border: "rgba(138,97,18,.25)" },
  sepia: { background: "#E7E1CF", surface: "#EEE9D9", text: "#20211D", muted: "#5F5B4D", accent: "#7C5416", border: "rgba(95,91,77,.34)" },
};

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
