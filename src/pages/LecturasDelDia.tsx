import {
  BookOpen,
  CheckCircle2,
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
import { BottomNav } from "@/components/lvdj/BottomNav";
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

interface LecturasCache {
  liturgias: LiturgiaDia[];
  lectios: LectioDivina[];
  santos: SantoDelDia[];
}

const CACHE_KEY = "lvj_lecturas_publicadas_v14";

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
    return { day: fecha, weekday: "", month: "", year: "" };
  }

  return {
    day: date.toLocaleDateString("es-CO", { day: "2-digit" }),
    weekday: date
      .toLocaleDateString("es-CO", { weekday: "short" })
      .replace(".", ""),
    month: date
      .toLocaleDateString("es-CO", { month: "short" })
      .replace(".", ""),
    year: String(date.getFullYear()),
  };
};

const getWeekSelector = (fecha: string) => {
  const selected = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(selected.getTime())) return [];
  const mondayOffset = (selected.getDay() + 6) % 7;
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return {
      fecha: iso,
      label: ["L", "M", "X", "J", "V", "S", "D"][index],
      day: String(date.getDate()).padStart(2, "0"),
    };
  });
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

const gospelBooks: Record<string, string> = {
  Mt: "Mateo",
  Mc: "Marcos",
  Lc: "Lucas",
  Jn: "Juan",
};

const citationNumbers = (citation?: string) =>
  (citation ?? "").trim().replace(/^[^\d]+(?=\d)/u, "");

const proclamationLine = (text?: string) =>
  (text ?? "")
    .split(/\r?\n/)
    .slice(0, 4)
    .map((line) => line.trim())
    .find((line) => /^Lectura\s+(?:del|de la|de los|de las)\s+/iu.test(line));

const formatLiturgicalCitation = (
  kind: "reading" | "psalm" | "gospel",
  citation?: string,
  readingText?: string,
) => {
  const value = citation?.trim() ?? "";
  if (!value) return "";
  if (/^(?:De(?:l| la| los| las)?|Lectura|Del santo evangelio|Santo evangelio)/iu.test(value)) {
    return value;
  }
  if (kind === "psalm") return value.replace(/^Sal\s+/iu, "Salmo ");
  if (kind === "gospel") {
    const match = value.match(/^([1-3]?\s*[A-Za-zÁÉÍÓÚÑáéíóúñ]+)\s+(.+)$/u);
    const abbreviation = match?.[1]?.replace(/\s+/g, "") ?? "";
    const evangelist = gospelBooks[abbreviation];
    return evangelist && match ? `Del santo evangelio según san ${evangelist} ${match[2]}` : value;
  }
  const formula = proclamationLine(readingText);
  if (!formula) return value;
  const source = formula.replace(/^Lectura\s+/iu, "").replace(/[.:;]+$/u, "");
  const normalizedSource = source.charAt(0).toUpperCase() + source.slice(1);
  return `${normalizedSource} ${citationNumbers(value)}`.trim();
};
const findSantoForDate = (items: SantoDelDia[], fecha: string) =>
  items.find((item) => santoMatchesDate(item, fecha)) ?? null;

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

