import {
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { BottomNav } from "./BottomNav";
import { FeaturedPrograms } from "./FeaturedPrograms";

import { ProgramHeroCard, Programa } from "./ProgramHeroCard";
import { DaySchedule, WeeklySchedule } from "./WeeklySchedule";
import {
   ProgramacionRadio,
   getPublishedProgramacion,
} from "@/services/sheetsService";
import {
  formatTime,
  getNextProgram,
  isProgramLive,
  isSameProgramDay,
  parseTimeToMinutes,
} from "@/utils/programacion";
const toPrograma = (program: ProgramacionRadio, now: Date): Programa => ({
  id: program.id || `${program.hora_inicio}-${program.programa}`,
  nombre: program.programa,
  descripcion:
    program.descripcion || "Un espacio de fe y esperanza en La Voz de Jesus.",
  horaInicio: formatTime(program.hora_inicio),
  horaFin: program.hora_fin ? formatTime(program.hora_fin) : undefined,
  dia: program.dia_semana || "diario",
  categoria: "Formacion",
  imagenUrl: program.imagen_url,
  enVivo: isProgramLive(program, now),
});

const toRadioProgram = (program: Programa): ProgramacionRadio => ({
  id: program.id,
  dia_semana: program.dia,
  hora_inicio: program.horaInicio,
  hora_fin: program.horaFin ?? "",
  programa: program.nombre,
  descripcion: program.descripcion,
  imagen_url: program.imagenUrl ?? "",
  estado: "publicado",
});

const getProgramsForDay = (
  programs: Programa[],
  day: number,
  label: string,
): DaySchedule => ({
  dia: label,
  programas: programs
    .filter((program) => isSameProgramDay(toRadioProgram(program), day))
    .sort(
      (first, second) =>
        (parseTimeToMinutes(first.horaInicio) ?? 0) -
        (parseTimeToMinutes(second.horaInicio) ?? 0),
    ),
});

export const ProgramacionPage = () => {
  const navigate = useNavigate();
  const [remotePrograms, setRemotePrograms] = useState<ProgramacionRadio[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [selectedProgram, setSelectedProgram] = useState<Programa | null>(null);
  const [showFullWeek, setShowFullWeek] = useState(false);

  useEffect(() => {
    let mounted = true;

    getPublishedProgramacion()
      .then((data) => {
        if (mounted) setRemotePrograms(data);
      })
      .catch(() => {
        if (mounted) setRemotePrograms([]);
      });


    const timer = window.setInterval(() => setNow(new Date()), 60_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const programs = useMemo(
    () => remotePrograms.map((program) => toPrograma(program, now)),
    [now, remotePrograms],
  );

  const radioPrograms = useMemo(() => remotePrograms, [remotePrograms]);

  const liveProgram =
    programs.find((program) => program.enVivo) ?? null;

  const nextProgram = useMemo(() => {
    const next = getNextProgram(radioPrograms, now);
    return next ? toPrograma(next, now) : null;
  }, [now, radioPrograms]);

  const today = now.getDay();
  const schedule: DaySchedule[] = useMemo(
    () => [
      getProgramsForDay(programs, today, "Hoy"),
      getProgramsForDay(programs, 1, "Lun"),
      getProgramsForDay(programs, 2, "Mar"),
      getProgramsForDay(programs, 3, "Mié"),
      getProgramsForDay(programs, 4, "Jue"),
      getProgramsForDay(programs, 5, "Vie"),
      getProgramsForDay(programs, 6, "Sáb"),
      getProgramsForDay(programs, 0, "Dom"),
    ],
    [programs, today],
  );

  const openRadio = () => navigate("/radio");
  const openProgramDetail = (program: Programa) => setSelectedProgram(program);

  const handleProgramAction = (program: Programa) => {
    if (program.enVivo) {
      openRadio();
      return;
    }

    openProgramDetail(program);
  };


  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-navy-deep text-foreground">
      <div className="mx-auto w-full max-w-[1180px] overflow-x-hidden">
        <main className="min-w-0 max-w-full overflow-x-hidden px-3 pb-28 pt-5 sm:px-6 xl:px-8">
          <div className="mb-4 flex items-end gap-3 px-1 sm:mb-5 sm:px-0">
            <CalendarDays className="mb-1 h-8 w-8 text-gold sm:h-9 sm:w-9" />
            <div>
              <h1 className="font-display text-3xl font-semibold leading-none text-foreground sm:text-5xl">
                Programación
              </h1>
              <p className="mt-2 text-sm text-foreground/70">
                Conoce nuestra programación diaria y semanal
              </p>
            </div>
          </div>

          <div className="min-w-0 max-w-full">
            <div className="min-w-0 max-w-full space-y-4 sm:space-y-5">
              {(liveProgram || nextProgram) && (
                <section className="min-w-0 max-w-full">
                  {liveProgram && (
                    <ProgramHeroCard
                      eyebrow="En vivo ahora"
                      program={liveProgram}
                      variant="live"
                      onAction={openRadio}
                      nextProgram={nextProgram ?? undefined}
                      onNextAction={openProgramDetail}
                    />
                  )}
                </section>
              )}

              <div className="flex min-w-0 max-w-full flex-col gap-6">
                <WeeklySchedule
                  schedule={schedule}
                  showFullWeek={showFullWeek}
                  onToggleFullWeek={() => setShowFullWeek((current) => !current)}
                  onProgramAction={handleProgramAction}
                />
                <FeaturedPrograms />
              </div>

            </div>

          </div>
        </main>
      </div>

      <BottomNav activeLabel="Programas" />
      {selectedProgram && (
        <ProgramDetailModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          onListen={openRadio}
        />
      )}
    </div>
  );
};

