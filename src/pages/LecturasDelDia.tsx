import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cross,
  Heart,
  Headphones,
  Home,
  MessageCircleQuestion,
  Music2,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/lvdj/Logo";
import {
  LectioDivina,
  LiturgiaDia,
  SantoDelDia,
  getPublishedLectios,
  getPublishedLiturgias,
  getPublishedSantosDelDia,
  getTodayISO,
  getTodayLectio,
  getTodayLiturgia,
  getTodaySantoDelDia,
  santoMatchesDate,
} from "@/services/sheetsService";

type LecturasTab = "liturgia" | "santo" | "reflexion";
type ReadingRenderMode = "normal" | "ordo" | "psalm";

const tabLabels: Record<LecturasTab, string> = {
  liturgia: "Liturgia",
  santo: "Santo",
  reflexion: "Reflexión",
};

const weekLetters = ["L", "M", "X", "J", "V", "S", "D"];

const formatFecha = (fecha?: string) => {
  if (!fecha) return "Meditación diaria";
  const date = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(date.getTime())) return fecha;
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateCard = (fecha?: string) => {
  if (!fecha) return { weekday: "", day: "", month: "", year: "" };
  const date = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { weekday: "", day: "", month: "", year: "" };
  }
  const weekday = date
    .toLocaleDateString("es-CO", { weekday: "short" })
    .replace(".", "");
  const month = date
    .toLocaleDateString("es-CO", { month: "short" })
    .replace(".", "");
  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    day: String(date.getDate()),
    month: month.charAt(0).toUpperCase() + month.slice(1),
    year: String(date.getFullYear()),
  };
};

const stripOuterQuotes = (value: string) =>
  value.replace(/^[«\"“]\s*/, "").replace(/\s*[»\"”]$/, "");

const toISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekDates = (fecha: string) => {
  const selected = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(selected.getTime())) return [];
  const jsDay = selected.getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(selected);
  monday.setDate(selected.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return toISO(date);
  });
};

const formatPsalmResponse = (value?: string) => {
  if (!value) return "";
  const response = value.trim().replace(/^R\s*[/.]+\.?\s*/i, "");
  return response ? `R/. ${response}` : "";
};

const isLiturgicalFormula = (line: string) =>
  /^(lectura\s+(de|del)|palabra\s+de\s+dios|en\s+aquel\s+tiempo|en\s+aquellos\s+días)/i.test(
    line.trim(),
  );

const renderReadingText = (
  value?: string,
  mode: ReadingRenderMode = "normal",
) => {
  if (!value?.trim()) return null;
  const paragraphs = value.trimEnd().split(/\n{2,}/);
  let firstMeaningfulLineRendered = false;

  return paragraphs.map((paragraph, paragraphIndex) => {
    const lines = paragraph.split("\n");
    return (
      <p
        key={`${paragraphIndex}-${paragraph.slice(0, 20)}`}
        className="mb-6 last:mb-0"
      >
        {lines.map((rawLine, lineIndex) => {
          const line = rawLine.trimEnd();
          const meaningful = Boolean(line.trim());
          const highlightOrdo =
            mode === "ordo" &&
            meaningful &&
            !firstMeaningfulLineRendered &&
            !isLiturgicalFormula(line);

          if (meaningful && !firstMeaningfulLineRendered) {
            firstMeaningfulLineRendered = true;
          }

          const node =
            mode === "psalm" && /R\s*[/.]+\.?/i.test(line) ? (
              <span>{line}</span>
            ) : highlightOrdo ? (
              <span className="font-semibold italic text-[#c69222]">
                {line}
              </span>
            ) : (
              <span>{line}</span>
            );

          return (
            <Fragment key={`${lineIndex}-${line.slice(0, 12)}`}>
              {node}
              {lineIndex < lines.length - 1 && <br />}
            </Fragment>
          );
        })}
      </p>
    );
  });
};

