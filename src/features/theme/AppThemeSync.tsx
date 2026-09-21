import { useEffect } from "react";
import { getConfiguracion } from "@/services/sheetsService";

type ThemeConfig = Record<string, string>;

const HEX = /^#[0-9a-f]{6}$/i;

function normalizeHex(value: string | undefined, fallback: string) {
  const clean = value?.trim() ?? "";
  return HEX.test(clean) ? clean.toUpperCase() : fallback;
}

function hexToHslTriplet(hex: string) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function readableForeground(hex: string) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#111111" : "#FFFFFF";
}

function fontFamily(value: string | undefined, kind: "title" | "text") {
  const clean = (value ?? "").trim().toLowerCase();
  if (clean === "serif") return "'Cormorant Garamond', Georgia, serif";
  if (clean === "sans-serif" || clean === "sans") return "'Montserrat', Arial, sans-serif";
  if (clean) return value!;
  return kind === "title"
    ? "'Cormorant Garamond', Georgia, serif"
    : "'Montserrat', Arial, sans-serif";
}

export function applyAppTheme(config: ThemeConfig) {
  const root = document.documentElement;

  const primary = normalizeHex(config.color_primario, "#123C69");
  const secondary = normalizeHex(config.color_secundario, "#0B1F33");
  const accent = normalizeHex(config.color_acento, "#D4AF37");
  const text = normalizeHex(config.color_texto, "#FFFFFF");
  const background = normalizeHex(config.color_fondo, "#061826");
  const card = normalizeHex(config.color_card, "#102B45");
  const border = normalizeHex(config.color_borde, "#D4AF37");
  const accentForeground = readableForeground(accent);

  const hslVars: Record<string, string> = {
    "--background": hexToHslTriplet(background),
    "--foreground": hexToHslTriplet(text),
    "--card": hexToHslTriplet(card),
    "--card-foreground": hexToHslTriplet(text),
    "--popover": hexToHslTriplet(card),
    "--popover-foreground": hexToHslTriplet(text),
    "--primary": hexToHslTriplet(primary),
    "--primary-foreground": hexToHslTriplet(readableForeground(primary)),
    "--secondary": hexToHslTriplet(secondary),
    "--secondary-foreground": hexToHslTriplet(text),
    "--accent": hexToHslTriplet(accent),
    "--accent-foreground": hexToHslTriplet(accentForeground),
    "--muted": hexToHslTriplet(secondary),
    "--muted-foreground": hexToHslTriplet(text),
    "--border": hexToHslTriplet(border),
    "--input": hexToHslTriplet(secondary),
    "--ring": hexToHslTriplet(accent),
    "--gold": hexToHslTriplet(accent),
    "--gold-bright": hexToHslTriplet(accent),
    "--gold-deep": hexToHslTriplet(primary),
    "--navy": hexToHslTriplet(secondary),
    "--navy-deep": hexToHslTriplet(background),
  };

  Object.entries(hslVars).forEach(([name, value]) => root.style.setProperty(name, value));

  const rawVars: Record<string, string> = {
    "--lvj-black": background,
    "--lvj-surface": card,
    "--lvj-surface-raised": secondary,
    "--lvj-gold": accent,
    "--lvj-gold-bright": accent,
    "--lvj-gold-deep": primary,
    "--lvj-ivory": text,
    "--lvj-ivory-muted": text,
    "--lvj-sacred-border": border,
    "--lvj-theme-primary": primary,
    "--lvj-theme-secondary": secondary,
    "--lvj-theme-accent": accent,
    "--lvj-theme-text": text,
    "--lvj-theme-background": background,
    "--lvj-theme-card": card,
    "--lvj-theme-border": border,
    "--lvj-font-title": fontFamily(config.tipografia_titulos, "title"),
    "--lvj-font-text": fontFamily(config.tipografia_texto, "text"),
    "--gradient-gold": `linear-gradient(135deg, ${accent}, ${primary})`,
    "--gradient-navy": `linear-gradient(180deg, ${secondary}, ${background})`,
    "--gradient-hero": `linear-gradient(180deg, ${secondary}99 0%, ${background}E6 72%, ${background} 100%)`,
    "--glass": `${card}CC`,
    "--glass-border": border,
  };

  Object.entries(rawVars).forEach(([name, value]) => root.style.setProperty(name, value));

  root.dataset.lvjTheme = config.nombre_tema?.trim() || "Tema LVJ";
  root.dataset.lvjThemeMode = config.modo?.trim() || "oscuro";
}

async function refreshTheme() {
  const config = await getConfiguracion();
  if (config.color_fondo || config.color_primario || config.color_acento) {
    applyAppTheme(config);
  }
}

export default function AppThemeSync() {
  useEffect(() => {
    void refreshTheme();

    const onFocus = () => void refreshTheme();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshTheme();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => void refreshTheme(), 5 * 60 * 1000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
