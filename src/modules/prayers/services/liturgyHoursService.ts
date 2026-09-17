import type { LiturgyHourResponse } from "../types/liturgyHours";

const bogotaDate = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
};

export const liturgyHoursService = {
  today: bogotaDate,
  async getHour(hour: string, date = bogotaDate(), signal?: AbortSignal): Promise<LiturgyHourResponse> {
    const response = await fetch(`/api/liturgia-horas?fecha=${encodeURIComponent(date)}&hora=${encodeURIComponent(hour)}`, { signal });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.ok) throw new Error(body?.error ?? "No fue posible cargar esta hora litúrgica");
    return body as LiturgyHourResponse;
  },
};
