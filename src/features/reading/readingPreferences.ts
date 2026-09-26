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

// Paleta maestra: reproduce los tres temas oficiales de Leer Biblia.
export const READING_THEME_PALETTES: Record<ReadingTheme, { background: string; surface: string; text: string; muted: string; accent: string; border: string }> = {
  oscuro: { background: "#111111", surface: "#0B0B0B", text: "#F8F5EA", muted: "#C9C3B3", accent: "#D4AF37", border: "rgba(212,175,55,.20)" },
  claro: { background: "#F8F5EA", surface: "#FFFDF8", text: "#14120D", muted: "#665F54", accent: "#D4AF37", border: "rgba(212,175,55,.30)" },
  sepia: { background: "#E7E1CF", surface: "#E7E1CF", text: "#20211D", muted: "#5F5B4D", accent: "#655A35", border: "rgba(95,91,77,.25)" },
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
  if (saved) {
    return { ...DEFAULT_READING_PREFERENCES, ...saved, fuente: !saved.fuente || saved.fuente === "bookerly" ? "literata" : saved.fuente };
  }

  if (typeof window !== "undefined") {
    try {
      const prayerRaw = window.localStorage.getItem("lvj-prayer-preferences-v1");
      if (prayerRaw) {
        const legacy = JSON.parse(prayerRaw) as { theme?: string; font?: string; fontSize?: number; alignment?: string; lineHeight?: number; focusedWidth?: boolean };
        const migrated: ReadingPreferences = {
          ...DEFAULT_READING_PREFERENCES,
          tema: legacy.theme === "light" ? "claro" : legacy.theme === "sepia" ? "sepia" : "oscuro",
          fuente: legacy.font === "sans" ? "sans" : legacy.font === "serif" ? "georgia" : "literata",
          tam: Math.min(26, Math.max(13, Number(legacy.fontSize) || DEFAULT_READING_PREFERENCES.tam)),
          interlineado: Number(legacy.lineHeight) || DEFAULT_READING_PREFERENCES.interlineado,
          alineacion: legacy.alignment === "justify" ? "justificada" : "izquierda",
          margenLectura: legacy.focusedWidth ? "amplio" : "normal",
        };
        await setMeta(STORAGE_KEY, migrated);
        return migrated;
      }

      const liturgyRaw = window.localStorage.getItem("lvj_liturgia_reading_preferences_v1");
      if (liturgyRaw) {
        const legacy = JSON.parse(liturgyRaw) as { theme?: string; fontSize?: number; alignment?: string };
        const migrated: ReadingPreferences = {
          ...DEFAULT_READING_PREFERENCES,
          tema: legacy.theme === "claro" ? "claro" : legacy.theme === "sepia" ? "sepia" : "oscuro",
          tam: Math.min(26, Math.max(13, Number(legacy.fontSize) || DEFAULT_READING_PREFERENCES.tam)),
          alineacion: legacy.alignment === "justify" ? "justificada" : "izquierda",
        };
        await setMeta(STORAGE_KEY, migrated);
        return migrated;
      }
    } catch { /* conserva valores oficiales */ }
  }
  return DEFAULT_READING_PREFERENCES;
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