const LiturgicalStole = ({ color }: { color?: string }) => {
  const key = color?.trim().toLowerCase() ?? "";
  const colors: Record<string, string> = {
    verde: "#1faa59",
    ordinario: "#1faa59",
    blanco: "#f8f5eb",
    rojo: "#c62828",
    morado: "#6a1b9a",
    violeta: "#6a1b9a",
    rosa: "#d86b9d",
    dorado: "#d4af37",
  };

  return (
    <span
      className="relative inline-flex h-5 w-3 shrink-0 items-center justify-center rounded-[3px] border border-[#071a33]"
      style={{ backgroundColor: colors[key] ?? "#d4af37" }}
      aria-hidden="true"
    >
      <span className="absolute h-3 w-[2px] rounded-full bg-white" />
      <span className="absolute h-[2px] w-2 rounded-full bg-white" />
    </span>
  );
};

const ContentCard = ({
  title,
  subtitle,
  response,
  text,
  icon,
  featured = false,
  mode = "normal",
}: {
  title: string;
  subtitle?: string;
  response?: string;
  text?: string;
  icon: ReactNode;
  featured?: boolean;
  mode?: ReadingRenderMode;
}) => {
  if (!text && !response) return null;

  return (
    <article
      className={`rounded-2xl border bg-white p-5 text-left shadow-[0_12px_32px_-28px_rgba(8,35,71,0.45)] ${
        featured ? "border-[#d4af37]" : "border-[#e6d8bf]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            featured
              ? "bg-[#082347] text-[#d4af37]"
              : "bg-[#f7ead1] text-[#c08a19]"
          }`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold uppercase tracking-[0.14em] text-[#082347]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[15px] font-semibold text-[#c69222]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {response && (
        <p className="mt-5 text-[17px] font-bold leading-[1.7] text-[#b17a12]">
          {response}
        </p>
      )}
      {text && (
        <div className="mt-5 text-[17px] leading-[1.78] text-[#263349]">
          {renderReadingText(text, mode)}
        </div>
      )}
    </article>
  );
};

