import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cross,
  Heart,
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
} from "@/services/sheetsService";

type LecturasTab = "liturgia" | "santo" | "reflexion";

interface LecturasCache {
  liturgias: LiturgiaDia[];
  lectios: LectioDivina[];
  santos: SantoDelDia[];
}

const CACHE_KEY = "lvj_lecturas_publicadas_v10";

const liturgicalStoleMap: Record<
  string,
  { background: string; cross: string; border: string }
> = {
  verde: { background: "#1faa59", cross: "#f4d35e", border: "#071a33" },
  ordinario: { background: "#1faa59", cross: "#f4d35e", border: "#071a33" },
  blanco: { background: "#f8f5eb", cross: "#c69222", border: "#071a33" },
  rojo: { background: "#c62828", cross: "#ffffff", border: "#071a33" },
  morado: { background: "#6a1b9a", cross: "#ffffff", border: "#071a33" },
  violeta: { background: "#6a1b9a", cross: "#ffffff", border: "#071a33" },
  rosa: { background: "#d86b9d", cross: "#ffffff", border: "#071a33" },
  dorado: { background: "#d4af37", cross: "#ffffff", border: "#071a33" },
};

const tabLabels: Record<LecturasTab, string> = {
  liturgia: "Liturgia",
  santo: "Santo",
  reflexion: "Reflexión",
};

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

const formatDiaSelector = (fecha: string) => {
  const date = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { day: fecha, weekday: "" };
  }

  return {
    day: date.toLocaleDateString("es-CO", { day: "2-digit" }),
    weekday: date
      .toLocaleDateString("es-CO", { weekday: "short" })
      .replace(".", ""),
  };
};

const getLiturgicalStoleValue = (color?: string) => {
  const key = color?.trim().toLowerCase() ?? "";
  return liturgicalStoleMap[key] ?? liturgicalStoleMap.dorado;
};

const stripOuterQuotes = (value: string) =>
  value.replace(/^[«"“]\s*/, "").replace(/\s*[»"”]$/, "");

const compactText = (value?: string, maxLength = 190) => {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";

  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength).trim()}...`
    : normalized;
};

const shouldCollapseText = (value?: string) => {
  const text = value?.trim() ?? "";
  if (!text) return false;

  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  return text.length > 360 || (paragraphs.length > 1 && text.length > 240);
};

const formatPsalmResponse = (value?: string) => {
  if (!value) return "";

  const response = value.trim().replace(/^R\s*[/.]+\.?\s*/i, "");
  return response ? `R/. ${response}` : "";
};

const renderPsalmLine = (value: string) =>
  value.split(/(R\s*[/.]+\.?)/gi).map((part, index) => {
    if (/^R\s*[/.]+\.?$/i.test(part)) {
      return (
        <span key={`${part}-${index}`} className="font-normal text-[#b17a12]">
          R/.
        </span>
      );
    }

    return part;
  });

const renderPreservedText = (
  value: string | undefined,
  fallback: string,
  renderLine: (line: string) => ReactNode = (line) => line,
) => {
  const text = value?.trimEnd() || fallback;
  const paragraphs = text.split(/\n{2,}/);

  return paragraphs.map((paragraph, paragraphIndex) => {
    const lines = paragraph.split("\n");

    return (
      <p
        key={`${paragraph.slice(0, 24)}-${paragraphIndex}`}
        className="mb-6 last:mb-0"
      >
        {lines.map((line, lineIndex) => (
          <Fragment key={`${lineIndex}-${line.slice(0, 12)}`}>
            {renderLine(line)}
            {lineIndex < lines.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    );
  });
};

const readLecturasCache = (): LecturasCache | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as LecturasCache;
    if (
      !Array.isArray(parsed.liturgias) ||
      !Array.isArray(parsed.lectios) ||
      !Array.isArray(parsed.santos)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeLecturasCache = (cache: LecturasCache) => {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Si sessionStorage falla, la página sigue funcionando con memoria.
  }
};

const TabButton = ({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg px-4 py-2.5 text-sm font-bold transition ${
      active
        ? "bg-[#082347] text-white shadow-[0_8px_20px_-14px_rgba(8,35,71,0.9)]"
        : "text-[#071a33] hover:bg-white"
    }`}
  >
    {children}
  </button>
);

