import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Headphones,
  Heart,
  Home,
  Mail,
  Menu,
  Mic,
  Music,
  Quote,
  Radio,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdBanner } from "./AdBanner";
import { BottomNav } from "./BottomNav";
import { FeaturedPrograms } from "./FeaturedPrograms";
import { Logo } from "./Logo";
import { ProgramHeroCard, Programa } from "./ProgramHeroCard";
import { DaySchedule, WeeklySchedule } from "./WeeklySchedule";
import {
  DEFAULT_APP_CONFIG,
  ProgramacionRadio,
  getAppConfig,
  getPublishedProgramacion,
} from "@/services/sheetsService";
import {
  formatTime,
  getNextProgram,
  isProgramLive,
  isSameProgramDay,
  parseTimeToMinutes,
} from "@/utils/programacion";
const desktopLinks = [
  { label: "Inicio", icon: Home, to: "/" },
  { label: "Radio en vivo", icon: Radio, to: "/radio" },
  { label: "Oracion", icon: Mic, to: "/" },
  { label: "Programas", icon: CalendarDays, to: "/programacion", active: true },
  { label: "Recursos", icon: BookOpen, to: "/" },
  { label: "Comunidad", icon: Users, to: "/" },
];

const sideLinks = [
  { label: "Programacion", icon: CalendarDays, to: "/programacion", active: true },
  { label: "Devociones", icon: Heart, to: "/devociones" },
  { label: "Liturgia", icon: Mic, to: "/liturgia" },
  { label: "Formacion", icon: BookOpen, to: "/formacion" },
  { label: "Testimonios", icon: Quote, to: "/testimonios" },
  { label: "Podcast", icon: Headphones, to: "/podcast" },
  { label: "Eventos", icon: CalendarDays, to: "/eventos" },
  { label: "Contacto", icon: Mail, to: "/contacto" },
];

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
  const [contactUrl, setContactUrl] = useState(
    DEFAULT_APP_CONFIG.contact_whatsapp_url,
  );

  useEffect(() => {
    let mounted = true;

    getPublishedProgramacion()
      .then((data) => {
        if (mounted) setRemotePrograms(data);
      })
      .catch(() => {
        if (mounted) setRemotePrograms([]);
      });

    getAppConfig()
      .then((config) => {
        if (mounted) setContactUrl(config.contact_whatsapp_url);
      })
      .catch((error) => console.error("Programacion config error:", error));

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

  const openContact = () => {
    if (contactUrl) {
      window.open(contactUrl, "_blank", "noopener,noreferrer");
      return;
    }

    navigate("/contacto");
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-navy-deep text-foreground">
      <header className="sticky top-0 z-40 border-b border-gold/15 bg-navy-deep/95 backdrop-blur">
        <div className="mx-auto hidden h-20 max-w-[1760px] items-center justify-between px-8 xl:flex">
          <Logo size="lg" />
          <nav className="flex items-center gap-1 2xl:gap-2">
            {desktopLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`relative inline-flex h-20 items-center gap-2 px-3 text-xs font-extrabold uppercase transition 2xl:px-4 ${
                  item.active
                    ? "text-gold"
                    : "text-foreground/75 hover:text-gold"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.active && (
                  <span className="absolute inset-x-3 bottom-0 h-px bg-gradient-gold" />
                )}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => navigate("/donar")}
            className="inline-flex h-11 items-center gap-2 rounded-lg gold-border px-5 text-xs font-extrabold uppercase text-gold transition hover:bg-gold/10"
          >
            <Heart className="h-5 w-5" />
            Donar
          </button>
        </div>

        <div className="grid h-16 grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 px-3 xl:hidden">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
            aria-label="Abrir menu"
          >
            <Menu className="h-7 w-7" />
          </button>
          <Logo
            size="sm"
            className="min-w-0 justify-center [&_img]:max-w-[148px] [&_img]:object-contain"
          />
          <button
            type="button"
            onClick={() => navigate("/donar")}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg gold-border px-2.5 text-[10px] font-extrabold uppercase text-gold"
          >
            <Heart className="h-4 w-4" />
            Donar
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1760px] overflow-x-hidden xl:grid-cols-[220px_1fr]">
        <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] border-r border-gold/10 bg-navy-deep/70 p-4 xl:block">
          <nav className="space-y-2">
            {sideLinks.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                className={`flex h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition ${
                  item.active
                    ? "gold-border bg-gold/10 text-foreground"
                    : "text-foreground/80 hover:bg-gold/10 hover:text-gold"
                }`}
              >
                <item.icon className="h-5 w-5 text-gold" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 border-t border-gold/10 pt-8 text-center">
            <Quote className="mx-auto h-7 w-7 text-gold" />
            <p className="mx-auto mt-4 max-w-[165px] text-sm leading-relaxed text-foreground/80">
              “La radio catolica no solo anuncia, forma y transforma corazones.”
            </p>
            <div className="mt-3 text-sm font-semibold text-gold">
              San Juan Pablo II
            </div>
          </div>
        </aside>

        <main className="min-w-0 max-w-full overflow-x-hidden px-3 pb-28 pt-5 sm:px-6 xl:px-6 xl:pb-10 2xl:px-8">
          <div className="mb-4 flex items-end gap-3 px-1 sm:mb-5 sm:px-0">
            <CalendarDays className="mb-1 h-8 w-8 text-gold sm:h-9 sm:w-9" />
            <div>
              <h1 className="font-display text-3xl font-semibold leading-none text-foreground sm:text-5xl">
                Programacion
              </h1>
              <p className="mt-2 text-sm text-foreground/70">
                Conoce nuestra programacion diaria y semanal
              </p>
            </div>
          </div>

          <div className="grid min-w-0 max-w-full gap-4 2xl:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0 max-w-full space-y-4 sm:space-y-5">
              {(liveProgram || nextProgram) && (
                <section className="grid min-w-0 max-w-full gap-4 sm:gap-5 xl:grid-cols-2">
                  {liveProgram && (
                    <ProgramHeroCard
                      eyebrow="En vivo ahora"
                      program={liveProgram}
                      variant="live"
                      onAction={openRadio}
                    />
                  )}
                  {nextProgram && (
                    <ProgramHeroCard
                      eyebrow="Proximo programa"
                      program={nextProgram}
                      variant="next"
                      onAction={openProgramDetail}
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

              <div className="grid gap-4 sm:gap-5 xl:hidden">
                <SpiritualQuote />
                <ContactCard onContact={openContact} />
              </div>

              <AdBanner />
              <p className="hidden text-center text-xs text-foreground/60 xl:block">
                La programacion puede estar sujeta a cambios sin previo aviso.
              </p>
            </div>

            <aside className="hidden space-y-5 2xl:block">
              <TodaySummary total={schedule[0]?.programas.length ?? 0} />
              <SpiritualQuote />
              <ContactCard onContact={openContact} />
            </aside>
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

const TodaySummary = ({ total }: { total: number }) => {
  const rows = [
    { icon: CalendarDays, value: total, label: "Programas en total" },
    { icon: Heart, value: 7, label: "Devociones" },
    { icon: BookOpen, value: 5, label: "Formacion" },
    { icon: Trophy, value: 3, label: "Liturgia" },
    { icon: Music, value: 3, label: "Musica" },
  ];

  return (
    <section className="rounded-2xl gold-border bg-navy-deep/50 p-5 shadow-deep">
      <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-gold">
        Resumen de hoy
      </h2>
      <div className="divide-y divide-gold/10">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[36px_42px_1fr] items-center gap-3 py-3"
          >
            <row.icon className="h-6 w-6 text-gold" />
            <div className="text-2xl font-extrabold text-gold">
              {row.value}
            </div>
            <div className="text-sm text-foreground/80">{row.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

const SpiritualQuote = () => (
  <section className="rounded-2xl gold-border bg-navy-deep/50 p-4 shadow-deep sm:p-5">
    <div className="flex items-center gap-4 2xl:block 2xl:text-center">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full gold-border text-3xl font-bold text-gold sm:h-16 sm:w-16 sm:text-4xl">
        ”
      </div>
      <div>
        <p className="text-base leading-relaxed text-foreground sm:text-lg">
          “La radio catolica no solo anuncia, forma y transforma corazones.”
        </p>
        <div className="mt-2 text-base font-semibold text-gold">
          San Juan Pablo II
        </div>
      </div>
    </div>
  </section>
);

const ContactCard = ({ onContact }: { onContact: () => void }) => (
  <section className="rounded-2xl gold-border bg-navy-deep/50 p-4 shadow-deep sm:p-5">
    <div className="flex flex-col items-stretch gap-4">
      <div className="flex items-center gap-4">
        <Headphones className="h-9 w-9 text-gold" />
        <div>
          <h2 className="text-lg font-extrabold">¿Necesitas ayuda?</h2>
          <p className="text-sm text-foreground/70">Estamos para servirte</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onContact}
        className="w-full rounded-lg gold-border px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-gold transition hover:bg-gold/10"
      >
        Contactar
      </button>
    </div>
  </section>
);

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
          <img
            src={program.imagenUrl}
            alt=""
            className="h-full w-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep to-transparent" />
        </div>
      )}
      <div className="p-5">
        <div className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
          {program.categoria}
        </div>
        <h2 className="font-display text-3xl font-semibold leading-tight">
          {program.nombre}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/75">
          {program.descripcion}
        </p>
        <div className="mt-4 text-sm font-bold text-gold">
          {program.horaInicio}
          {program.horaFin ? ` - ${program.horaFin}` : ""}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg gold-border px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-gold transition hover:bg-gold/10"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={onListen}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-gold px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-navy-deep shadow-gold"
          >
            Escuchar ahora
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  </div>
);
