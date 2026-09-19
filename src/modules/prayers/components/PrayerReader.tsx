import type { CSSProperties, ReactNode } from "react";
import type { PrayerPreferences } from "../hooks/usePrayerPreferences";

const themes = {
  dark: { background: "#0c151d", color: "#f6f0e6", accent: "#efbd52" },
  light: { background: "#fffdf7", color: "#1f2933", accent: "#8a6112" },
  sepia: { background: "#f2e6cc", color: "#3f3124", accent: "#7c5416" },
  contrast: { background: "#000000", color: "#ffffff", accent: "#ffd54f" },
};

const fonts = {
  literata: '"Literata", Georgia, serif',
  serif: "Georgia, 'Times New Roman', serif",
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
};

export function PrayerReader({ preferences, children, integrated = false }: { preferences: PrayerPreferences; children: ReactNode; integrated?: boolean }) {
  const theme = themes[preferences.theme];
  const style = {
    "--prayer-accent": theme.accent,
    background: integrated ? "transparent" : theme.background,
    color: theme.color,
    fontFamily: fonts[preferences.font],
    fontSize: `${preferences.fontSize}px`,
    lineHeight: preferences.lineHeight,
    textAlign: preferences.alignment,
    maxWidth: preferences.focusedWidth ? "38rem" : "none",
  } as CSSProperties;

  return <article style={style} className={`mx-auto transition-colors ${integrated ? "w-full px-1 py-0" : "rounded-2xl border border-white/10 p-5 shadow-xl"}`}>{children}</article>;
}
