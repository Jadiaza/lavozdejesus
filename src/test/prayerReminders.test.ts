import { beforeEach, describe, expect, it } from "vitest";
import {
  bogotaDateAndTime,
  pendingPrayerReminders,
  readPrayerReminders,
  savePrayerReminders,
} from "@/modules/prayers/services/prayerReminderService";

describe("recordatorios de oración", () => {
  beforeEach(() => localStorage.clear());

  it("inicia todos los recordatorios desactivados", () => {
    const reminders = readPrayerReminders();
    expect(reminders).toHaveLength(9);
    expect(reminders.every((reminder) => !reminder.enabled)).toBe(true);
  });

  it("incluye las siete horas de la Liturgia de las Horas", () => {
    const liturgyIds = ["oficio", "laudes", "tercia", "sexta", "nona", "visperas", "completas"];
    expect(readPrayerReminders().filter(({ id }) => liturgyIds.includes(id)).map(({ id }) => id)).toEqual(liturgyIds);
  });

  it("usa siempre el horario de Colombia", () => {
    expect(bogotaDateAndTime(new Date("2026-09-17T11:00:00Z"))).toEqual({
      date: "2026-09-17",
      time: "06:00",
    });
  });

  it("activa Laudes a las seis de la mañana", () => {
    const reminders = readPrayerReminders().map((reminder) => ({
      ...reminder,
      enabled: reminder.id === "laudes",
    }));
    savePrayerReminders(reminders);

    expect(pendingPrayerReminders(new Date("2026-09-17T11:00:15Z")).map(({ id }) => id)).toEqual(["laudes"]);
    expect(pendingPrayerReminders(new Date("2026-09-17T10:59:59Z"))).toEqual([]);
  });
});
