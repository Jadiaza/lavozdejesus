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
  const textMuted = normalizeHex(config.color_texto_secundario, text);
  const background = normalizeHex(config.color_fondo, "#061826");
  const card = normalizeHex(config.color_card, "#102B45");
  const surface = normalizeHex(config.color_surface, secondary);
  const border = normalizeHex(config.color_borde, "#D4AF37");

  const icon = normalizeHex(config.color_icono, accent);
  const iconActive = normalizeHex(config.color_icono_activo, icon);
  const iconInactive = normalizeHex(config.color_icono_inactivo, textMuted);

  const buttonPrimaryBg = normalizeHex(config.color_boton_primario_fondo, accent);
  const buttonPrimaryText = normalizeHex(config.color_boton_primario_texto, readableForeground(buttonPrimaryBg));
  const buttonPrimaryBorder = normalizeHex(config.color_boton_primario_borde, buttonPrimaryBg);
  const buttonSecondaryBg = normalizeHex(config.color_boton_secundario_fondo, card);
  const buttonSecondaryText = normalizeHex(config.color_boton_secundario_texto, text);
  const buttonSecondaryBorder = normalizeHex(config.color_boton_secundario_borde, border);

  const navBg = normalizeHex(config.color_nav_fondo, background);
  const navBorder = normalizeHex(config.color_nav_borde, border);
  const navIconActive = normalizeHex(config.color_nav_icono_activo, iconActive);
  const navIconInactive = normalizeHex(config.color_nav_icono_inactivo, iconInactive);
  const navTextActive = normalizeHex(config.color_nav_texto_activo, navIconActive);
  const navTextInactive = normalizeHex(config.color_nav_texto_inactivo, textMuted);
  const navIndicator = normalizeHex(config.color_nav_indicador, navIconActive);

  const cardText = normalizeHex(config.color_card_texto, text);
  const cardIcon = normalizeHex(config.color_card_icono, icon);
  const overlay = normalizeHex(config.color_overlay, background);
  const inputBg = normalizeHex(config.color_input_fondo, surface);
  const inputBorder = normalizeHex(config.color_input_borde, border);
  const progressBg = normalizeHex(config.color_progress_fondo, surface);
  const progressFill = normalizeHex(config.color_progress_relleno, accent);
  const success = normalizeHex(config.color_exito, "#2E7D32");
  const warning = normalizeHex(config.color_advertencia, "#D69E2E");
  const error = normalizeHex(config.color_error, "#C53030");
  const info = normalizeHex(config.color_info, primary);

  const opacityRaw = Number(config.overlay_opacidad);
  const overlayOpacity = Number.isFinite(opacityRaw)
    ? Math.max(0, Math.min(1, opacityRaw))
    : 0.36;

  const hslVars: Record<string, string> = {
    "--background": hexToHslTriplet(background),
    "--foreground": hexToHslTriplet(text),
    "--card": hexToHslTriplet(card),
    "--card-foreground": hexToHslTriplet(cardText),
    "--popover": hexToHslTriplet(card),
    "--popover-foreground": hexToHslTriplet(cardText),
    "--primary": hexToHslTriplet(primary),
    "--primary-foreground": hexToHslTriplet(readableForeground(primary)),
    "--secondary": hexToHslTriplet(secondary),
    "--secondary-foreground": hexToHslTriplet(text),
    "--accent": hexToHslTriplet(accent),
    "--accent-foreground": hexToHslTriplet(readableForeground(accent)),
    "--muted": hexToHslTriplet(surface),
    "--muted-foreground": hexToHslTriplet(textMuted),
    "--border": hexToHslTriplet(border),
    "--input": hexToHslTriplet(inputBg),
    "--ring": hexToHslTriplet(accent),
    "--destructive": hexToHslTriplet(error),
    "--gold": hexToHslTriplet(icon),
    "--gold-bright": hexToHslTriplet(iconActive),
    "--gold-deep": hexToHslTriplet(primary),
    "--navy": hexToHslTriplet(surface),
    "--navy-deep": hexToHslTriplet(background),
  };

  Object.entries(hslVars).forEach(([name, value]) => root.style.setProperty(name, value));

  const rawVars: Record<string, string> = {
    "--lvj-black": background,
    "--lvj-surface": card,
    "--lvj-surface-raised": surface,
    "--lvj-gold": icon,
    "--lvj-gold-bright": iconActive,
    "--lvj-gold-deep": primary,
    "--lvj-ivory": text,
    "--lvj-ivory-muted": textMuted,
    "--lvj-sacred-border": border,

    "--lvj-theme-primary": primary,
    "--lvj-theme-secondary": secondary,
    "--lvj-theme-accent": accent,
    "--lvj-theme-text": text,
    "--lvj-theme-text-muted": textMuted,
    "--lvj-theme-background": background,
    "--lvj-theme-card": card,
    "--lvj-theme-surface": surface,
    "--lvj-theme-border": border,

    "--lvj-icon": icon,
    "--lvj-icon-active": iconActive,
    "--lvj-icon-inactive": iconInactive,
    "--lvj-card-text": cardText,
    "--lvj-card-icon": cardIcon,

    "--lvj-button-primary-bg": buttonPrimaryBg,
    "--lvj-button-primary-text": buttonPrimaryText,
    "--lvj-button-primary-border": buttonPrimaryBorder,
    "--lvj-button-secondary-bg": buttonSecondaryBg,
    "--lvj-button-secondary-text": buttonSecondaryText,
    "--lvj-button-secondary-border": buttonSecondaryBorder,

    "--lvj-nav-bg": navBg,
    "--lvj-nav-border": navBorder,
    "--lvj-nav-icon-active": navIconActive,
    "--lvj-nav-icon-inactive": navIconInactive,
    "--lvj-nav-text-active": navTextActive,
    "--lvj-nav-text-inactive": navTextInactive,
    "--lvj-nav-indicator": navIndicator,

    "--lvj-overlay": overlay,
    "--lvj-overlay-opacity": String(overlayOpacity),
    "--lvj-input-bg": inputBg,
    "--lvj-input-border": inputBorder,
    "--lvj-progress-bg": progressBg,
    "--lvj-progress-fill": progressFill,
    "--lvj-success": success,
    "--lvj-warning": warning,
    "--lvj-error": error,
    "--lvj-info": info,

    "--lvj-font-title": fontFamily(config.tipografia_titulos, "title"),
    "--lvj-font-text": fontFamily(config.tipografia_texto, "text"),

    "--gradient-gold": `linear-gradient(135deg, ${buttonPrimaryBg}, ${buttonPrimaryBg})`,
    "--gradient-navy": `linear-gradient(180deg, ${surface}, ${background})`,
    "--gradient-hero": `linear-gradient(180deg, ${overlay}66 0%, ${background}D9 72%, ${background} 100%)`,
    "--glass": `${card}E6`,
    "--glass-border": navBorder,
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
