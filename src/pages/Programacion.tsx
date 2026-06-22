/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
PAGINA: Programacion.tsx
VERSION: 1.0.0

DESCRIPCION:
Vista completa de la programacion semanal de la emisora.
==============================================================================
*/

import { ArrowLeft, CalendarDays, Clock, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ProgramacionRadio,
  getPublishedProgramacion,
} from "@/services/sheetsService";
import {
  formatTime,
  getNextProgram,
  isProgramLive,
  parseTimeToMinutes,
} from "@/utils/programacion";

const days = [
  { label: "Lunes", value: 1 },
  { label: "Martes", value: 2 },
  { label: "Miercoles", value: 3 },
  { label: "Jueves", value: 4 },
  { label: "Viernes", value: 5 },
  { label: "Sabado", value: 6 },
  { label: "Domingo", value: 0 },
];

const fallbackSchedule: ProgramacionRadio[] = [
  {
    id: "santo-rosario",
    dia_semana: "diario",
    hora_inicio: "06:00",
    hora_fin: "07:00",
    programa: "Santo Rosario",
    descripcion: "",
    imagen_url: "",
    estado: "publicado",
  },
  {
    id: "santa-misa",
    dia_semana: "diario",
    hora_inicio: "10:00",
    hora_fin: "11:00",
    programa: "Santa Misa",
    descripcion: "",
    imagen_url: "",
    estado: "publicado",
  },
  {
    id: "adoracion",
    dia_semana: "diario",
    hora_inicio: "19:00",
    hora_fin: "20:00",
    programa: "Adoracion Eucaristica",
    descripcion: "",
    imagen_url: "",
    estado: "publicado",
  },
];

const normalizeDay = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");

const programAppliesToDay = (program: ProgramacionRadio, day: number) => {
  const normalized = normalizeDay(program.dia_semana);

  if (!normalized || normalized === "diario" || normalized.includes("todos")) {
    return true;
  }
  if (normalized.includes("lunes_a_viernes")) return day >= 1 && day <= 5;
  if (normalized.includes("fin_de_semana")) return day === 0 || day === 6;

  const aliases: Record<string, number> = {
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
  };

  return normalized
    .split(/[,;/|]+/)
    .flatMap((part) => part.split(/_y_|_e_|_a_/))
    .some((part) => aliases[part] === day);
};

const getScheduleTimes = (programacion: ProgramacionRadio[]) =>
  Array.from(
    new Set(
      programacion
        .map((program) => program.hora_inicio)
        .filter(Boolean)
        .sort((a, b) => {
          const first = parseTimeToMinutes(a) ?? 0;
          const second = parseTimeToMinutes(b) ?? 0;
          return first - second;
        }),
    ),
  );

const Programacion = () => {
  const navigate = useNavigate();
  const [programacion, setProgramacion] = useState<ProgramacionRadio[]>([]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let mounted = true;

    getPublishedProgramacion()
      .then((data) => {
        if (mounted) setProgramacion(data);
      })
      .catch(() => {
        if (mounted) setProgramacion([]);
      });

    const timer = window.setInterval(() => setNow(new Date()), 60_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const schedule = programacion.length ? programacion : fallbackSchedule;
  const nextProgram = useMemo(() => getNextProgram(schedule, now), [now, schedule]);
  const liveProgram = useMemo(
    () => schedule.find((program) => isProgramLive(program, now)) ?? null,
    [now, schedule],
  );
  const times = useMemo(() => getScheduleTimes(schedule), [schedule]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-gold/20 bg-navy-deep/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white shadow-lg transition hover:bg-navy-light"
            aria-label="Regresar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-[0.22em] text-gold">
              <CalendarDays className="h-4 w-4" />
              Programacion
            </div>
            <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">
              Radio La Voz de Jesus
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-2xl gold-border bg-navy-deep/60 p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <Radio className="h-4 w-4" />
              En Vivo
            </div>
            <h2 className="font-display text-3xl">
              {liveProgram?.programa ?? "La Voz de Jesus"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {liveProgram
                ? `${formatTime(liveProgram.hora_inicio)} - ${formatTime(liveProgram.hora_fin)}`
                : "Senal en vivo 24/7"}
            </p>
          </article>

          <article className="rounded-2xl gold-border bg-navy-deep/60 p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <Clock className="h-4 w-4" />
              Proximo Programa
            </div>
            <h2 className="font-display text-3xl">
              {nextProgram?.programa ?? "Santa Misa"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {nextProgram ? formatTime(nextProgram.hora_inicio) : "10:00 AM"}
            </p>
          </article>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl gold-border bg-card">
          <div className="border-b border-gold/20 bg-gradient-to-r from-gold to-gold-dark px-4 py-4 text-navy-deep">
            <h2 className="text-sm font-black uppercase tracking-[0.24em]">
              Parrilla semanal
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-navy-deep text-gold">
                  <th className="sticky left-0 z-10 w-28 bg-navy-deep px-4 py-4 uppercase tracking-wider">
                    Hora
                  </th>
                  {days.map((day) => (
                    <th
                      key={day.value}
                      className="min-w-[125px] px-4 py-4 uppercase tracking-wider"
                    >
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map((time) => (
                  <tr key={time} className="border-t border-border/80">
                    <td className="sticky left-0 z-10 bg-card px-4 py-4 font-semibold text-gold">
                      {formatTime(time)}
                    </td>
                    {days.map((day) => {
                      const program = schedule.find(
                        (item) =>
                          item.hora_inicio === time &&
                          programAppliesToDay(item, day.value),
                      );
                      const live = program ? isProgramLive(program, now) : false;

                      return (
                        <td
                          key={`${time}-${day.value}`}
                          className={`border-l border-border/70 px-4 py-4 align-top ${
                            live ? "bg-gold/10" : ""
                          }`}
                        >
                          {program ? (
                            <div>
                              <div className="font-bold text-foreground">
                                {program.programa}
                              </div>
                              {program.descripcion && (
                                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                                  {program.descripcion}
                                </p>
                              )}
                              {live && (
                                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                  En vivo
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/45">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full gold-border px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold hover:bg-gold/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Programacion;
