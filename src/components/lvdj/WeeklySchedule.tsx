import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Moon,
  Play,
  Sun,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Programa } from "./ProgramHeroCard";

export interface DaySchedule {
  dia: string;
  programas: Programa[];
}

const dayTabs = ["Hoy", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const categoryIcons: Record<string, typeof CalendarDays> = {
  devocion: CalendarDays,
  liturgia: Trophy,
  formacion: BookOpen,
  musica: Play,
  oracion: Sun,
  descanso: Moon,
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

interface WeeklyScheduleProps {
  schedule: DaySchedule[];
  showFullWeek: boolean;
  onToggleFullWeek: () => void;
  onProgramAction: (program: Programa) => void;
}

export const WeeklySchedule = ({
  schedule,
  showFullWeek,
  onToggleFullWeek,
  onProgramAction,
}: WeeklyScheduleProps) => {
  const [selectedDay, setSelectedDay] = useState("Hoy");

  const selectedSchedule = useMemo(
    () =>
      schedule.find((day) => day.dia === selectedDay) ??
      schedule[0] ?? { dia: "Hoy", programas: [] },
    [schedule, selectedDay],
  );

  const visibleSchedules = showFullWeek ? schedule : [selectedSchedule];
  const displayedSchedules = showFullWeek
    ? visibleSchedules
    : visibleSchedules.map((day) => ({ ...day, programas: day.programas.slice(0, 6) }));

  return (
    <section className="glass h-full w-full max-w-full overflow-hidden rounded-2xl gold-border p-3 shadow-deep sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4 px-1 sm:px-0">
        <div>
          <div className="flex items-center gap-2 text-base font-extrabold uppercase text-gold sm:text-lg">
            <CalendarDays className="h-5 w-5" />
            Programacion semanal
          </div>
          <p className="mt-1 text-sm text-foreground/70">
            Selecciona un dia para ver su programacion
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleFullWeek}
          className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-gold hover:text-gold-bright sm:gap-2 sm:text-xs"
        >
          {showFullWeek ? "Ver dia activo" : "Ver semana completa"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 sm:px-0">
        {dayTabs.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={cn(
              "h-10 min-w-14 rounded-xl border px-3 text-sm font-semibold transition sm:h-11 sm:min-w-16 sm:px-4",
              selectedDay === day
                ? "border-gold bg-gradient-gold text-navy-deep shadow-gold"
                : "border-gold/20 bg-navy-deep/70 text-foreground hover:border-gold/50",
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {displayedSchedules.map((daySchedule) => (
          <div
            key={daySchedule.dia}
            className="w-full max-w-full overflow-hidden rounded-2xl border border-gold/15 bg-black/10"
          >
            {showFullWeek && (
              <div className="border-b border-gold/10 bg-gold/10 px-3 py-2 text-xs font-extrabold uppercase tracking-wide text-gold">
                {daySchedule.dia}
              </div>
            )}
            {daySchedule.programas.map((program) => {
              const Icon =
                categoryIcons[normalize(program.categoria)] ?? CalendarDays;

              return (
                <article
                  key={`${daySchedule.dia}-${program.id}`}
                  className="grid min-h-[56px] w-full grid-cols-[68px_24px_minmax(0,1fr)_32px] items-center gap-2 border-b border-gold/10 px-2 py-2.5 last:border-b-0 sm:grid-cols-[94px_36px_minmax(0,1fr)_40px] sm:px-3 sm:gap-3"
                >
                  <div className="text-xs font-extrabold text-gold sm:text-sm">
                    {program.horaInicio}
                  </div>
                  <Icon className="h-5 w-5 text-gold sm:h-6 sm:w-6" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {program.nombre}
                      </h3>
                      {program.enVivo && (
                        <span className="rounded-md border border-gold/50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-gold">
                          En vivo
                        </span>
                      )}
                    </div>
                    <p className="mt-1 hidden truncate text-xs text-foreground/60 sm:block">
                      {program.descripcion}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onProgramAction(program)}
                    className="flex h-8 w-8 items-center justify-center rounded-full gold-border text-gold transition hover:bg-gold/10 sm:h-9 sm:w-9"
                    aria-label={`Abrir ${program.nombre}`}
                  >
                    {program.enVivo ? (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </article>
              );
            })}
            {!daySchedule.programas.length && (
              <div className="px-3 py-6 text-sm text-foreground/60">
                No hay programas para este dia.
                </div>
            )}
          </div>
        ))}
      </div>

      {!showFullWeek && selectedSchedule.programas.length > 6 && (
        <button
          type="button"
          onClick={onToggleFullWeek}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold/70 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-gold transition hover:bg-gold/10"
        >
          Ver programación completa
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
};
