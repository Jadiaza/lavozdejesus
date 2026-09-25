import { CalendarDays, ChevronRight } from "lucide-react";
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
const ProgramDetailModal = ({
  program,
  onClose,
  onListen,
}: {
  program: Programa;
  onClose: () => void;
  onListen: () => void;
}) => (
  <div className="fixed inset-0 z-[70] flex items-end bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
    <article className="w-full max-w-lg overflow-hidden rounded-2xl gold-border bg-navy-deep shadow-deep">
      {program.imagenUrl && (
        <div className="relative h-40">
          <img src={program.imagenUrl} alt="" className="h-full w-full object-cover opacity-65" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep to-transparent" />
        </div>
      )}
      <div className="p-5">
        <h2 className="font-display text-3xl font-semibold leading-tight">{program.nombre}</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/75">{program.descripcion}</p>
        <div className="mt-4 text-sm font-bold text-gold">{program.horaInicio}{program.horaFin ? ` - ${program.horaFin}` : ""}</div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onClose} className="rounded-lg gold-border px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-gold">Cerrar</button>
          <button type="button" onClick={onListen} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-gold px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-navy-deep shadow-gold">Escuchar ahora<ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </article>
  </div>
);

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
          <header className="mb-5 flex items-center gap-3 px-1 sm:mb-6 sm:px-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] via-[#D4AF37] to-[#9B7417] shadow-[0_0_26px_rgba(212,175,55,0.3)]">
              <CalendarDays className="h-5 w-5 text-[#050505]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <div className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                La Voz de Jesús
              </div>
              <h1 className="font-display text-[clamp(1.82rem,8.5vw,2.35rem)] leading-none text-[#F8F5EA]">
                Programación
              </h1>
            </div>
          </header>

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

