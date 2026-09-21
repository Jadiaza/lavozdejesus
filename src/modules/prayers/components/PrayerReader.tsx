import type { CSSProperties, ReactNode } from "react";
import {
  READING_FONT_FAMILIES,
  READING_THEME_PALETTES,
  type ReadingPreferences,
} from "@/features/reading/readingPreferences";

export function PrayerReader({ preferences, children, integrated = false }: { preferences: ReadingPreferences; children: ReactNode; integrated?: boolean }) {
  const theme = READING_THEME_PALETTES[preferences.tema];
  const width = preferences.margenLectura === "amplio" ? "38rem" : preferences.margenLectura === "normal" ? "48rem" : "56rem";
  const style = {
    "--prayer-accent": theme.accent,
    background: integrated ? "transparent" : theme.surface,
    color: theme.text,
    fontFamily: READING_FONT_FAMILIES[preferences.fuente],
    fontSize: `${preferences.tam}px`,
    fontWeight: preferences.pesoFuente,
    lineHeight: preferences.interlineado,
    textAlign: preferences.alineacion === "justificada" ? "justify" : "left",
    maxWidth: width,
  } as CSSProperties;

  return <article style={style} className={`mx-auto transition-colors ${integrated ? "w-full px-1 py-0" : "rounded-2xl border border-white/10 p-5 shadow-xl"}`}>{children}</article>;
}
