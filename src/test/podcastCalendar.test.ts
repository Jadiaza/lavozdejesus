import { describe, expect, it } from "vitest";
import {
  bogotaCalendarDay,
  calendarDistance,
  rssCalendarDay,
  sameCalendarDay,
} from "@/modules/podcast/utils/podcastCalendar";

describe("calendario diario de podcasts", () => {
  it("mantiene el día de Colombia antes de medianoche", () => {
    expect(bogotaCalendarDay(new Date("2026-09-18T04:44:00Z"))).toEqual({ month: 9, day: 17 });
  });

  it("cambia de día exactamente a medianoche en Colombia", () => {
    expect(bogotaCalendarDay(new Date("2026-09-18T05:00:00Z"))).toEqual({ month: 9, day: 18 });
  });

  it("preserva la fecha escrita en el RSS aunque use otra zona horaria", () => {
    expect(rssCalendarDay("Mon, 18 Sep 2023 00:00:00 -0400")).toEqual({ month: 9, day: 18 });
  });

  it("elige el día 260 y no el 261 mientras Colombia sigue en 17 de septiembre", () => {
    const today = bogotaCalendarDay(new Date("2026-09-18T04:44:00Z"));
    const day260 = rssCalendarDay("Sun, 17 Sep 2023 00:00:00 -0400");
    const day261 = rssCalendarDay("Mon, 18 Sep 2023 00:00:00 -0400");

    expect(day260 && sameCalendarDay(day260, today)).toBe(true);
    expect(day260 && calendarDistance(day260, today)).toBe(0);
    expect(day261 && calendarDistance(day261, today)).toBe(1);
  });
});
