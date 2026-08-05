import type { MysteryGroupId, RosaryToday, RosaryTodayDto } from "../types";
import {
  formatLongDate,
  localISODate,
  localTimezone,
  mysteriesForDate,
  weekdayName,
  weeklyReasonLabel,
} from "../utils/mysteryOfDay";
import { apiRequest } from "./http";

const CACHE_KEY = "lvj.rosary.today.v1";

const localFallback = (date = new Date()): RosaryToday => ({
  date: localISODate(date),
  weekday: weekdayName(date),
  season: null,
  celebration: null,
  recommendedGroup: mysteriesForDate(date),
  reasonLabel: weeklyReasonLabel(date),
  offlineFallback: true,
});

const readCache = (date: string): RosaryToday | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RosaryToday;
    return parsed.date === date ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Resuelve los misterios del día. Intenta la API litúrgica y degrada a la
 * regla semanal local. Nunca lanza: la UI siempre puede rezar.
 */
export const rosaryTodayService = {
  fallbackForDate: localFallback,
  groupForDate: (date = new Date()): MysteryGroupId => mysteriesForDate(date),
  longDate: formatLongDate,

  async load(signal?: AbortSignal): Promise<RosaryToday> {
    const now = new Date();
    const date = localISODate(now);
    const cached = readCache(date);
    if (cached) return cached;

    try {
      const dto = await apiRequest<RosaryTodayDto>(
        `/rosario/hoy.php?fecha=${date}&tz=${encodeURIComponent(localTimezone())}`,
        { signal, timeoutMs: 6000 },
      );
      if (!dto?.ok || !dto.misterios_recomendados) return localFallback(now);
      const result: RosaryToday = {
        date: dto.fecha || date,
        weekday: dto.dia_semana || weekdayName(now),
        season: dto.tiempo_liturgico ?? null,
        celebration: dto.celebracion ?? null,
        recommendedGroup: dto.misterios_recomendados,
        reasonLabel:
          dto.motivo === "celebracion" && dto.celebracion
            ? `Por la celebración: ${dto.celebracion}`
            : weeklyReasonLabel(now),
        offlineFallback: false,
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      } catch {
        /* cuota no disponible: sin caché */
      }
      return result;
    } catch {
      return localFallback(now);
    }
  },
};