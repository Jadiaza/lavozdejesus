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

  const visibleSchedules = [selectedSchedule];
  const displayedSchedules = showFullWeek
    ? visibleSchedules
    : visibleSchedules.map((day) => {
        if (day.dia !== "Hoy") {
          return { ...day, programas: day.programas.slice(0, 6) };
        }

        const liveIndex = day.programas.findIndex((program) => program.enVivo);
        const startIndex = liveIndex >= 0 ? liveIndex : 0;

        return {
          ...day,
          programas: day.programas.slice(startIndex, startIndex + 6),
        };
      });

  return (
    <section className="w-full max-w-full overflow-hidden bg-transparent py-2 sm:py-3">
      <div className="mb-3 flex items-start justify-between gap-3 px-1 sm:px-0">
        <div>
          <div className="flex items-center gap-2 text-lg font-extrabold uppercase leading-tight text-gold sm:text-xl">
            <CalendarDays className="h-5 w-5" />
            Semana
          </div>
          <p className="mt-1 text-sm text-foreground/70">
            Selecciona un día para ver su programación
          </p>
        </div>


      </div>

      <div className="mb-3 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 sm:px-0">
        {dayTabs.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={cn(
              "h-11 min-w-[62px] rounded-xl border px-3 text-sm font-bold transition sm:min-w-16 sm:px-4",
              selectedDay === day
                ? "border-gold bg-gradient-gold text-navy-deep shadow-gold"
                : "border-gold/20 bg-navy-deep/70 text-foreground hover:border-gold/50",
            )}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {displayedSchedules.map((daySchedule) => (
          <div
            key={daySchedule.dia}
            className="w-full max-w-full overflow-hidden border-y border-gold/15 bg-black/10"
          >

            {daySchedule.programas.map((program) => {
              const Icon =
                categoryIcons[normalize(program.categoria)] ?? CalendarDays;

              return (
                <article
                  key={`${daySchedule.dia}-${program.id}`}
                  className="grid min-h-[48px] w-full grid-cols-[68px_24px_minmax(0,1fr)_auto_32px] items-center gap-2 border-b border-gold/10 px-1 py-2 last:border-b-0 sm:grid-cols-[94px_34px_minmax(0,1fr)_auto_40px] sm:px-3 sm:gap-3"
                >
                  <div className="text-xs font-extrabold text-gold sm:text-sm">
                    {program.horaInicio}
                  </div>
                  <Icon className="h-5 w-5 text-gold sm:h-6 sm:w-6" />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">{program.nombre}</h3>
                    <p className="mt-1 hidden truncate text-xs text-foreground/60 sm:block">
                      {program.descripcion}
                    </p>
                  </div>
                  {program.enVivo ? (
                    <span className="rounded-full bg-red-600 px-2.5 py-1 text-[9px] font-extrabold uppercase text-white shadow-[0_0_14px_rgba(220,38,38,.65)]">En vivo</span>
                  ) : <span />}
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

      {selectedSchedule.programas.length > 6 && (
        <button
          type="button"
          onClick={onToggleFullWeek}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/70 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-gold transition hover:bg-gold/10"
        >
          {showFullWeek ? "Ver resumen" : "Ver programación completa"}
          <ChevronRight className={cn("h-4 w-4 transition-transform", showFullWeek && "rotate-180")} />
        </button>
      )}
    </section>
  );
};
