import {
  BookOpen,
  CheckCircle2,
  Cross,
  Heart,
  Headphones,
  Home,
  MessageCircleQuestion,
  Music2,
  Settings,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
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
type ReadingAlignment = "left" | "justify";

type LiturgiaTheme = "oscuro" | "claro" | "sepia";

interface LiturgiaReadingPreferences {
  fontSize: 16 | 18 | 21 | 24;
  alignment: ReadingAlignment;
  theme: LiturgiaTheme;
}

const DEFAULT_READING_PREFERENCES: LiturgiaReadingPreferences = {
  fontSize: 18,
  alignment: "left",
  theme: "oscuro",
};

const LITURGIA_THEMES: Record<
  LiturgiaTheme,
  {
    label: string;
    background: string;
    surface: string;
    soft: string;
    text: string;
    muted: string;
    border: string;
    nav: string;
  }
> = {
  oscuro: {
    label: "Oscuro",
    background: "#050505",
    surface: "#0d1117",
    soft: "#111111",
    text: "#f8f5ea",
    muted: "#b8b2a6",
    border: "rgba(212,175,55,.28)",
    nav: "rgba(5,5,5,.96)",
  },
  claro: {
    label: "Claro",
    background: "#f8f5ea",
    surface: "#fffdf8",
    soft: "#f3eadb",
    text: "#082347",
    muted: "#536174",
    border: "#e6d8bf",
    nav: "rgba(255,253,248,.96)",
  },
  sepia: {
    label: "Tinta",
    background: "#e7e1cf",
    surface: "#eee9d9",
    soft: "#ddd5bf",
    text: "#20211d",
    muted: "#5f5b4d",
    border: "rgba(95,91,77,.34)",
    nav: "rgba(231,225,207,.96)",
  },
};

const READING_PREFERENCES_KEY = "lvj_liturgia_reading_preferences_v1";

const tabLabels: Record<LecturasTab, string> = {
  liturgia: "Liturgia",
  santo: "Santo",
  reflexion: "Reflexión",
};

const weekLetters = ["L", "M", "X", "J", "V", "S", "D"];

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

          const psalmMarker =
            mode === "psalm"
              ? line.match(/^(\s*(?:V\.|V\/\.|R\.|R\/.))(\s*)(.*)$/i)
              : null;

          const node = psalmMarker ? (
            <span>
              <span className="font-bold text-[#c69222]">
                {psalmMarker[1]}
              </span>
              {psalmMarker[2]}
              {psalmMarker[3]}
            </span>
          ) : highlightOrdo ? (
            <span className="font-semibold italic text-[#c69222]">{line}</span>
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
      className="relative inline-flex h-6 w-4 shrink-0 items-center justify-center rounded-[4px] border border-[#071a33]"
      style={{ backgroundColor: colors[key] ?? "#d4af37" }}
      aria-hidden="true"
    >
      <span className="absolute h-4 w-[2px] rounded-full bg-[var(--lit-surface)]" />
      <span className="absolute h-[2px] w-2.5 rounded-full bg-[var(--lit-surface)]" />
    </span>
  );
};

const ContentCard = ({
  id,
  title,
  subtitle,
  response,
  text,
  icon,
  featured = false,
  integrated = false,
  mode = "normal",
  readingPreferences = DEFAULT_READING_PREFERENCES,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  response?: string;
  text?: string;
  icon: ReactNode;
  featured?: boolean;
  integrated?: boolean;
  mode?: ReadingRenderMode;
  readingPreferences?: LiturgiaReadingPreferences;
}) => {
  if (!text && !response) return null;

  return (
    <article
      id={id}
      className={
        integrated
          ? `scroll-mt-2 border-b px-1 py-7 text-left last:border-b-0 ${
              featured
                ? "border-[#d4af37]/60"
                : "border-[var(--lit-border)]"
            }`
          : `scroll-mt-6 rounded-2xl border bg-[var(--lit-surface)] p-5 text-left shadow-[0_12px_32px_-28px_rgba(8,35,71,0.45)] ${
              featured ? "border-[#d4af37]" : "border-[var(--lit-border)]"
            }`
      }
    >
      <div className={`flex items-start ${integrated ? "gap-3" : "gap-4"}`}>
        <span
          className={
            integrated
              ? "flex h-8 w-8 shrink-0 items-center justify-center text-[#d4af37]"
              : `flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  featured
                    ? "bg-[#082347] text-[#d4af37]"
                    : "bg-[#f7ead1] text-[#c08a19]"
                }`
          }
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={`font-extrabold uppercase text-[var(--lit-text)] ${
            integrated
              ? "text-[17px] tracking-[0.17em]"
              : "text-[15px] tracking-[0.14em]"
          }`}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[15px] font-semibold text-[#c69222]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {integrated && (
        <div
          className={`mt-4 h-px w-full ${
            featured ? "bg-[#d4af37]/70" : "bg-[var(--lit-border)]"
          }`}
          aria-hidden="true"
        />
      )}

      {response && (
        <p className="mt-5 text-[17px] font-bold leading-[1.7] text-[#c69222]">
          {response}
        </p>
      )}

      {text && (
        <div
          className={`leading-[1.78] text-[var(--lit-text)] ${
            integrated ? "mt-6" : "mt-5"
          }`}
          style={{
            fontSize: `${readingPreferences.fontSize}px`,
            textAlign: readingPreferences.alignment,
          }}
        >
          {renderReadingText(text, mode)}
        </div>
      )}
    </article>
  );
};

const SantoImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#fff8ec] text-[#c69222]">
        <UserRound className="h-16 w-16" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover object-center"
    />
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
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-[var(--lit-surface)]/10"
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
              ? "bg-[#d4af37] text-[var(--lit-text)]"
              : "text-white/80 hover:bg-[var(--lit-surface)]/10"
          }`}
        >
          {icon}
          <span className="font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  </aside>
);

const SantoView = ({
  santo,
  readingPreferences,
}: {
  santo: SantoDelDia | null;
  readingPreferences: LiturgiaReadingPreferences;
}) => {
  if (!santo?.nombre) {
    return (
      <article className="rounded-2xl border border-[var(--lit-border)] bg-[var(--lit-surface)] p-5 text-center text-[var(--lit-text)]">
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
      <article className="rounded-2xl border border-[var(--lit-border)] bg-[var(--lit-surface)] px-5 py-7 text-center shadow-[0_18px_46px_-34px_rgba(8,35,71,0.48)] sm:px-7 md:px-8 md:py-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#c69222]">
          Santo del Día
        </p>

        <div className="mt-5 grid items-center gap-6 md:grid-cols-[210px_minmax(0,1fr)] md:text-left">
          <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-[4px] border-[#c69222] bg-[#fff8ec] shadow-[0_18px_42px_-30px_rgba(8,35,71,0.7)] sm:h-44 sm:w-44 md:h-48 md:w-48">
            <SantoImage src={santo.imagen_url} alt={santo.nombre} />
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-[34px] leading-tight text-[var(--lit-text)] md:text-[42px]">
              {santo.nombre}
            </h2>
            {santo.titulo && (
              <p className="mt-1 text-lg font-semibold leading-snug text-[var(--lit-text)]">
                {santo.titulo}
              </p>
            )}
            {santo.resumen && (
              <div
                className="mt-5 leading-[1.78] text-[var(--lit-text)]"
                style={{
                  fontSize: `${readingPreferences.fontSize}px`,
                  textAlign: readingPreferences.alignment,
                }}
              >
                {renderReadingText(santo.resumen)}
              </div>
            )}
          </div>
        </div>

        {santo.frase_destacada && (
          <div className="mx-auto mt-6 max-w-xl rounded-xl border border-[var(--lit-border)] bg-[#fffaf0] px-5 py-4 text-[16px] font-bold leading-relaxed text-[var(--lit-text)] md:ml-[226px] md:text-left">
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
            readingPreferences={readingPreferences}
          />
        ) : null,
      )}
    </div>
  );
};

const ReflectionView = ({
  lectio,
  liturgia,
  readingPreferences,
}: {
  lectio: LectioDivina | null;
  liturgia: LiturgiaDia | null;
  readingPreferences: LiturgiaReadingPreferences;
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
        <article className="rounded-2xl border border-[var(--lit-border)] bg-[var(--lit-surface)] p-5">
          Todavía no hay reflexión publicada para esta fecha.
        </article>
      )}
      <ContentCard
        title="Reflexión LVJ"
        subtitle="La Palabra de hoy para tu vida"
        text={content.reflexion}
        icon={<Sparkles className="h-5 w-5" />}
        readingPreferences={readingPreferences}
      />
      <ContentCard
        title="Pregunta para Meditar"
        text={content.pregunta}
        icon={<MessageCircleQuestion className="h-5 w-5" />}
        readingPreferences={readingPreferences}
      />
      <ContentCard
        title="Oración"
        text={content.oracion}
        icon={<Heart className="h-5 w-5" />}
        readingPreferences={readingPreferences}
      />
      <ContentCard
        title="Compromiso"
        text={content.compromiso}
        icon={<CheckCircle2 className="h-5 w-5" />}
        readingPreferences={readingPreferences}
      />
      <ContentCard
        title="Mensaje Final"
        text={content.mensaje}
        icon={<Star className="h-5 w-5" />}
        readingPreferences={readingPreferences}
      />
      {content.audio && (
        <article className="rounded-2xl border border-[var(--lit-border)] bg-[var(--lit-surface)] p-5">
          <div className="mb-4 flex items-center gap-3 font-bold text-[var(--lit-text)]">
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectBottomTab = (tab: LecturasTab) => {
    setActiveTab(tab);
    setSettingsOpen(false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document
          .getElementById("lectura-contenido")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  const [readingPreferences, setReadingPreferences] =
    useState<LiturgiaReadingPreferences>(() => {
      if (typeof window === "undefined") return DEFAULT_READING_PREFERENCES;

      try {
        const raw = window.localStorage.getItem(READING_PREFERENCES_KEY);
        if (!raw) return DEFAULT_READING_PREFERENCES;

        const parsed = JSON.parse(raw) as Partial<LiturgiaReadingPreferences>;
        const fontSize = [16, 18, 21, 24].includes(Number(parsed.fontSize))
          ? (Number(parsed.fontSize) as LiturgiaReadingPreferences["fontSize"])
          : DEFAULT_READING_PREFERENCES.fontSize;
        const alignment =
          parsed.alignment === "justify" ? "justify" : "left";
        const theme: LiturgiaTheme =
          parsed.theme === "claro" || parsed.theme === "sepia"
            ? parsed.theme
            : "oscuro";

        return { fontSize, alignment, theme };
      } catch {
        return DEFAULT_READING_PREFERENCES;
      }
    });

  const updateReadingPreferences = (
    next: Partial<LiturgiaReadingPreferences>,
  ) => {
    setReadingPreferences((current) => {
      const value = { ...current, ...next };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          READING_PREFERENCES_KEY,
          JSON.stringify(value),
        );
      }
      return value;
    });
  };

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
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const publishedDates = useMemo(
    () => new Set(liturgias.map((item) => item.fecha)),
    [liturgias],
  );
  const palabraHoy =
    liturgia?.palabra_hoy || "La Palabra para hoy estará disponible pronto.";
  const dateCard = formatDateCard(selectedDate);
  const activeTheme = LITURGIA_THEMES[readingPreferences.theme];

  return (
    <main
      className="lvj-reading-page min-h-screen bg-[var(--lit-bg)] text-[var(--lit-text)] transition-colors duration-300"
      style={
        {
          "--lit-bg": activeTheme.background,
          "--lit-surface": activeTheme.surface,
          "--lit-soft": activeTheme.soft,
          "--lit-text": activeTheme.text,
          "--lit-muted": activeTheme.muted,
          "--lit-border": activeTheme.border,
          "--lit-nav": activeTheme.nav,
        } as CSSProperties
      }
    >
      <div
        className="mx-auto w-full md:px-5 md:py-8"
        style={{ maxWidth: "1240px" }}
      >
        <div className="md:flex md:overflow-hidden md:rounded-[28px] md:border md:border-[var(--lit-border)] md:bg-[var(--lit-surface)]/70">
          <DesktopSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          <section className="min-w-0 flex-1 px-4 pb-28 pt-3 sm:px-6 md:px-8 md:py-8">
            <header className="mx-auto max-w-[860px]">
              <h1 className="hidden items-center gap-2 border-b border-[var(--lit-border)] pb-5 text-lg font-extrabold uppercase tracking-[0.22em] text-[#b17a12] md:flex md:justify-start">
                <BookOpen className="h-5 w-5" />
                Liturgia del Día
              </h1>

              {liturgias.length > 0 && (
                <div className="overflow-hidden bg-[var(--lit-surface)]">
                  <div className="grid grid-cols-7 border-b border-[var(--lit-border)] px-2 py-3 sm:px-4 md:py-4">
                    {weekDates.map((fecha, index) => {
                      const active = fecha === selectedDate;
                      const available = publishedDates.has(fecha);
                      return (
                        <button
                          key={fecha}
                          type="button"
                          disabled={!available}
                          onClick={() => setSelectedDate(fecha)}
                          className={`mx-auto flex h-10 w-9 items-center justify-center rounded-[11px] text-[17px] font-extrabold transition sm:h-12 sm:w-11 sm:text-[18px] ${
                            active
                              ? "border border-[#a97812] bg-[#d4af37] text-[#071a33] shadow-[0_6px_16px_-8px_rgba(8,35,71,0.65)]"
                              : available
                                ? "text-[var(--lit-muted)] hover:bg-[#d4af37]/10"
                                : "cursor-not-allowed text-[#b8bec7] opacity-45"
                          }`}
                          aria-label={fecha}
                        >
                          {weekLetters[index]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex min-h-[145px] items-center justify-center px-4 py-4">
                    <div className="text-center">
                      <div className="mx-auto flex h-[98px] w-[90px] flex-col items-center justify-center rounded-[18px] bg-[#082347] text-white shadow-[0_14px_26px_-20px_rgba(8,35,71,0.8)]">
                        <span className="text-[16px] font-bold leading-none">
                          {dateCard.weekday}
                        </span>
                        <span className="mt-1 text-[30px] font-extrabold leading-none">
                          {dateCard.day}
                        </span>
                        <span className="mt-1 text-[14px] font-extrabold leading-none text-[#d4af37]">
                          {dateCard.month}
                        </span>
                      </div>
                      <div className="mt-2 text-[16px] font-extrabold text-[var(--lit-muted)]">
                        {dateCard.year}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[var(--lit-soft)] px-4 pb-6 pt-4 text-center">
                <h2 className="font-display text-[30px] leading-[1.1] text-[var(--lit-text)] sm:text-[40px]">
                  {liturgia?.celebracion || "Liturgia del Día"}
                </h2>
                <p className="mt-4 text-[15px] font-extrabold text-[var(--lit-muted)] sm:text-[16px]">
                  Calendario litúrgico de Colombia
                </p>
                <div className="mx-auto mt-3 h-[2px] w-[72%] max-w-[420px] bg-[#c69222]" />
                <div className="mt-4 flex items-center justify-center gap-2.5 text-[15px] font-extrabold uppercase text-[var(--lit-text)] sm:text-[16px]">
                  <LiturgicalStole color={liturgia?.color_liturgico} />
                  <span>{liturgia?.tiempo_liturgico || "Tiempo litúrgico"}</span>
                </div>
              </div>
            </header>

            <section className="mx-auto mt-5 max-w-[860px] rounded-[22px] border-2 border-[var(--lit-border)] bg-[var(--lit-surface)] px-4 py-5 text-center shadow-[0_14px_32px_-28px_rgba(8,35,71,0.32)] sm:px-6 sm:py-6 md:p-8">
              <div className="flex items-center justify-center gap-3 text-[var(--lit-text)]">
                <BookOpen className="h-5 w-5 text-[#b17a12]" />
                <p className="text-[14px] font-extrabold uppercase tracking-[0.08em] sm:text-[16px]">
                  Palabra para hoy
                </p>
              </div>
              <h2 className="mx-auto mt-3 max-w-2xl font-display text-[22px] italic leading-[1.24] text-[var(--lit-text)] sm:text-[27px] md:text-[34px]">
                {loading
                  ? "Cargando lecturas..."
                  : `«${stripOuterQuotes(palabraHoy)}»`}
              </h2>
              {liturgia?.evangelio_cita && (
                <>
                  <div className="mx-auto mt-4 h-[2px] w-20 bg-[#c69222]" />
                  <p className="mt-2 text-[12px] font-semibold text-[var(--lit-muted)] sm:text-sm">
                    {liturgia.evangelio_cita}
                  </p>
                </>
              )}
            </section>

            {activeTab === "liturgia" && (
              <section className="mx-auto mt-5 max-w-[860px]">
                <div className="mb-3 flex items-center justify-between gap-4 px-1">
                  <h2 className="text-[13px] font-extrabold uppercase tracking-[0.22em] text-[var(--lit-muted)]">
                    Lecturas de hoy
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById("primera-lectura")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#b17a12]"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    {
                      id: "primera-lectura",
                      label: "Primera lectura",
                      citation: liturgia?.primera_lectura_cita,
                      icon: <BookOpen className="h-[18px] w-[18px]" />,
                    },
                    {
                      id: "salmo-responsorial",
                      label: "Salmo responsorial",
                      citation: liturgia?.salmo_cita,
                      icon: <Music2 className="h-[18px] w-[18px]" />,
                    },
                    {
                      id: "evangelio",
                      label: "Evangelio",
                      citation: liturgia?.evangelio_cita,
                      icon: <Cross className="h-[18px] w-[18px]" />,
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        document
                          .getElementById(item.id)
                          ?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }
                      className="min-h-[108px] rounded-[14px] border border-[var(--lit-border)] bg-[var(--lit-surface)] px-2.5 py-3 text-left shadow-[0_10px_24px_-22px_rgba(8,35,71,0.4)] transition active:scale-[0.98]"
                    >
                      <span className="mb-2 flex h-7 w-7 items-center justify-center text-[#b17a12]">
                        {item.icon}
                      </span>
                      <strong className="block text-[12px] leading-[1.15] text-[var(--lit-text)] sm:text-[13px]">
                        {item.label}
                      </strong>
                      <span className="mt-1.5 block line-clamp-2 text-[10px] leading-snug text-[var(--lit-muted)] sm:text-[11px]">
                        {item.citation || "Disponible pronto"}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div
              id="lectura-contenido"
              className="mx-auto mt-7 max-w-[860px] scroll-mt-2"
            >
              {activeTab === "liturgia" && (
                <div className="space-y-4">
                  <ContentCard
                    id="primera-lectura"
                    title="Primera Lectura"
                    subtitle={liturgia?.primera_lectura_cita}
                    text={liturgia?.primera_lectura_texto}
                    icon={<BookOpen className="h-5 w-5" />}
                    mode="ordo"
                    integrated
                    readingPreferences={readingPreferences}
                  />
                  <ContentCard
                    id="salmo-responsorial"
                    title="Salmo Responsorial"
                    subtitle={liturgia?.salmo_cita}
                    response={formatPsalmResponse(liturgia?.salmo_respuesta)}
                    text={liturgia?.salmo_texto}
                    icon={<Music2 className="h-5 w-5" />}
                    mode="psalm"
                    integrated
                    readingPreferences={readingPreferences}
                  />
                  <ContentCard
                    id="segunda-lectura"
                    title="Segunda Lectura"
                    subtitle={liturgia?.segunda_lectura_cita}
                    text={liturgia?.segunda_lectura_texto}
                    icon={<BookOpen className="h-5 w-5" />}
                    mode="ordo"
                    integrated
                    readingPreferences={readingPreferences}
                  />
                  <ContentCard
                    id="evangelio"
                    title="Evangelio"
                    subtitle={liturgia?.evangelio_cita}
                    text={liturgia?.evangelio_texto}
                    icon={<Cross className="h-5 w-5" />}
                    featured
                    mode="ordo"
                    integrated
                    readingPreferences={readingPreferences}
                  />
                </div>
              )}

              {activeTab === "santo" && (
                <SantoView
                  santo={santo}
                  readingPreferences={readingPreferences}
                />
              )}

              {activeTab === "reflexion" && (
                <ReflectionView
                  lectio={lectio}
                  liturgia={liturgia}
                  readingPreferences={readingPreferences}
                />
              )}
            </div>
          </section>
        </div>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end bg-black/35 md:hidden">
          <button
            type="button"
            aria-label="Cerrar configuración"
            className="absolute inset-0"
            onClick={() => setSettingsOpen(false)}
          />
          <section
            className="relative w-full rounded-t-[28px] border-t border-[var(--lit-border)] bg-[var(--lit-surface)] px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_-18px_50px_-30px_rgba(8,35,71,0.55)]"
            aria-label="Configuración de lectura"
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-[#d8c49d]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b17a12]">
                  Configuración
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[var(--lit-text)]">
                  Aa · Formato de texto
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--lit-border)] bg-[var(--lit-surface)] text-[var(--lit-text)]"
                aria-label="Cerrar configuración"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <fieldset>
                <legend className="mb-3 text-sm font-extrabold text-[var(--lit-muted)]">
                  Tema
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(LITURGIA_THEMES) as LiturgiaTheme[]).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      onClick={() => updateReadingPreferences({ theme })}
                      className={`min-h-20 rounded-xl border p-2 text-xs font-bold transition ${
                        readingPreferences.theme === theme
                          ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]"
                          : "border-[var(--lit-border)] text-[var(--lit-muted)]"
                      }`}
                    >
                      <span
                        className={`mx-auto mb-2 block h-9 w-9 rounded-full border ${
                          theme === "claro"
                            ? "border-stone-300 bg-[#f8f5ea]"
                            : theme === "sepia"
                              ? "border-[#756e5d] bg-[#e7e1cf]"
                              : "border-stone-700 bg-[#111111]"
                        }`}
                      />
                      {LITURGIA_THEMES[theme].label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-extrabold text-[var(--lit-muted)]">
                  Tamaño del texto
                </legend>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    [16, "Pequeño"],
                    [18, "Normal"],
                    [21, "Grande"],
                    [24, "Muy grande"],
                  ] as const).map(([size, label]) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateReadingPreferences({ fontSize: size })}
                      className={`min-h-12 rounded-xl border px-2 text-xs font-bold transition ${
                        readingPreferences.fontSize === size
                          ? "border-[#b17a12] bg-[#d4af37] text-[var(--lit-text)]"
                          : "border-[var(--lit-border)] bg-[var(--lit-surface)] text-[var(--lit-muted)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-3 text-sm font-extrabold text-[var(--lit-muted)]">
                  Alineación
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ["left", "Izquierda"],
                    ["justify", "Justificada"],
                  ] as const).map(([alignment, label]) => (
                    <button
                      key={alignment}
                      type="button"
                      onClick={() =>
                        updateReadingPreferences({ alignment })
                      }
                      className={`min-h-12 rounded-xl border px-4 text-sm font-bold transition ${
                        readingPreferences.alignment === alignment
                          ? "border-[#b17a12] bg-[#d4af37] text-[var(--lit-text)]"
                          : "border-[var(--lit-border)] bg-[var(--lit-surface)] text-[var(--lit-muted)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-[900] border-t border-[var(--lit-border)] bg-[var(--lit-nav)] pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_-24px_rgba(8,35,71,0.45)] backdrop-blur md:hidden"
        aria-label="Navegación de Liturgia"
      >
        <div className="mx-auto grid max-w-[560px] grid-cols-5 px-1">
          <Link
            to="/"
            className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-center text-[10px] font-semibold leading-[1.05] text-[var(--lit-muted)]"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>

          <button
            type="button"
            onClick={() => selectBottomTab("liturgia")}
            className={`relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-center text-[10px] font-semibold leading-[1.05] ${
              activeTab === "liturgia" && !settingsOpen
                ? "text-[#b17a12]"
                : "text-[var(--lit-muted)]"
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Liturgia</span>
            {activeTab === "liturgia" && !settingsOpen && (
              <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[#b17a12]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => selectBottomTab("santo")}
            className={`relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-center text-[10px] font-semibold leading-[1.05] ${
              activeTab === "santo" && !settingsOpen
                ? "text-[#b17a12]"
                : "text-[var(--lit-muted)]"
            }`}
          >
            <UserRound className="h-5 w-5" />
            <span>Santo</span>
            {activeTab === "santo" && !settingsOpen && (
              <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[#b17a12]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => selectBottomTab("reflexion")}
            className={`relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-center text-[10px] font-semibold leading-[1.05] ${
              activeTab === "reflexion" && !settingsOpen
                ? "text-[#b17a12]"
                : "text-[var(--lit-muted)]"
            }`}
          >
            <MessageCircleQuestion className="h-5 w-5" />
            <span>Reflexión</span>
            {activeTab === "reflexion" && !settingsOpen && (
              <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[#b17a12]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={`relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-1 text-center text-[10px] font-semibold leading-[1.05] ${
              settingsOpen ? "text-[#b17a12]" : "text-[var(--lit-muted)]"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
            {settingsOpen && (
              <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-[#b17a12]" />
            )}
          </button>
        </div>
      </nav>
    </main>
  );
};

export default LecturasDelDia;
