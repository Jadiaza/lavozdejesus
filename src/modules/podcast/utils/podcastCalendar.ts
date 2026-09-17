export type CalendarDay = {
  month: number;
  day: number;
};

const BOGOTA_TIME_ZONE = "America/Bogota";
const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export const bogotaCalendarDay = (date: Date = new Date()): CalendarDay => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BOGOTA_TIME_ZONE,
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);

  return {
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
};

/**
 * RSS pubDate describes the publisher's calendar date. Preserve its written
 * month/day instead of converting the timestamp to the user's time zone.
 */
export const rssCalendarDay = (value: string): CalendarDay | null => {
  const iso = value.match(/^\s*\d{4}-(\d{2})-(\d{2})/);
  if (iso) return { month: Number(iso[1]), day: Number(iso[2]) };

  const rfc2822 = value.match(/(?:^|,\s*)(\d{1,2})\s+([A-Za-z]{3})\s+\d{4}/);
  if (rfc2822) {
    const month = MONTHS[rfc2822[2].toLowerCase()];
    if (month) return { month, day: Number(rfc2822[1]) };
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  return bogotaCalendarDay(new Date(timestamp));
};

const calendarDayIndex = ({ month, day }: CalendarDay) => {
  const start = Date.UTC(2000, 0, 1);
  const current = Date.UTC(2000, month - 1, day);
  return Math.floor((current - start) / 86400000);
};

export const calendarDistance = (date: CalendarDay, reference: CalendarDay) => {
  const yearLength = 366;
  const direct = Math.abs(calendarDayIndex(date) - calendarDayIndex(reference));
  return Math.min(direct, yearLength - direct);
};

export const sameCalendarDay = (date: CalendarDay, reference: CalendarDay) =>
  date.month === reference.month && date.day === reference.day;

export const formatCalendarDay = (date: CalendarDay) =>
  new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
  }).format(new Date(Date.UTC(2000, date.month - 1, date.day)));
