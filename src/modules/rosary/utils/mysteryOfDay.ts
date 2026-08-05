import type { MysteryGroupId } from "../types";

/** Distribución semanal tradicional (0 = domingo). */
const WEEKLY: MysteryGroupId[] = [
  "gloriosos", // domingo
  "gozosos", // lunes
  "dolorosos", // martes
  "gloriosos", // miércoles
  "luminosos", // jueves
  "dolorosos", // viernes
  "gozosos", // sábado
];

export const WEEKDAY_NAMES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

/** Fecha local (no UTC) en formato YYYY-MM-DD. */
export const localISODate = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
};

export const localTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/** Misterios correspondientes al día local del usuario. */
export const mysteriesForDate = (date: Date = new Date()): MysteryGroupId =>
  WEEKLY[date.getDay()];

export const weekdayName = (date: Date = new Date()): string =>
  WEEKDAY_NAMES[date.getDay()];

export const weeklyReasonLabel = (date: Date = new Date()): string =>
  `Correspondientes a este ${weekdayName(date)}`;

export const formatLongDate = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat("es", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(date);
  } catch {
    return `${weekdayName(date)}, ${date.getDate()}`;
  }
};