const LiturgicalStole = ({ color }: { color?: string }) => {
  const stole = getLiturgicalStoleValue(color);

  return (
    <span
      className="relative inline-flex h-5 w-3 shrink-0 items-center justify-center rounded-[3px] border"
      style={{
        backgroundColor: stole.background,
        borderColor: stole.border,
      }}
      aria-hidden="true"
    >
      <span
        className="absolute h-3 w-[2px] rounded-full"
        style={{ backgroundColor: stole.cross }}
      />
      <span
        className="absolute h-[2px] w-2 rounded-full"
        style={{ backgroundColor: stole.cross }}
      />
    </span>
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
      className="h-full w-full object-cover"
    />
  );
};

const ExpandableContentCard = ({
  id,
  title,
  subtitle,
  response,
  text,
  icon,
  expanded,
  onToggle,
  featured = false,
  renderLine,
}: {
  id: string;
  title: string;
  subtitle?: string;
  response?: string;
  text?: string;
  icon: ReactNode;
  expanded: boolean;
  onToggle: (id: string) => void;
  featured?: boolean;
  renderLine?: (line: string) => ReactNode;
}) => {
  if (!text && !response) return null;

  const canExpand = shouldCollapseText(text);
  const preview = canExpand ? compactText(text, 180) : "";

  return (
    <article
      className={`rounded-2xl border bg-white p-5 text-left shadow-[0_12px_32px_-28px_rgba(8,35,71,0.45)] transition ${
        featured ? "border-[#d4af37]" : "border-[#e6d8bf]"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-inner ${
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
        <p className="mt-5 text-left text-[17px] font-bold leading-[1.7] text-[#b17a12]">
          {response}
        </p>
      )}

      <div className="mt-5 text-left text-[17px] leading-[1.78] text-[#263349]">
        {expanded ? (
          renderPreservedText(text, "", renderLine)
        ) : !canExpand ? (
          renderPreservedText(text, "", renderLine)
        ) : (
          <p>
            {preview}
            <button
              type="button"
              onClick={() => onToggle(id)}
              className="ml-1 inline-flex font-extrabold text-[#c69222]"
            >
              Leer +
            </button>
          </p>
        )}
      </div>

      {expanded && canExpand && (
        <button
          type="button"
          onClick={() => onToggle(id)}
          className="mt-2 inline-flex font-extrabold text-[#c69222]"
        >
          Leer -
        </button>
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
  <aside
    className="hidden w-[238px] shrink-0 rounded-l-[28px] p-6 text-white shadow-[16px_0_44px_-36px_rgba(8,35,71,0.9)] md:block"
    style={{
      background:
        "linear-gradient(180deg, #04172e 0%, #082347 58%, #061a33 100%)",
    }}
  >
    <div className="mb-8 flex justify-center">
      <Logo size="lg" />
    </div>
    <nav className="space-y-2 text-sm">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-white/80 hover:bg-white/10"
      >
        <Home className="h-5 w-5" />
        <span className="font-semibold">Inicio</span>
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

const santoBaseFields = new Set([
  "fecha",
  "nombre",
  "titulo",
  "resumen",
  "historia",
  "lectura_espiritual",
  "imagen_url",
  "frase_destacada",
  "estado",
]);

const formatFieldTitle = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const SantoView = ({
  santo,
  expandedId,
  onToggle,
}: {
  santo: SantoDelDia | null;
  expandedId: string | null;
  onToggle: (id: string) => void;
}) => {
  if (!santo?.nombre) {
    return (
      <article className="rounded-2xl border border-[#e6d8bf] bg-white p-5 text-[#263349]">
        El santo del día estará disponible pronto.
      </article>
    );
  }

  const extraFields = Object.entries(santo).filter(([key, value]) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text && !santoBaseFields.has(key);
  });

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-[#e6d8bf] bg-white px-5 py-6 text-center shadow-[0_18px_46px_-34px_rgba(8,35,71,0.48)] sm:px-7 md:px-8 md:py-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#c69222]">
          Santo del Día
        </p>

        <div className="mt-5 grid items-center gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:text-left">
          <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border-4 border-[#c69222] bg-[#fff8ec] shadow-[0_18px_42px_-30px_rgba(8,35,71,0.7)] md:h-48 md:w-48">
            <SantoImage src={santo.imagen_url} alt={santo.nombre} />
          </div>

          <div className="min-w-0">
            <h2 className="font-display text-[34px] leading-tight text-[#082347] md:text-[44px]">
              {santo.nombre}
            </h2>
            {santo.titulo && (
              <p className="mt-1 text-lg font-semibold leading-snug text-[#263349] md:text-xl">
                {santo.titulo}
              </p>
            )}
            {santo.resumen && (
              <div className="mt-5 text-left text-[16px] leading-[1.75] text-[#263349] md:text-[18px] md:leading-[1.78]">
                {renderPreservedText(santo.resumen, "")}
              </div>
            )}
          </div>
        </div>

        {santo.frase_destacada && (
          <div className="mx-auto mt-6 max-w-xl rounded-xl border border-[#e6d8bf] bg-[#fffaf0] px-5 py-4 text-center text-[15px] font-extrabold leading-relaxed text-[#082347] shadow-[0_12px_34px_-30px_rgba(8,35,71,0.45)] md:ml-[244px] md:text-left md:text-[17px]">
            «{stripOuterQuotes(santo.frase_destacada)}»
          </div>
        )}
      </article>

      <ExpandableContentCard
        id="historia-santo"
        title="Historia"
        text={santo.historia}
        icon={<BookOpen className="h-5 w-5" />}
        expanded={expandedId === "historia-santo"}
        onToggle={onToggle}
      />
      <ExpandableContentCard
        id="lectura-espiritual-santo"
        title="Lectura espiritual"
        text={santo.lectura_espiritual}
        icon={<Sparkles className="h-5 w-5" />}
        expanded={expandedId === "lectura-espiritual-santo"}
        onToggle={onToggle}
      />
      {extraFields.map(([key, value]) => (
        <ExpandableContentCard
          key={key}
          id={`santo-${key}`}
          title={formatFieldTitle(key)}
          text={value}
          icon={<Sparkles className="h-5 w-5" />}
          expanded={expandedId === `santo-${key}`}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

const LecturasDelDia = () => {
  const [liturgia, setLiturgia] = useState<LiturgiaDia | null>(null);
  const [lectio, setLectio] = useState<LectioDivina | null>(null);
  const [santo, setSanto] = useState<SantoDelDia | null>(null);
  const [liturgias, setLiturgias] = useState<LiturgiaDia[]>([]);
  const [lectios, setLectios] = useState<LectioDivina[]>([]);
  const [santos, setSantos] = useState<SantoDelDia[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [activeTab, setActiveTab] = useState<LecturasTab>("liturgia");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const cached = readLecturasCache();

    if (cached?.liturgias.length) {
      const today = getTodayISO();
      const cachedToday =
        cached.liturgias.find((item) => item.fecha === today) ??
        cached.liturgias[cached.liturgias.length - 1];

      setLiturgias(cached.liturgias);
      setLectios(cached.lectios);
      setSantos(cached.santos);
      setSelectedDate(cachedToday.fecha);
      setLiturgia(cachedToday);
      setLectio(
        cached.lectios.find((item) => item.fecha === cachedToday.fecha) ?? null,
      );
      setSanto(
        cached.santos.find((item) => item.fecha === cachedToday.fecha) ?? null,
      );
      setLoading(false);
      setError(false);
    }

    Promise.all([
      getPublishedLiturgias(),
      getPublishedLectios(),
      getPublishedSantosDelDia(),
    ])
      .then(([liturgiasData, lectiosData, santosData]) => {
        if (!mounted) return;

        const today = getTodayISO();
        const initialLiturgia =
          liturgiasData.find((item) => item.fecha === today) ??
          liturgiasData[liturgiasData.length - 1] ??
          null;
        const initialDate = initialLiturgia?.fecha ?? today;

        setSelectedDate(initialDate);
        setLiturgia(initialLiturgia);
        setLectio(
          lectiosData.find((item) => item.fecha === initialDate) ?? null,
        );
        setSanto(
          santosData.find((item) => item.fecha === initialDate) ?? null,
        );
        setLiturgias(liturgiasData);
        setLectios(lectiosData);
        setSantos(santosData);
        writeLecturasCache({
          liturgias: liturgiasData,
          lectios: lectiosData,
          santos: santosData,
        });
        setError(!initialLiturgia && liturgiasData.length === 0);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const selectedLiturgia =
      liturgias.find((item) => item.fecha === selectedDate) ?? null;
    setLiturgia(selectedLiturgia);
    setLectio(lectios.find((item) => item.fecha === selectedDate) ?? null);
    setSanto(santos.find((item) => item.fecha === selectedDate) ?? null);
    setExpandedId(null);
  }, [lectios, liturgias, santos, selectedDate]);

  useEffect(() => {
    const updateProgress = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const selectedIndex = liturgias.findIndex(
    (item) => item.fecha === selectedDate,
  );

  const visibleDays = useMemo(() => {
    if (selectedIndex < 0) return liturgias.slice(-2);
    return liturgias.slice(
      Math.max(0, selectedIndex - 1),
      Math.min(liturgias.length, selectedIndex + 2),
    );
  }, [liturgias, selectedIndex]);

  const previousDate =
    selectedIndex > 0 ? liturgias[selectedIndex - 1]?.fecha : undefined;
  const nextDate =
    selectedIndex >= 0 && selectedIndex < liturgias.length - 1
      ? liturgias[selectedIndex + 1]?.fecha
      : undefined;

  const palabraHoy =
    liturgia?.palabra_hoy || "La Palabra para hoy estará disponible pronto.";
  const palabraHoyDisplay = loading
    ? "Cargando lecturas..."
    : `«${stripOuterQuotes(palabraHoy)}»`;
  const liturgicalLabel =
    liturgia?.celebracion || liturgia?.tiempo_liturgico || "Tiempo litúrgico";

  const selectDate = (fecha?: string) => {
    if (!fecha) return;
    setSelectedDate(fecha);
    window.requestAnimationFrame(() => {
      document
        .getElementById("lecturas-tabs")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const selectTab = (tab: LecturasTab) => {
    setActiveTab(tab);
    setExpandedId(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <main
      className="min-h-screen text-[#071a33]"
      style={{ backgroundColor: "#fff8ec" }}
    >
      <div
        className="fixed left-0 top-0 z-[998] h-1 bg-[#d4af37] transition-[width]"
        style={{ width: `${progress * 100}%` }}
      />

      <Link
        to="/"
        className="fixed left-[max(20px,env(safe-area-inset-left))] top-1/2 z-[999] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#082347] text-white shadow-[0_6px_18px_rgba(8,35,71,0.22)] transition hover:scale-95 hover:bg-[#0b2f5f] active:scale-95 md:inline-flex"
        aria-label="Volver al inicio"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <Link
        to="/"
        className="fixed left-[max(18px,env(safe-area-inset-left))] top-[max(1.75rem,env(safe-area-inset-top))] z-[999] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#082347] text-white shadow-[0_6px_18px_rgba(8,35,71,0.22)] transition active:scale-95 md:hidden"
        aria-label="Volver al inicio"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div
        className="mx-auto w-full md:px-5 md:py-8"
        style={{ maxWidth: "1240px" }}
      >
        <div className="md:flex md:overflow-hidden md:rounded-[28px] md:border md:border-[#e6d8bf] md:bg-white/70 md:shadow-[0_30px_90px_-70px_rgba(8,35,71,0.75)]">
          <DesktopSidebar activeTab={activeTab} onSelectTab={selectTab} />

          <section className="min-w-0 flex-1 px-4 pb-14 pt-7 sm:px-6 md:px-8 md:py-8">
            <header className="mx-auto max-w-[860px]">
              <div className="grid grid-cols-[52px_minmax(0,1fr)] items-start gap-3 md:block">
                <div className="h-12 w-12 md:hidden" aria-hidden="true" />
                <div className="min-w-0 pt-0.5 text-right md:pt-0 md:text-left">
                  <h1 className="flex w-full items-center justify-end gap-1.5 text-[13px] font-extrabold uppercase leading-tight tracking-[0.14em] text-[#c69222] md:justify-start md:text-left md:text-base md:tracking-[0.22em]">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Evangelio del Día</span>
                  </h1>
                  <p className="mt-1 text-right text-[13px] font-semibold capitalize leading-tight text-[#4f5663] md:mt-2 md:text-left md:text-[15px]">
                    {formatFecha(liturgia?.fecha)}
                  </p>
                </div>
              </div>

              {liturgias.length > 0 && (
                <div className="mt-12 flex items-center justify-center gap-3 md:mt-5">
                  <button
                    type="button"
                    onClick={() => selectDate(previousDate)}
                    disabled={!previousDate}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#082347] disabled:opacity-35"
                    aria-label="Día anterior"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <div className="flex items-center gap-2">
                    {visibleDays.map((item) => {
                      const date = formatDiaSelector(item.fecha);
                      const active = item.fecha === selectedDate;

                      return (
                        <button
                          key={item.fecha}
                          type="button"
                          onClick={() => selectDate(item.fecha)}
                          className={`flex flex-col items-center justify-center text-sm font-bold transition ${
                            active
                              ? "h-[48px] w-[38px] rounded-[4px] border border-[#d4af37] bg-[#fff8ec] text-[#082347] shadow-[0_10px_26px_-22px_rgba(8,35,71,0.8)] ring-1 ring-[#f0dfbf]"
                              : "h-[46px] w-[38px] rounded-md bg-transparent text-[#082347]"
                          }`}
                        >
                          <span
                            className={`text-xs capitalize leading-none ${
                              active ? "font-extrabold text-[#9b6d16]" : ""
                            }`}
                          >
                            {date.weekday}
                          </span>
                          <span
                            className={`mt-1 text-xl leading-none ${
                              active ? "font-extrabold text-[#c69222]" : ""
                            }`}
                          >
                            {date.day}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => selectDate(nextDate)}
                    disabled={!nextDate}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#082347] disabled:opacity-35"
                    aria-label="Día siguiente"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-[#082347]">
                <LiturgicalStole color={liturgia?.color_liturgico} />
                <span>{liturgicalLabel}</span>
              </div>
            </header>

            <section className="mx-auto mt-5 max-w-[860px] rounded-2xl border border-[#e6d8bf] bg-white px-5 py-4 text-center shadow-[0_18px_50px_-42px_rgba(8,35,71,0.55)] sm:px-6 sm:py-5 md:rounded-3xl md:p-8">
              <h2 className="mx-auto max-w-2xl text-[22px] font-extrabold leading-[1.18] text-[#082347] sm:text-[26px] md:text-[36px] md:leading-tight">
                {palabraHoyDisplay}
              </h2>
            </section>

            <nav
              id="lecturas-tabs"
              className="sticky top-3 z-30 mx-auto mt-5 grid max-w-[860px] scroll-mt-4 grid-cols-3 gap-1 rounded-xl bg-[#efe5d4] p-1 shadow-[0_12px_32px_-30px_rgba(8,35,71,0.35)]"
              aria-label="Secciones de lectura"
            >
              {(Object.keys(tabLabels) as LecturasTab[]).map((tab) => (
                <TabButton
                  key={tab}
                  active={activeTab === tab}
                  onClick={() => selectTab(tab)}
                >
                  {tabLabels[tab]}
                </TabButton>
              ))}
            </nav>

            {error && !loading && (
              <div className="mx-auto mt-5 max-w-[860px] rounded-2xl border border-[#d8c9ac] bg-white p-5 text-sm leading-relaxed text-[#263349]">
                Todavía no hay liturgia publicada para esta fecha.
              </div>
            )}

            <div className="mx-auto mt-5 max-w-[860px]">
              {activeTab === "liturgia" && (
                <div className="space-y-4">
                  <ExpandableContentCard
                    id="primera-lectura"
                    title="Primera Lectura"
                    subtitle={liturgia?.primera_lectura_cita}
                    text={liturgia?.primera_lectura_texto}
                    icon={<BookOpen className="h-5 w-5" />}
                    expanded={expandedId === "primera-lectura"}
                    onToggle={toggleExpanded}
                  />
                  <ExpandableContentCard
                    id="salmo-responsorial"
                    title="Salmo Responsorial"
                    subtitle={liturgia?.salmo_cita}
                    response={formatPsalmResponse(liturgia?.salmo_respuesta)}
                    text={liturgia?.salmo_texto}
                    icon={<Music2 className="h-5 w-5" />}
                    expanded={expandedId === "salmo-responsorial"}
                    onToggle={toggleExpanded}
                    renderLine={renderPsalmLine}
                  />
                  <ExpandableContentCard
                    id="segunda-lectura"
                    title="Segunda Lectura"
                    subtitle={liturgia?.segunda_lectura_cita}
                    text={liturgia?.segunda_lectura_texto}
                    icon={<BookOpen className="h-5 w-5" />}
                    expanded={expandedId === "segunda-lectura"}
                    onToggle={toggleExpanded}
                  />
                  <ExpandableContentCard
                    id="evangelio"
                    title="Evangelio"
                    subtitle={liturgia?.evangelio_cita}
                    text={liturgia?.evangelio_texto}
                    icon={<Cross className="h-5 w-5" />}
                    expanded={expandedId === "evangelio"}
                    onToggle={toggleExpanded}
                    featured
                  />
                </div>
              )}

              {activeTab === "santo" && (
                <SantoView
                  santo={santo}
                  expandedId={expandedId}
                  onToggle={toggleExpanded}
                />
              )}

              {activeTab === "reflexion" && (
                <div className="space-y-4">
                  <ExpandableContentCard
                    id="reflexion-lvj"
                    title="Reflexión LVJ"
                    subtitle="La Palabra de hoy para tu vida"
                    text={lectio?.reflexion}
                    icon={<Sparkles className="h-5 w-5" />}
                    expanded={expandedId === "reflexion-lvj"}
                    onToggle={toggleExpanded}
                  />
                  <ExpandableContentCard
                    id="pregunta-meditar"
                    title="Pregunta para Meditar"
                    text={lectio?.pregunta_meditar}
                    icon={<MessageCircleQuestion className="h-5 w-5" />}
                    expanded={expandedId === "pregunta-meditar"}
                    onToggle={toggleExpanded}
                  />
                  <ExpandableContentCard
                    id="oracion-final"
                    title="Oración"
                    text={lectio?.oracion}
                    icon={<Heart className="h-5 w-5" />}
                    expanded={expandedId === "oracion-final"}
                    onToggle={toggleExpanded}
                  />
                  <ExpandableContentCard
                    id="compromiso"
                    title="Compromiso"
                    text={lectio?.compromiso}
                    icon={<CheckCircle2 className="h-5 w-5" />}
                    expanded={expandedId === "compromiso"}
                    onToggle={toggleExpanded}
                  />
                  <ExpandableContentCard
                    id="mensaje-final"
                    title="Mensaje Final"
                    text={lectio?.mensaje_final}
                    icon={<Star className="h-5 w-5" />}
                    expanded={expandedId === "mensaje-final"}
                    onToggle={toggleExpanded}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LecturasDelDia;
