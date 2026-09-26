import { useState, type CSSProperties, type ReactNode } from "react";
import ReadingSettingsSheet from "@/features/reading/ReadingSettingsSheet";
import {
  READING_FONT_FAMILIES,
  READING_THEME_PALETTES,
} from "@/features/reading/readingPreferences";
import { useReadingPreferences } from "@/features/reading/useReadingPreferences";
import { StudyReadingThemeContext } from "./StudyReadingTheme";

export function StudyReadingFrame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { preferences: prefs } = useReadingPreferences();
  const theme = READING_THEME_PALETTES[prefs.tema];
  const maxWidth = prefs.margenLectura === "amplio" ? "38rem" : prefs.margenLectura === "normal" ? "48rem" : "56rem";

  const themeClass = prefs.tema === "claro"
    ? "study-theme-light border-[#D4AF37]/25 bg-[#F8F5EA] text-[#24211a]"
    : prefs.tema === "sepia"
      ? "study-theme-ink biblia-eink-paper border-[#5f5b4d]/30 text-[#20211d]"
      : "study-theme-dark border-[#D4AF37]/20 bg-[#111111] text-[#F8F5EA]";

  const readingStyle = {
    width: "100%",
    maxWidth,
    "--study-reader-font-size": `${prefs.tam}px`,
    "--study-reader-line-height": prefs.interlineado,
    "--study-reader-text-align": prefs.alineacion === "justificada" ? "justify" : "left",
    "--study-reader-accent": theme.accent,
    "--study-reader-text": theme.text,
    "--study-reader-muted": theme.muted,
    "--study-reader-surface": theme.surface,
    "--study-reader-border": theme.border,
    fontFamily: READING_FONT_FAMILIES[prefs.fuente],
    fontSize: prefs.tam,
    lineHeight: prefs.interlineado,
    fontWeight: prefs.pesoFuente,
    textAlign: prefs.alineacion === "justificada" ? "justify" : "left",
  } as CSSProperties;

  return (
    <section className="mb-4">
      <div className="sticky top-2 z-30 mb-3 flex justify-end">
        <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-label="Formato de lectura" className="min-h-11 min-w-11 font-display text-2xl text-[#D4AF37]">Aa</button>
      </div>
      <ReadingSettingsSheet open={open} onClose={() => setOpen(false)} eyebrow="Biblia · Estudio" />
      <StudyReadingThemeContext.Provider value={prefs.tema}>
        <article data-reading-margin={prefs.margenLectura} style={readingStyle} className={"study-reading-page mx-auto rounded-[1.5rem] border p-[clamp(1rem,5vw,1.5rem)] transition-all " + themeClass}>
          {children}
        </article>
      </StudyReadingThemeContext.Provider>
    </section>
  );
}