const ReflectionAudioCard = ({ audioUrl }: { audioUrl?: string }) => (
  <article className="rounded-2xl border border-[#e6d8bf] bg-white p-5 text-left shadow-[0_12px_32px_-28px_rgba(8,35,71,0.45)]">
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#082347] text-[#d4af37] shadow-inner">
        <Headphones className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-extrabold uppercase tracking-[0.14em] text-[#082347]">
          Audio
        </h2>
        <p className="mt-1 text-[15px] font-semibold text-[#c69222]">
          Escuchar reflexión
        </p>
      </div>
    </div>

    {audioUrl ? (
      <div className="mt-5 space-y-3">
        <audio controls preload="none" src={audioUrl} className="w-full">
          Tu navegador no permite reproducir este audio.
        </audio>
        <a
          href={audioUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-sm font-extrabold text-[#c69222]"
        >
          Abrir audio
        </a>
      </div>
    ) : (
      <p className="mt-5 text-[16px] leading-relaxed text-[#263349]">
        El audio de la reflexión estará disponible pronto.
      </p>
    )}
  </article>
);

type ReflectionContent = Pick<
  LectioDivina,
  | "reflexion"
  | "pregunta_meditar"
  | "oracion"
  | "compromiso"
  | "mensaje_final"
  | "audio_url"
>;

const buildReflectionContent = (
  lectio: LectioDivina | null,
  liturgia: LiturgiaDia | null,
): ReflectionContent => ({
  reflexion: lectio?.reflexion?.trim() || liturgia?.reflexion?.trim() || "",
  pregunta_meditar:
    lectio?.pregunta_meditar?.trim() ||
    liturgia?.pregunta_meditar?.trim() ||
    "",
  oracion: lectio?.oracion?.trim() || liturgia?.oracion?.trim() || "",
  compromiso: lectio?.compromiso?.trim() || liturgia?.compromiso?.trim() || "",
  mensaje_final:
    lectio?.mensaje_final?.trim() || liturgia?.mensaje_final?.trim() || "",
  audio_url: lectio?.audio_url?.trim() || liturgia?.audio_url?.trim() || "",
});

const hasReflectionContent = (content: ReflectionContent) =>
  Boolean(
    content.reflexion ||
      content.pregunta_meditar ||
      content.oracion ||
      content.compromiso ||
      content.mensaje_final,
  );

const ReflectionView = ({
  lectio,
  liturgia,
  expandedId,
  onToggle,
}: {
  lectio: LectioDivina | null;
  liturgia: LiturgiaDia | null;
  expandedId: string | null;
  onToggle: (id: string) => void;
}) => {
  const content = buildReflectionContent(lectio, liturgia);

  return (
    <div className="space-y-4">
      {!hasReflectionContent(content) && (
        <article className="rounded-2xl border border-[#e6d8bf] bg-white p-5 text-[#263349] shadow-[0_12px_32px_-28px_rgba(8,35,71,0.45)]">
          Todavía no hay reflexión publicada para esta fecha.
        </article>
      )}

      <ExpandableContentCard
        id="reflexion-lvj"
        title="Reflexión LVJ"
        subtitle="La Palabra de hoy para tu vida"
        text={content.reflexion}
        icon={<Sparkles className="h-5 w-5" />}
        expanded={expandedId === "reflexion-lvj"}
        onToggle={onToggle}
      />
      <ExpandableContentCard
        id="pregunta-meditar"
        title="Pregunta para Meditar"
        text={content.pregunta_meditar}
        icon={<MessageCircleQuestion className="h-5 w-5" />}
        expanded={expandedId === "pregunta-meditar"}
        onToggle={onToggle}
      />
      <ExpandableContentCard
        id="oracion-final"
        title="Oración"
        text={content.oracion}
        icon={<Heart className="h-5 w-5" />}
        expanded={expandedId === "oracion-final"}
        onToggle={onToggle}
      />
      <ExpandableContentCard
        id="compromiso"
        title="Compromiso"
        text={content.compromiso}
        icon={<CheckCircle2 className="h-5 w-5" />}
        expanded={expandedId === "compromiso"}
        onToggle={onToggle}
      />
      <ExpandableContentCard
        id="mensaje-final"
        title="Mensaje Final"
        text={content.mensaje_final}
        icon={<Star className="h-5 w-5" />}
        expanded={expandedId === "mensaje-final"}
        onToggle={onToggle}
      />
      <ReflectionAudioCard audioUrl={content.audio_url} />
    </div>
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

const santoContentSections: Array<{
  key: keyof Pick<
    SantoDelDia,
    | "lucha_que_enfrento"
    | "secreto_de_santidad"
    | "ensenanza_para_hoy"
    | "como_puedo_imitarlo"
    | "paso_concreto"
    | "oracion_intercesion"
  >;
  title: string;
}> = [
  { key: "lucha_que_enfrento", title: "La lucha que enfrentó" },
  { key: "secreto_de_santidad", title: "El secreto de su santidad" },
  { key: "ensenanza_para_hoy", title: "Enseñanza para hoy" },
  { key: "como_puedo_imitarlo", title: "Cómo puedo imitarlo" },
  { key: "paso_concreto", title: "Paso concreto para hoy" },
  { key: "oracion_intercesion", title: "Oración de intercesión" },
];

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

  const contentSections = santoContentSections.filter(({ key }) =>
    santo[key]?.trim(),
  );

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

      {contentSections.map(({ key, title }) => (
        <ExpandableContentCard
          key={key}
          id={`santo-${key}`}
          title={title}
          text={santo[key]}
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
  const [refreshNonce, setRefreshNonce] = useState(0);

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
      setSanto(findSantoForDate(cached.santos, cachedToday.fecha));
      setLoading(false);
      setError(false);
    }

    Promise.all([
      getPublishedLiturgias(true),
      getPublishedLectios(true),
      getPublishedSantosDelDia(true),
      getTodayLiturgia(getTodayISO(), true),
      getTodayLectio(getTodayISO(), true),
      getTodaySantoDelDia(getTodayISO(), true),
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

        const today = getTodayISO();
        const mergedLiturgias =
          todayLiturgia &&
          !liturgiasData.some((item) => item.fecha === todayLiturgia.fecha)
            ? [...liturgiasData, todayLiturgia].sort((a, b) =>
                a.fecha.localeCompare(b.fecha),
              )
            : liturgiasData;
        const mergedLectios =
          todayLectio &&
          !lectiosData.some((item) => item.fecha === todayLectio.fecha)
            ? [...lectiosData, todayLectio].sort((a, b) =>
                a.fecha.localeCompare(b.fecha),
              )
            : lectiosData;
        const mergedSantos =
          todaySanto &&
          !santosData.some((item) => santoMatchesDate(item, todaySanto.fecha))
            ? [...santosData, todaySanto]
            : santosData;
        const initialLiturgia =
          mergedLiturgias.find((item) => item.fecha === today) ??
          todayLiturgia ??
          mergedLiturgias[mergedLiturgias.length - 1] ??
          null;
        const initialDate = initialLiturgia?.fecha ?? today;

        setSelectedDate(initialDate);
        setLiturgia(initialLiturgia);
        setLectio(
          mergedLectios.find((item) => item.fecha === initialDate) ??
            (initialDate === today ? todayLectio : null),
        );
        setSanto(
          findSantoForDate(mergedSantos, initialDate) ??
            (initialDate === today ? todaySanto : null),
        );
        setLiturgias(mergedLiturgias);
        setLectios(mergedLectios);
        setSantos(mergedSantos);
        writeLecturasCache({
          liturgias: mergedLiturgias,
          lectios: mergedLectios,
          santos: mergedSantos,
        });
        setError(!initialLiturgia && mergedLiturgias.length === 0);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [refreshNonce]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        setRefreshNonce((value) => value + 1);
      }
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => document.removeEventListener("visibilitychange", refreshWhenVisible);
  }, []);

  useEffect(() => {
    const selectedLiturgia =
      liturgias.find((item) => item.fecha === selectedDate) ?? null;
    setLiturgia(selectedLiturgia);
    setLectio(lectios.find((item) => item.fecha === selectedDate) ?? null);
    setSanto(findSantoForDate(santos, selectedDate));
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

  const weekDays = useMemo(() => getWeekSelector(selectedDate), [selectedDate]);

  const palabraHoy =
    liturgia?.palabra_hoy?.trim() ||
    "La Palabra para hoy estará disponible pronto.";
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
      className="lvj-reading-page min-h-screen"
      style={{ backgroundColor: "#f7eedf" }}
    >
      <div
        className="fixed left-0 top-0 z-[998] h-1 bg-[#d4af37] transition-[width]"
        style={{ width: `${progress * 100}%` }}
      />

      <div
        className="mx-auto w-full md:px-5 md:py-8"
        style={{ maxWidth: "1240px" }}
      >
        <div className="md:flex md:overflow-hidden md:rounded-[28px] md:border md:border-[#e6d8bf] md:bg-white/70 md:shadow-[0_30px_90px_-70px_rgba(8,35,71,0.75)]">
          <DesktopSidebar activeTab={activeTab} onSelectTab={selectTab} />

          <section className="min-w-0 flex-1 px-4 pb-28 pt-5 text-[#071a33] sm:px-6 md:px-8 md:py-8">
            <header className="mx-auto max-w-[860px]">
              <div className="text-center md:text-left">
                <h1 className="flex items-center justify-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.18em] text-[#a56f08] md:justify-start md:text-base md:tracking-[0.22em]">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Liturgia del Día</span>
                </h1>
              </div>

              <div className="mt-5 border-y border-[#d7c39d] bg-[#fffdf8]/80 px-1 py-2 shadow-[0_10px_28px_-26px_rgba(8,35,71,0.55)] xl:rounded-xl xl:border xl:bg-[#fffdf8] xl:py-3 xl:shadow-sm">
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => {
                    const active = day.fecha === selectedDate;
                    const available = liturgias.some((item) => item.fecha === day.fecha);
                    return (
                      <button
                        key={day.fecha}
                        type="button"
                        disabled={!available}
                        aria-pressed={active}
                        aria-label={`${day.label} ${day.day}`}
                        onClick={() => selectDate(day.fecha)}
                        className={`mx-auto flex h-11 w-10 items-center justify-center rounded-md border text-[15px] transition xl:h-auto xl:min-h-[62px] xl:w-full xl:max-w-[48px] xl:flex-col xl:rounded-lg xl:text-sm disabled:cursor-not-allowed disabled:opacity-100 ${
                          active
                            ? "border-[#a56f08] bg-[#d4af37] font-extrabold text-[#071a33] shadow-md"
                            : available
                              ? "border-transparent bg-transparent font-extrabold text-[#082347] hover:border-[#c89a2b] hover:bg-[#fff4d8] xl:border-[#d8c9ac] xl:bg-white xl:font-bold"
                              : "border-transparent bg-transparent font-semibold text-[#657084] xl:border-[#e2d5bf] xl:bg-[#eee5d7]"
                        }`}
                      >
                        <span className="text-[15px] font-extrabold xl:text-xs xl:font-bold">
                          {day.label}
                        </span>
                        <span className="mt-1 hidden text-lg xl:block">{day.day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#ebe5dc] px-3 py-5 text-center xl:mt-5 xl:rounded-2xl xl:border xl:border-[#d7c39d] xl:bg-[#f2e9da]">
                <span className="inline-flex min-w-16 flex-col rounded-sm bg-[#082347] px-3 py-1.5 text-white shadow-lg">
                  <span className="text-xs font-bold capitalize leading-tight">{formatDiaSelector(selectedDate).weekday}</span>
                  <span className="text-2xl font-extrabold leading-none">{formatDiaSelector(selectedDate).day}</span>
                  <span className="mt-0.5 text-xs font-bold capitalize leading-tight text-[#f4cf68]">{formatDiaSelector(selectedDate).month}</span>
                </span>
                <div className="mt-1 text-xs font-bold text-[#3d4c61]">{formatDiaSelector(selectedDate).year}</div>
                <h2 className="mx-auto mt-4 max-w-3xl font-display text-[32px] leading-[1.08] text-[#082347] sm:text-[42px] xl:text-[54px]">{liturgicalLabel}</h2>
                <p className="mx-auto mt-3 inline-block border-b-2 border-[#c89a2b] pb-1 text-sm font-bold text-[#3d4c61]">Calendario litúrgico de Colombia</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[#082347]">
                  <LiturgicalStole color={liturgia?.color_liturgico} />
                  <span>{liturgia?.tiempo_liturgico || "Tiempo litúrgico"}</span>
                </div>
              </div>
            </header>

            <section className="mx-auto mt-5 max-w-[860px] rounded-2xl border-2 border-[#d7c39d] bg-[#fffdf8] px-5 py-4 text-center shadow-[0_18px_50px_-36px_rgba(8,35,71,0.65)] sm:px-6 sm:py-5 md:rounded-3xl md:p-8">
              <h2 className="mx-auto max-w-2xl text-[22px] font-extrabold leading-[1.18] text-[#082347] sm:text-[26px] md:text-[36px] md:leading-tight">
                {palabraHoyDisplay}
              </h2>
            </section>

            <nav
              id="lecturas-tabs"
              className="sticky top-3 z-30 mx-auto mt-5 grid max-w-[860px] scroll-mt-4 grid-cols-3 gap-1 rounded-xl border border-[#d7c39d] bg-[#e9dcc6] p-1 shadow-[0_12px_32px_-26px_rgba(8,35,71,0.5)]"
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
                    subtitle={formatLiturgicalCitation("reading", liturgia?.primera_lectura_cita, liturgia?.primera_lectura_texto)}
                    text={liturgia?.primera_lectura_texto}
                    icon={<BookOpen className="h-5 w-5" />}
                    expanded={expandedId === "primera-lectura"}
                    onToggle={toggleExpanded}
                  />
                  <ExpandableContentCard
                    id="salmo-responsorial"
                    title="Salmo Responsorial"
                    subtitle={formatLiturgicalCitation("psalm", liturgia?.salmo_cita)}
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
                    subtitle={formatLiturgicalCitation("reading", liturgia?.segunda_lectura_cita, liturgia?.segunda_lectura_texto)}
                    text={liturgia?.segunda_lectura_texto}
                    icon={<BookOpen className="h-5 w-5" />}
                    expanded={expandedId === "segunda-lectura"}
                    onToggle={toggleExpanded}
                  />
                  <ExpandableContentCard
                    id="evangelio"
                    title="Evangelio"
                    subtitle={formatLiturgicalCitation("gospel", liturgia?.evangelio_cita)}
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
                <ReflectionView
                  lectio={lectio}
                  liturgia={liturgia}
                  expandedId={expandedId}
                  onToggle={toggleExpanded}
                />
              )}

            </div>
          </section>
        </div>
      </div>
      <BottomNav activeLabel="Liturgia" />
    </main>
  );
};

export default LecturasDelDia;