const DesktopSidebar = ({
  activeTab,
  onSelectTab,
}: {
  activeTab: LecturasTab;
  onSelectTab: (tab: LecturasTab) => void;
}) => (
  <aside className="hidden w-[238px] shrink-0 rounded-l-[28px] bg-[#082347] p-6 text-white md:block">
    <div className="mb-8 flex justify-center">
      <Logo size="lg" />
    </div>
    <nav className="space-y-2 text-sm">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-white/10"
      >
        <Home className="h-5 w-5" />
        Inicio
      </Link>
      {(
        [
          ["liturgia", "Lecturas del día", <BookOpen className="h-5 w-5" />],
          ["santo", "Santo del día", <UserRound className="h-5 w-5" />],
          ["reflexion", "Reflexión", <Sparkles className="h-5 w-5" />],
        ] as [LecturasTab, string, ReactNode][]
      ).map(([tab, label, icon]) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelectTab(tab)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${
            activeTab === tab
              ? "bg-[#d4af37] text-[#071a33]"
              : "text-white/80 hover:bg-white/10"
          }`}
        >
          {icon}
          <span className="font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  </aside>
);

const SantoView = ({ santo }: { santo: SantoDelDia | null }) => {
  if (!santo?.nombre) {
    return (
      <article className="rounded-2xl border border-[#e6d8bf] bg-white p-5">
        El santo del día estará disponible pronto.
      </article>
    );
  }

  const sections: Array<[string, string]> = [
    ["lucha_que_enfrento", "La lucha que enfrentó"],
    ["secreto_de_santidad", "El secreto de su santidad"],
    ["ensenanza_para_hoy", "Enseñanza para hoy"],
    ["como_puedo_imitarlo", "Cómo puedo imitarlo"],
    ["paso_concreto", "Paso concreto para hoy"],
    ["oracion_intercesion", "Oración de intercesión"],
  ];

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-[#e6d8bf] bg-white p-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#c69222]">
          Santo del Día
        </p>
        <h2 className="mt-3 font-display text-[34px] leading-tight text-[#082347]">
          {santo.nombre}
        </h2>
        {santo.titulo && (
          <p className="mt-1 text-lg font-semibold text-[#263349]">
            {santo.titulo}
          </p>
        )}
        {santo.resumen && (
          <div className="mt-5 text-left text-[17px] leading-[1.78] text-[#263349]">
            {renderReadingText(santo.resumen)}
          </div>
        )}
        {santo.frase_destacada && (
          <div className="mt-5 rounded-xl border border-[#e6d8bf] bg-[#fffaf0] p-4 font-bold text-[#082347]">
            «{stripOuterQuotes(santo.frase_destacada)}»
          </div>
        )}
      </article>
      {sections.map(([key, label]) =>
        santo[key]?.trim() ? (
          <ContentCard
            key={key}
            title={label}
            text={santo[key]}
            icon={<Sparkles className="h-5 w-5" />}
          />
        ) : null,
      )}
    </div>
  );
};

const ReflectionView = ({
  lectio,
  liturgia,
}: {
  lectio: LectioDivina | null;
  liturgia: LiturgiaDia | null;
}) => {
  const content = {
    reflexion: lectio?.reflexion || liturgia?.reflexion || "",
    pregunta: lectio?.pregunta_meditar || liturgia?.pregunta_meditar || "",
    oracion: lectio?.oracion || liturgia?.oracion || "",
    compromiso: lectio?.compromiso || liturgia?.compromiso || "",
    mensaje: lectio?.mensaje_final || liturgia?.mensaje_final || "",
    audio: lectio?.audio_url || liturgia?.audio_url || "",
  };

  return (
    <div className="space-y-4">
      {!content.reflexion && (
        <article className="rounded-2xl border border-[#e6d8bf] bg-white p-5">
          Todavía no hay reflexión publicada para esta fecha.
        </article>
      )}
      <ContentCard
        title="Reflexión LVJ"
        subtitle="La Palabra de hoy para tu vida"
        text={content.reflexion}
        icon={<Sparkles className="h-5 w-5" />}
      />
      <ContentCard
        title="Pregunta para Meditar"
        text={content.pregunta}
        icon={<MessageCircleQuestion className="h-5 w-5" />}
      />
      <ContentCard
        title="Oración"
        text={content.oracion}
        icon={<Heart className="h-5 w-5" />}
      />
      <ContentCard
        title="Compromiso"
        text={content.compromiso}
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <ContentCard
        title="Mensaje Final"
        text={content.mensaje}
        icon={<Star className="h-5 w-5" />}
      />
      {content.audio && (
        <article className="rounded-2xl border border-[#e6d8bf] bg-white p-5">
          <div className="mb-4 flex items-center gap-3 font-bold text-[#082347]">
            <Headphones className="h-5 w-5 text-[#c69222]" />
            Escuchar reflexión
          </div>
          <audio controls preload="none" src={content.audio} className="w-full" />
        </article>
      )}
    </div>
  );
};

const LecturasDelDia = () => {
  const [liturgias, setLiturgias] = useState<LiturgiaDia[]>([]);
  const [lectios, setLectios] = useState<LectioDivina[]>([]);
  const [santos, setSantos] = useState<SantoDelDia[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [activeTab, setActiveTab] = useState<LecturasTab>("liturgia");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getPublishedLiturgias(),
      getPublishedLectios(),
      getPublishedSantosDelDia(),
      getTodayLiturgia(),
      getTodayLectio(),
      getTodaySantoDelDia(),
    ])
      .then(
        ([
          liturgiasData,
          lectiosData,
          santosData,
          todayLiturgia,
          todayLectio,
          todaySanto,
        ]) => {
          if (!mounted) return;

          const mergeByDate = <T extends { fecha: string },>(
            items: T[],
            today: T | null,
          ) => {
            const merged = [...items];
            if (today && !merged.some((item) => item.fecha === today.fecha)) {
              merged.push(today);
            }
            return merged.sort((a, b) => a.fecha.localeCompare(b.fecha));
          };

          const mergedLiturgias = mergeByDate(liturgiasData, todayLiturgia);
          const mergedLectios = mergeByDate(lectiosData, todayLectio);
          const mergedSantos =
            todaySanto &&
            !santosData.some((item) => santoMatchesDate(item, todaySanto.fecha))
              ? [...santosData, todaySanto]
              : santosData;

          setLiturgias(mergedLiturgias);
          setLectios(mergedLectios);
          setSantos(mergedSantos);

          const today = getTodayISO();
          setSelectedDate(
            mergedLiturgias.some((item) => item.fecha === today)
              ? today
              : mergedLiturgias[mergedLiturgias.length - 1]?.fecha || today,
          );
        },
      )
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const liturgia =
    liturgias.find((item) => item.fecha === selectedDate) ?? null;
  const lectio = lectios.find((item) => item.fecha === selectedDate) ?? null;
  const santo =
    santos.find((item) => santoMatchesDate(item, selectedDate)) ?? null;
  const selectedIndex = liturgias.findIndex(
    (item) => item.fecha === selectedDate,
  );
  const previousDate =
    selectedIndex > 0 ? liturgias[selectedIndex - 1]?.fecha : undefined;
  const nextDate =
    selectedIndex >= 0 && selectedIndex < liturgias.length - 1
      ? liturgias[selectedIndex + 1]?.fecha
      : undefined;
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const publishedDates = useMemo(
    () => new Set(liturgias.map((item) => item.fecha)),
    [liturgias],
  );
  const palabraHoy =
    liturgia?.palabra_hoy || "La Palabra para hoy estará disponible pronto.";
  const dateCard = formatDateCard(selectedDate);

  return (
    <main className="lvj-reading-page min-h-screen bg-[#fff8ec] text-[#071a33]">
      <Link
        to="/"
        className="fixed left-[max(18px,env(safe-area-inset-left))] top-[max(1.75rem,env(safe-area-inset-top))] z-[999] inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#111111] text-[#f8f5ea] md:hidden"
        aria-label="Volver al inicio"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="mx-auto w-full md:px-5 md:py-8" style={{ maxWidth: "1240px" }}>
        <div className="md:flex md:overflow-hidden md:rounded-[28px] md:border md:border-[#e6d8bf] md:bg-white/70">
          <DesktopSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          <section className="min-w-0 flex-1 px-4 pb-14 pt-7 sm:px-6 md:px-8 md:py-8">
            <header className="mx-auto max-w-[860px]">
              <h1 className="flex items-center justify-center gap-2 text-[16px] font-extrabold uppercase tracking-[0.18em] text-[#b17a12] md:justify-start md:text-lg md:tracking-[0.22em]">
                <BookOpen className="h-5 w-5" />
                Liturgia del Día
              </h1>

              {liturgias.length > 0 && (
                <div className="mt-7 overflow-hidden rounded-2xl border border-[#e6d8bf] bg-[#fffaf2] shadow-sm">
                  <div className="grid grid-cols-7 border-b border-[#e6d8bf] px-2 py-3 sm:px-4">
                    {weekDates.map((fecha, index) => {
                      const active = fecha === selectedDate;
                      const available = publishedDates.has(fecha);
                      return (
                        <button
                          key={fecha}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedDate(fecha)}
                          className={`mx-auto flex h-12 w-10 items-center justify-center rounded-xl text-[18px] font-extrabold transition sm:h-14 sm:w-12 sm:text-[20px] ${
                            active
                              ? "border border-[#a97812] bg-[#d4af37] text-[#082347] shadow-[0_6px_16px_-8px_rgba(8,35,71,0.65)]"
                              : available
                                ? "text-[#536174] hover:bg-[#f7ead1]"
                                : "cursor-not-allowed text-[#b8bec7] opacity-45"
                          }`}
                          aria-label={fecha}
                        >
                          {weekLetters[index]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative flex min-h-[230px] items-center justify-center px-4 py-8">
                    <button
                      type="button"
                      onClick={() => previousDate && setSelectedDate(previousDate)}
                      disabled={!previousDate}
                      className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full text-[#082347] disabled:opacity-20"
                      aria-label="Día anterior"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div className="text-center">
                      <div className="mx-auto flex h-[136px] w-[126px] flex-col items-center justify-center rounded-[24px] bg-[#082347] text-white shadow-[0_18px_34px_-22px_rgba(8,35,71,0.85)]">
                        <span className="text-[21px] font-bold leading-none">
                          {dateCard.weekday}
                        </span>
                        <span className="mt-1 text-[48px] font-extrabold leading-none">
                          {dateCard.day}
                        </span>
                        <span className="mt-1 text-[20px] font-extrabold leading-none text-[#d4af37]">
                          {dateCard.month}
                        </span>
                      </div>
                      <div className="mt-3 text-[20px] font-extrabold text-[#40506a]">
                        {dateCard.year}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => nextDate && setSelectedDate(nextDate)}
                      disabled={!nextDate}
                      className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full text-[#082347] disabled:opacity-20"
                      aria-label="Día siguiente"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-5 text-center">
                <h2 className="font-display text-[32px] leading-[1.08] text-[#082347] sm:text-[42px]">
                  {liturgia?.celebracion || "Liturgia del Día"}
                </h2>
                <p className="mt-4 text-[17px] font-extrabold text-[#40506a]">
                  Calendario litúrgico de Colombia
                </p>
                <div className="mx-auto mt-2 h-[3px] w-3/4 max-w-[480px] bg-[#c69222]" />
                <div className="mt-5 flex items-center justify-center gap-2 text-[17px] font-extrabold text-[#082347]">
                  <LiturgicalStole color={liturgia?.color_liturgico} />
                  <span>{liturgia?.tiempo_liturgico || "Tiempo litúrgico"}</span>
                </div>
              </div>
            </header>

            <section className="mx-auto mt-7 max-w-[860px] rounded-2xl border border-[#e6d8bf] bg-white px-5 py-5 text-center sm:px-6 sm:py-6 md:rounded-3xl md:p-8">
              <h2 className="mx-auto max-w-2xl text-[22px] font-extrabold leading-[1.18] text-[#082347] sm:text-[26px] md:text-[36px]">
                {loading
                  ? "Cargando lecturas..."
                  : `«${stripOuterQuotes(palabraHoy)}»`}
              </h2>
            </section>

            <nav className="sticky top-3 z-30 mx-auto mt-5 grid max-w-[860px] grid-cols-3 gap-1 rounded-xl bg-[#efe5d4] p-1">
              {(Object.keys(tabLabels) as LecturasTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-bold ${
                    activeTab === tab
                      ? "bg-[#082347] text-white"
                      : "text-[#071a33]"
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </nav>

            <div className="mx-auto mt-5 max-w-[860px]">
              {activeTab === "liturgia" && (
                <div className="space-y-4">
                  <ContentCard
                    title="Primera Lectura"
                    subtitle={liturgia?.primera_lectura_cita}
                    text={liturgia?.primera_lectura_texto}
                    icon={<BookOpen className="h-5 w-5" />}
                    mode="ordo"
                  />
                  <ContentCard
                    title="Salmo Responsorial"
                    subtitle={liturgia?.salmo_cita}
                    response={formatPsalmResponse(liturgia?.salmo_respuesta)}
                    text={liturgia?.salmo_texto}
                    icon={<Music2 className="h-5 w-5" />}
                    mode="psalm"
                  />
                  <ContentCard
                    title="Segunda Lectura"
                    subtitle={liturgia?.segunda_lectura_cita}
                    text={liturgia?.segunda_lectura_texto}
                    icon={<BookOpen className="h-5 w-5" />}
                    mode="ordo"
                  />
                  <ContentCard
                    title="Evangelio"
                    subtitle={liturgia?.evangelio_cita}
                    text={liturgia?.evangelio_texto}
                    icon={<Cross className="h-5 w-5" />}
                    featured
                    mode="ordo"
                  />
                </div>
              )}
              {activeTab === "santo" && <SantoView santo={santo} />}
              {activeTab === "reflexion" && (
                <ReflectionView lectio={lectio} liturgia={liturgia} />
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LecturasDelDia;
