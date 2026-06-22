import { ProgramacionRadio } from "@/services/sheetsService";

const dayAliases: Record<string, number | "daily"> = {
  domingo: 0,
  dom: 0,
  lunes: 1,
  lun: 1,
  martes: 2,
  mar: 2,
  miercoles: 3,
  mie: 3,
  mi: 3,
  jueves: 4,
  jue: 4,
  viernes: 5,
  vie: 5,
  sabado: 6,
  sab: 6,
  diario: "daily",
  todos: "daily",
  todos_los_dias: "daily",
};

const normalizeDay = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

export const getProgramDays = (value: string): Array<number | "daily"> => {
  const normalized = normalizeDay(value);

  if (!normalized || normalized === "diario") return ["daily"];
  if (
    normalized.includes("lunes_a_viernes") ||
    normalized.includes("lun_a_vie")
  ) {
    return [1, 2, 3, 4, 5];
  }
  if (
    normalized.includes("sabado_y_domingo") ||
    normalized.includes("fin_de_semana")
  ) {
    return [6, 0];
  }

  const parts = normalized
    .split(/[,;/|]+/)
    .flatMap((part) => part.split(/_y_|_e_|_a_/))
    .map((part) => part.trim())
    .filter(Boolean);

  const days = parts
    .map((part) => dayAliases[part])
    .filter((day): day is number | "daily" => day !== undefined);

  return days.length ? days : ["daily"];
};

export const parseTimeToMinutes = (value: string) => {
  const raw = value.trim().toLowerCase();
  const decimalTime = raw.match(/^0?\.\d+$/);

  if (decimalTime) {
    return Math.round(Number(raw) * 24 * 60);
  }

  const match = raw.match(
    /^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(a\.?\s*m\.?|p\.?\s*m\.?|am|pm)?$/i,
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const period = match[3]?.replace(/\s|\./g, "");

  if (period === "pm" && hours < 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
};

export const formatTime = (value: string) => {
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return value;

  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
};

export const isSameProgramDay = (program: ProgramacionRadio, day: number) => {
  const days = getProgramDays(program.dia_semana);
  return days.includes("daily") || days.includes(day);
};

export const isProgramLive = (
  program: ProgramacionRadio,
  now = new Date(),
) => {
  const start = parseTimeToMinutes(program.hora_inicio);
  const end = parseTimeToMinutes(program.hora_fin);
  if (start === null || end === null) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = now.getDay();
  const yesterday = (today + 6) % 7;

  if (start <= end) {
    return (
      isSameProgramDay(program, today) &&
      currentMinutes >= start &&
      currentMinutes < end
    );
  }

  return (
    (isSameProgramDay(program, today) && currentMinutes >= start) ||
    (isSameProgramDay(program, yesterday) && currentMinutes < end)
  );
};

export const getTodayPrograms = (
  programacion: ProgramacionRadio[],
  now = new Date(),
) =>
  programacion
    .filter((program) => isSameProgramDay(program, now.getDay()))
    .sort((a, b) => {
      const first = parseTimeToMinutes(a.hora_inicio) ?? 0;
      const second = parseTimeToMinutes(b.hora_inicio) ?? 0;
      return first - second;
    });

export const getNextProgram = (
  programacion: ProgramacionRadio[],
  now = new Date(),
) => {
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const candidates = programacion.flatMap((program) => {
    const startMinutes = parseTimeToMinutes(program.hora_inicio);
    if (startMinutes === null) return [];

    const programDays = getProgramDays(program.dia_semana);
    const daysToCheck = programDays.includes("daily")
      ? [0, 1, 2, 3, 4, 5, 6]
      : programDays.filter((day): day is number => day !== "daily");

    return daysToCheck.map((day) => {
      const dayOffset = (day - currentDay + 7) % 7;
      const minutesUntil = dayOffset * 24 * 60 + startMinutes - currentMinutes;

      return {
        program,
        minutesUntil:
          minutesUntil > 0 ? minutesUntil : minutesUntil + 7 * 24 * 60,
      };
    });
  });

  return (
    candidates.sort((a, b) => a.minutesUntil - b.minutesUntil)[0]?.program ??
    null
  );
};
