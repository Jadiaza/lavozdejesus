import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, Bell, BellRing, Bird, BookOpen, ChevronRight, Clock3, Cross, Download,
  HandHeart, Heart, Home, LoaderCircle, Menu, Moon, Play, RefreshCw, Search, Send, Settings,
  Shield, ShieldCheck, SlidersHorizontal, Sparkles, Sun, Volume2,
} from "lucide-react";
import liturgyHoursHero from "@/assets/liturgy-hours-hero.webp";
import PrayerFormatSheet from "../components/PrayerFormatSheet";
import { PrayerReader } from "../components/PrayerReader";
import { usePrayerPreferences } from "../hooks/usePrayerPreferences";
import { liturgyHoursService } from "../services/liturgyHoursService";
import type { LiturgyHourResponse, LiturgyParagraph } from "../types/liturgyHours";
import {
  prayerNotificationPermission,
  readPrayerReminders,
  requestPrayerNotificationPermission,
  savePrayerReminders,
  type PrayerReminder,
} from "../services/prayerReminderService";
import { prayerPushActive, sendPrayerPushTest, syncPrayerPush } from "../services/prayerPushService";
import { prayerLibraryService, type LibraryPrayer } from "../services/prayerLibraryService";

const GOLD = "text-[#efbd52]";

const tactileFeedback = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(10);
};

const recommendedLiturgyHour = () => {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    hour12: false,
  }).format(new Date()));

  if (hour < 5) return { code: "oficio", name: "Oficio de Lectura", description: "Escucha la Palabra de Dios y contempla con la Iglesia la enseñanza de la tradición." };
  if (hour < 9) return { code: "laudes", name: "Laudes", description: "Alaba a Dios con los salmos y el cántico de Zacarías, y consagra a Él toda tu jornada." };
  if (hour < 12) return { code: "tercia", name: "Tercia", description: "Invoca al Espíritu Santo con la salmodia y deja que la Palabra guíe tu mañana." };
  if (hour < 15) return { code: "sexta", name: "Sexta", description: "Detén tus labores, escucha la Palabra y renueva en Dios las fuerzas del mediodía." };
  if (hour < 18) return { code: "nona", name: "Nona", description: "Ora los salmos de la tarde y presenta al Señor el fruto y el cansancio de tu jornada." };
  if (hour < 21) return { code: "visperas", name: "Vísperas", description: "Da gracias con los salmos y el Magníficat por la obra que Dios realizó en este día." };
  return { code: "completas", name: "Completas", description: "Examina tu jornada, entona el cántico de Simeón y descansa bajo la protección de Dios." };
};

const categories = [
  ["Oraciones del cristiano", "cristiano", "🙏"], ["Santísima Trinidad", "trinidad", "♕"],
  ["Oraciones marianas", "marianas", "♙"], ["Santos y ángeles", "santos", "♙"],
  ["Devociones", "devociones", "♡"], ["Sanación interior", "sanacion", "✝"],
  ["Protección espiritual", "proteccion", "♢"], ["Renuncia y liberación", "liberacion", "🕊"],
  ["Examen y reconciliación", "reconciliacion", "♙"], ["Necesidades e intercesión", "intercesion", "♡"],
  ["Adoración", "adoracion", "☀"], ["Peticiones de oración", "peticion", "♙"],
] as const;

const hours = [
  ["oficio", "Oficio de Lectura", "04:00", BookOpen], ["laudes", "Laudes", "06:00", Sun],
  ["tercia", "Tercia", "09:00", Shield], ["sexta", "Sexta", "12:00", Bell],
  ["nona", "Nona", "15:00", Clock3], ["visperas", "Vísperas", "18:00", Sun],
  ["completas", "Completas", "21:00", Moon],
] as const;

function todayLabel() {
  return new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "long" }).format(new Date());
}

const Header = ({ title, back = true }: { title: string; back?: boolean }) => (
  <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b border-[#d8a740]/20 bg-[#050b12]/95 px-4 backdrop-blur">
    {back && <Link to="/oraciones" aria-label="Volver" className="absolute left-4 rounded-full p-2 text-[#efbd52]"><ArrowLeft /></Link>}
    <div className="text-center"><Sparkles className="mx-auto h-4 w-4 text-[#efbd52]" /><h1 className="text-sm font-bold uppercase tracking-wide text-[#f2c764]">{title}</h1></div>
  </header>
);

const PrayerHomeHeader = () => (
  <header className="relative flex h-[clamp(7.8rem,17.5dvh,9.3rem)] shrink-0 flex-col items-center justify-end overflow-hidden px-4 pb-[clamp(.65rem,1.5dvh,.9rem)] pt-3 text-center">
    <div className="pointer-events-none absolute left-1/2 top-4 h-28 w-56 -translate-x-1/2 rounded-full bg-[#d8a740]/[0.07] blur-3xl" />
    <div className="relative mb-2 flex h-10 w-10 items-center justify-center text-[#f2c34f]" aria-hidden="true">
      <span className="absolute h-12 w-12 rounded-full bg-[#efbd52]/[0.08] blur-md" />
      <Cross className="relative h-10 w-10 stroke-[1.45] drop-shadow-[0_0_10px_rgba(239,189,82,.45)]" />
      <span className="absolute left-0 top-4 h-px w-2.5 rotate-[28deg] bg-[#f2c34f]" />
      <span className="absolute right-0 top-4 h-px w-2.5 -rotate-[28deg] bg-[#f2c34f]" />
    </div>
    <h1 className="relative font-sans text-[clamp(1.25rem,5.8vw,1.55rem)] font-bold uppercase leading-none tracking-[0.075em] text-[#f4c64e] drop-shadow-[0_2px_8px_rgba(0,0,0,.7)]">Oraciones</h1>
    <p className="relative mt-2 text-[clamp(.78rem,3.5vw,.93rem)] font-medium leading-none text-[#f5f2eb]/95">Ora, medita y encuentra fortaleza</p>
  </header>
);

const PrayerNav = ({ active = "Oraciones" }: { active?: string }) => {
  const items = [[Home, "Inicio", "/"], [Bell, "Oraciones", "/oraciones"], [BookOpen, "Liturgia", "/oraciones/liturgia"], [Heart, "Favoritos", "/oraciones/mis-oraciones"], [Settings, "Ajustes", "/oraciones/recordatorios"]] as const;
  return <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto min-h-[4.4rem] max-w-[430px] border-t border-[#d8a740]/25 bg-[#061018]/98 px-2 pb-[max(.65rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur"><div className="flex justify-around">{items.map(([Icon, label, to]) => <Link key={label} to={to} onClick={tactileFeedback} className={`flex min-w-0 flex-1 flex-col items-center gap-1 text-[9px] font-medium transition active:scale-95 ${active === label ? GOLD : "text-white/70"}`}><Icon className="h-[20px] w-[20px]" strokeWidth={active === label ? 2.3 : 1.65} />{label}</Link>)}</div></nav>;
};

const Shell = ({ children, title, active, back }: { children: ReactNode; title: string; active?: string; back?: boolean }) => <div className="min-h-screen bg-[#050b12] text-[#f5f0e6]"><div className="mx-auto min-h-screen max-w-[520px] border-x border-white/5 bg-[radial-gradient(circle_at_top,rgba(197,139,35,.10),transparent_30%)]"><Header title={title} back={back} /><main className="px-4 pb-24 pt-4">{children}</main><PrayerNav active={active} /></div></div>;

export default function Oraciones() {
  const recommendedHour = recommendedLiturgyHour();
  const homeItems = [
    ["Oraciones del cristiano", "/oraciones/categoria/cristiano", HandHeart],
    ["Devociones", "/oraciones/categoria/devociones", Heart],
    ["Sanación y protección", "/oraciones/categoria/sanacion", ShieldCheck],
    ["Liberación", "/oraciones/categoria/liberacion", Bird],
  ] as const;

  return <div className="min-h-dvh bg-[#02080d] text-[#f5f0e6]">
    <div className="relative mx-auto flex h-dvh min-h-[36rem] w-full max-w-[430px] flex-col overflow-hidden border-x border-white/[0.04] bg-[radial-gradient(circle_at_50%_-8%,rgba(32,83,101,.21),transparent_34%),radial-gradient(circle_at_50%_68%,rgba(190,133,30,.055),transparent_36%),linear-gradient(180deg,#06131b_0%,#02080d_100%)] shadow-[0_0_45px_rgba(0,0,0,.65)]">
      <div aria-hidden="true" style={{ backgroundImage: `url(${liturgyHoursHero})`, backgroundSize: "auto 64dvh", backgroundPosition: "right top" }} className="pointer-events-none absolute inset-x-0 top-0 h-[74dvh] bg-no-repeat opacity-90" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,9,14,.78)_0%,rgba(2,8,12,.28)_22%,rgba(2,8,12,.40)_46%,#02080d_72%,#02080d_100%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(1,6,9,.83)_0%,rgba(2,7,10,.48)_50%,rgba(2,7,10,.12)_100%)]" />
      <PrayerHomeHeader />
      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-[0.9rem] pb-[5.35rem]">
        <Link to={`/oraciones/liturgia/${recommendedHour.code}`} onClick={tactileFeedback} className="group relative block h-[clamp(14.5rem,38dvh,18.5rem)] shrink-0 transition active:scale-[.992]">
          <span className="absolute right-0 top-1 z-10 rounded-full border border-[#f1c34a]/50 bg-[#171109]/65 px-3 py-1.5 text-[9px] font-semibold tracking-wide text-[#f8d86e] shadow-[0_4px_14px_rgba(0,0,0,.35)] backdrop-blur-md">Ahora · {recommendedHour.name}</span>
          <div className="relative z-10 flex h-full max-w-[94%] translate-y-[clamp(2rem,5dvh,3.25rem)] flex-col justify-end pb-0">
            <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[.24em] text-[#efbd52]">Liturgia de las Horas</p>
            <h2 className="font-display text-[clamp(2.35rem,10vw,3rem)] font-semibold leading-[.92] tracking-[-.03em] text-[#f8d575] drop-shadow-[0_3px_9px_rgba(0,0,0,.95)]">{recommendedHour.name}</h2>
            <p className="mt-2.5 max-w-[21rem] text-[clamp(.82rem,3.7vw,1rem)] font-medium leading-[1.45] text-white/92 drop-shadow-[0_2px_6px_rgba(0,0,0,.95)]">{recommendedHour.description}</p>
            <span className="mt-3.5 inline-flex h-[clamp(2.55rem,5.8dvh,3rem)] w-full max-w-[20rem] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#ffe083] via-[#f2c64e] to-[#daa029] px-[clamp(1.05rem,4.7vw,1.45rem)] text-[clamp(.72rem,3.2vw,.84rem)] font-extrabold text-[#17120a] shadow-[0_10px_24px_rgba(215,155,35,.27)] transition group-active:scale-[.98]">REZAR {recommendedHour.name.toUpperCase()} <ChevronRight className="h-5 w-5" strokeWidth={2.5} /></span>
          </div>
        </Link>

        <div className="mt-auto grid grid-cols-2 gap-2.5 pt-2">{homeItems.map(([label, to, Icon]) => <Link key={label} to={to} onClick={tactileFeedback} className="group relative flex min-h-[clamp(3.8rem,8.7dvh,4.55rem)] items-center gap-2.5 overflow-hidden rounded-[0.85rem] border border-[#2b3b44] bg-[linear-gradient(145deg,rgba(18,33,42,.94)_0%,rgba(9,19,26,.96)_100%)] px-[clamp(.7rem,3.5vw,.95rem)] py-2 shadow-[inset_0_1px_0_rgba(255,255,255,.035),0_7px_18px_rgba(0,0,0,.28)] backdrop-blur-md transition hover:border-[#d8a740]/55 active:scale-[.975]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8a740]/25 bg-[#d8a740]/[0.07]"><Icon className="h-6 w-6 text-[#f2c544] transition group-hover:drop-shadow-[0_0_8px_rgba(241,195,61,.4)]" strokeWidth={1.8} /></span><span className="min-w-0 text-[clamp(.66rem,3vw,.79rem)] font-semibold leading-[1.16] text-white/95">{label}</span></Link>)}</div>
      </main>
      <PrayerNav active="Inicio" />
    </div>
  </div>;
}

export function LiturgiaHoras() {
  return <Shell title="Liturgia de las Horas" active="Liturgia"><div className="mb-4 text-center"><p className="text-sm font-semibold capitalize">{todayLabel()}</p><div className="mt-3 flex justify-center"><span className="rounded-full bg-emerald-900/60 px-4 py-1 text-[11px] text-emerald-200">Liturgia del día</span></div></div>
    <div className="space-y-2">{hours.map(([id, name, time, Icon]) => <Link key={id} to={`/oraciones/liturgia/${id}`} className="flex items-center rounded-xl border border-white/10 bg-[#111b23] px-4 py-3"><Icon className="mr-3 h-5 w-5 text-[#efbd52]" /><span className="flex-1"><b className="block text-sm">{name}</b><small className="text-white/55">{time}</small></span><ChevronRight className="h-5 w-5" /></Link>)}</div>
    <p className="mt-4 text-center text-[10px] text-white/45">Contenido diario ofrecido por Liturgia de las Horas</p>
  </Shell>;
}

export function LiturgiaReader() {
  const { hora = "laudes" } = useParams();
  const data = hours.find((item) => item[0] === hora) ?? hours[1];
  const [content, setContent] = useState<LiturgyHourResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [formatOpen, setFormatOpen] = useState(false);
  const { preferences, update, reset } = usePrayerPreferences();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    liturgyHoursService.getHour(hora, undefined, controller.signal)
      .then(setContent)
      .catch((reason) => { if (reason?.name !== "AbortError") setError("No fue posible cargar esta hora litúrgica. Comprueba tu conexión e inténtalo nuevamente."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [hora, reload]);

  const paragraphClass = (paragraph: LiturgyParagraph) => {
    if (paragraph.tipo === "antifona") return "font-semibold text-[var(--prayer-accent)]";
    if (paragraph.tipo === "respuesta") return "pl-3 font-semibold text-[var(--prayer-accent)]";
    if (paragraph.tipo === "rubrica") return "text-sm italic text-[var(--prayer-accent)] opacity-80";
    if (paragraph.tipo === "subtitulo") return "font-semibold uppercase tracking-wide text-[var(--prayer-accent)]";
    return "";
  };

  return <Shell title={data[1]} active="Liturgia">
    <div className="-mt-2 mb-4 flex items-center justify-between gap-3"><div><p className="text-xs capitalize text-white/65">{content?.fecha_texto || todayLabel()}</p>{content ? <p className="mt-1 text-[10px] uppercase tracking-wider text-[#efbd52]">{content.celebracion}</p> : null}</div><button type="button" onClick={() => setFormatOpen(true)} className="flex items-center gap-2 rounded-full border border-[#d8a740]/50 bg-[#111b23] px-3 py-2 text-xs font-semibold text-[#efbd52]"><SlidersHorizontal className="h-4 w-4" />Aa</button></div>

    {loading ? <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0c151d]"><LoaderCircle className="h-8 w-8 animate-spin text-[#efbd52]" /><p className="mt-3 text-sm text-white/65">Preparando la oración de la Iglesia…</p></div> : null}
    {!loading && error ? <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-red-400/25 bg-[#0c151d] p-6 text-center"><AlertCircle className="h-9 w-9 text-[#efbd52]" /><p className="mt-3 text-sm text-white/75">{error}</p><button type="button" onClick={() => setReload((value) => value + 1)} className="mt-5 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f6d574] to-[#d49a28] px-5 py-3 text-xs font-bold text-black"><RefreshCw className="h-4 w-4" />REINTENTAR</button></div> : null}
    {!loading && content ? <PrayerReader preferences={preferences}>
      <div className="mb-6 border-b border-current/15 pb-4 text-left"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--prayer-accent)]">{content.tiempo_liturgico}</p><h2 className="mt-2 text-xl font-bold">{content.celebracion}</h2>{content.detalle ? <p className="mt-1 text-sm opacity-65">{content.detalle}</p> : null}</div>
      <div className="space-y-8">{content.secciones.map((section, index) => <section key={`${section.tipo}-${index}`}><h3 className="mb-3 border-b border-current/10 pb-2 text-left text-lg font-bold text-[var(--prayer-accent)]">{section.titulo}</h3><div className="space-y-3">{section.contenido.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className={paragraphClass(paragraph)}>{paragraph.texto}</p>)}</div></section>)}</div>
      <footer className="mt-8 border-t border-current/15 pt-4 text-center text-xs opacity-60">Fuente: {content.fuente.nombre} · Presentado por LVJPRAYER</footer>
    </PrayerReader> : null}

    <PrayerFormatSheet open={formatOpen} preferences={preferences} onChange={update} onReset={reset} onClose={() => setFormatOpen(false)} />
  </Shell>;
}

export function OracionCategorias() {
  return <Shell title="Categorías"><div className="grid grid-cols-3 gap-2">{categories.map(([label, id, icon]) => <Link key={id} to={id === "peticion" ? "/oraciones/peticion" : `/oraciones/categoria/${id}`} className="flex aspect-square flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111b23] p-2 text-center"><span className="text-3xl text-[#efbd52]">{icon}</span><span className="mt-2 text-[9px] font-semibold leading-tight">{label}</span></Link>)}</div></Shell>;
}

export function OracionLista() {
  const { categoria = "cristiano" } = useParams();
  const [searchParams] = useSearchParams();
  const subcategory = searchParams.get("subcategoria") || "";
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LibraryPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    prayerLibraryService.list(categoria, controller.signal, subcategory)
      .then(setItems)
      .catch((reason) => { if (reason?.name !== "AbortError") setError("No fue posible cargar esta biblioteca de oraciones."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [categoria, subcategory]);
  const filtered = items.filter((prayer) => `${prayer.titulo} ${prayer.subtitulo}`.toLowerCase().includes(query.toLowerCase()));
  const title = subcategory || prayerLibraryService.categoryName(categoria);
  const christianSections = [
    ["Oraciones fundamentales", "Las plegarias esenciales de nuestra fe", Cross],
    ["Mañana y ofrecimiento", "Consagra a Dios el comienzo de tu jornada", Sun],
    ["Noche y descanso", "Agradece, examina tu día y descansa en el Señor", Moon],
    ["Fe, confianza y discernimiento", "Entrégate a Dios y busca su voluntad", BookOpen],
    ["Familia y relaciones", "Presenta ante Dios a quienes amas", Heart],
    ["Intercesión", "Ora por la Iglesia y por las necesidades del mundo", HandHeart],
    ["Momentos y necesidades", "Encuentra una oración para cada circunstancia", ShieldCheck],
  ] as const;
  if (categoria === "cristiano" && !subcategory) return <Shell title="Oraciones del cristiano"><p className="-mt-1 mb-5 text-center text-xs text-white/60">Oraciones para vivir cada jornada en la presencia de Dios</p><div className="space-y-3">{christianSections.map(([name, description, Icon]) => <Link key={name} to={`/oraciones/categoria/cristiano?subcategoria=${encodeURIComponent(name)}`} className="group flex min-h-[5.5rem] items-center rounded-2xl border border-[#d8a740]/35 bg-[linear-gradient(135deg,#12202a,#0b151d)] p-4 shadow-[0_8px_18px_rgba(0,0,0,.24)] active:scale-[.985]"><span className="mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d8a740]/35 bg-[#d8a740]/10"><Icon className="h-6 w-6 text-[#efbd52]" strokeWidth={1.7} /></span><span className="min-w-0 flex-1"><b className="block text-sm text-white/95">{name}</b><small className="mt-1 block text-[10px] leading-relaxed text-white/50">{description}</small></span><ChevronRight className="ml-2 h-5 w-5 shrink-0 text-[#efbd52]" /></Link>)}</div></Shell>;
  return <Shell title={title}><div className="mb-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#121c24] px-3"><Search className="h-4 w-4 text-white/50" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una oración" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>{loading ? <div className="flex min-h-48 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-[#efbd52]" /></div> : null}{error ? <div className="rounded-xl border border-red-400/25 bg-[#111b23] p-5 text-center text-sm text-white/70">{error}</div> : null}{!loading && !error && filtered.length === 0 ? <div className="rounded-xl border border-white/10 bg-[#111b23] p-6 text-center text-sm text-white/60">Esta sección está preparada para recibir nuevas oraciones.</div> : null}<div className="space-y-3">{filtered.map((prayer) => <Link key={prayer.id} to={`/oraciones/oracion/${prayer.id}`} className="flex items-center rounded-xl border border-white/10 bg-[#111b23] p-4"><HandHeart className="mr-3 h-6 w-6 text-[#efbd52]" /><span className="min-w-0 flex-1"><b className="block text-sm">{prayer.titulo}</b>{prayer.subtitulo ? <small className="mt-1 block text-[10px] text-white/50">{prayer.subtitulo}</small> : null}</span><ChevronRight className="h-5 w-5 text-[#efbd52]" /></Link>)}</div></Shell>;
}

export function OracionDetalle() {
  const { id = "" } = useParams();
  const [prayer, setPrayer] = useState<LibraryPrayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formatOpen, setFormatOpen] = useState(false);
  const { preferences, update, reset } = usePrayerPreferences();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    prayerLibraryService.get(id, controller.signal)
      .then(setPrayer)
      .catch((reason) => { if (reason?.name !== "AbortError") setError("No fue posible abrir esta oración."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);
  return <Shell title={prayer?.titulo || "Oración"}>{loading ? <div className="flex min-h-64 items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#efbd52]" /></div> : null}{error ? <div className="rounded-xl border border-red-400/25 bg-[#111b23] p-6 text-center text-sm text-white/70">{error}</div> : null}{prayer ? <><div className="mb-3 flex items-center justify-between gap-3"><div>{prayer.subtitulo ? <p className="text-xs text-white/60">{prayer.subtitulo}</p> : null}</div><button type="button" onClick={() => setFormatOpen(true)} className="flex shrink-0 items-center gap-2 rounded-full border border-[#d8a740]/50 bg-[#111b23] px-3 py-2 text-xs font-semibold text-[#efbd52]"><SlidersHorizontal className="h-4 w-4" />Aa</button></div><PrayerReader preferences={preferences}><div className="whitespace-pre-line">{prayer.texto_completo}</div></PrayerReader><div className="mt-5 flex justify-between"><Heart className="text-[#efbd52]" />{prayer.audio_url ? <a href={prayer.audio_url} className="rounded-full bg-[#efbd52] p-3 text-black"><Play className="h-5 w-5 fill-current" /></a> : <span />}<Send /></div><div className="mt-6 text-xs"><b>Fuente</b><p className="mt-1 text-white/60">{prayer.fuente}{prayer.pagina_fuente ? ` · p. ${prayer.pagina_fuente}` : ""}</p></div></> : null}<PrayerFormatSheet open={formatOpen} preferences={preferences} onChange={update} onReset={reset} onClose={() => setFormatOpen(false)} /></Shell>;
}

export function DevocionesPage() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof prayerLibraryService.devotions>>>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { const controller = new AbortController(); prayerLibraryService.devotions(controller.signal).then(setItems).catch(() => setItems([])); return () => controller.abort(); }, []);
  const fallback = [
    ["san-jose", "San José", "Custodio de Jesús y protector de las familias", "SJ"],
    ["sangre-de-cristo", "Sangre de Cristo", "Redención, entrega y protección en Cristo", "SC"],
    ["san-miguel-arcangel", "San Miguel Arcángel", "Fidelidad a Dios y protección espiritual", "SM"],
    ["maria-santisima", "María Santísima", "Madre de Jesús y Madre de la Iglesia", "M"],
    ["espiritu-santo", "Espíritu Santo", "Luz, consuelo y renovación interior", "ES"],
    ["sagrado-corazon-de-jesus", "Sagrado Corazón de Jesús", "Amor, reparación y consagración", "SCJ"],
    ["santisimo-sacramento", "Santísimo Sacramento", "Adoración y encuentro con Jesús Eucaristía", "IHS"],
    ["divina-misericordia", "Divina Misericordia", "Confianza en el amor misericordioso de Jesús", "DM"],
  ].map(([slug, titulo, subtitulo, monogram]) => ({ id: "", slug, titulo, subtitulo, imagen: "", total_oraciones: 0, monogram }));
  const cards = (items.length ? items.map((item) => ({ ...item, monogram: item.titulo.split(" ").map((word) => word[0]).join("").slice(0, 3) })) : fallback)
    .filter((item) => item.titulo.toLowerCase().includes(query.toLowerCase()));
  return <Shell title="Devociones"><p className="-mt-1 mb-4 text-center text-xs text-white/60">Camina junto a Dios de la mano de los santos</p><div className="mb-5 flex items-center gap-3 rounded-full border border-white/15 bg-[#101b24] px-4"><Search className="h-5 w-5 text-white/55" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una devoción" className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><div className="grid grid-cols-2 gap-3">{cards.map((item) => <Link key={item.slug} to={`/oraciones/devociones/${item.slug}`} className="group overflow-hidden rounded-2xl border border-[#d8a740]/65 bg-[#0d1922] shadow-[0_8px_20px_rgba(0,0,0,.28)] active:scale-[.98]">{item.imagen ? <img src={item.imagen} alt="" className="aspect-[1.2] w-full object-cover" /> : <div className="flex aspect-[1.2] items-center justify-center bg-[radial-gradient(circle_at_50%_38%,rgba(239,189,82,.36),rgba(8,19,27,.3)_42%,#08131b_78%)]"><span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#efbd52]/55 font-display text-xl text-[#f4cf70] shadow-[0_0_30px_rgba(239,189,82,.18)]">{item.monogram}</span></div>}<div className="min-h-[6.2rem] p-3"><div className="flex items-start gap-1"><h2 className="flex-1 text-sm font-bold leading-tight">{item.titulo}</h2><ChevronRight className="h-5 w-5 shrink-0 text-[#efbd52]" /></div><p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-white/55">{item.subtitulo}</p><p className="mt-2 text-[9px] font-semibold text-[#efbd52]/85">{item.total_oraciones ? `${item.total_oraciones} oraciones` : "Rosario · Oraciones · Novena"}</p></div></Link>)}</div></Shell>;
}

export function DevocionDetalle() {
  const { slug = "" } = useParams();
  const [items, setItems] = useState<LibraryPrayer[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const controller = new AbortController(); setLoading(true); prayerLibraryService.devotion(slug, controller.signal).then(setItems).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [slug]);
  const title = slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  return <Shell title={title}>{loading ? <div className="flex min-h-48 items-center justify-center"><LoaderCircle className="h-7 w-7 animate-spin text-[#efbd52]" /></div> : items.length ? <div className="space-y-3">{items.map((prayer) => <Link key={prayer.id} to={`/oraciones/oracion/${prayer.id}`} className="flex items-center rounded-xl border border-white/10 bg-[#111b23] p-4"><HandHeart className="mr-3 h-6 w-6 text-[#efbd52]" /><span className="min-w-0 flex-1"><b className="block text-sm">{prayer.titulo}</b><small className="mt-1 block text-[10px] text-white/50">{prayer.subtitulo}</small></span><ChevronRight className="h-5 w-5 text-[#efbd52]" /></Link>)}</div> : <div className="rounded-2xl border border-[#d8a740]/25 bg-[#111b23] p-7 text-center text-sm text-white/60">Esta colección está preparada para recibir sus oraciones, rosarios, letanías y novenas.</div>}</Shell>;
}

export function MisOraciones() {
  return <Shell title="Mis oraciones" active="Favoritos"><div className="mb-4 grid grid-cols-3 rounded-xl bg-[#111b23] p-1 text-center text-xs"><span className="rounded-lg bg-[#efd078] px-2 py-3 font-bold text-black">Favoritas</span><span className="px-2 py-3">Descargadas</span><span className="px-2 py-3">Recientes</span></div><div className="rounded-xl border border-white/10 bg-[#111b23] p-6 text-center text-sm text-white/60">Tus oraciones guardadas aparecerán aquí.</div></Shell>;
}

export function PeticionOracion() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); setSent(true); };
  return <Shell title="Petición de oración"><div className="text-center"><Bell className="mx-auto h-10 w-10 text-[#efbd52]" /><p className="mt-4 text-xs">Tu intención será tratada con respeto<br />y confidencialidad</p></div>{sent ? <div className="mt-8 rounded-2xl border border-[#d8a740]/40 bg-[#111b23] p-6 text-center"><Heart className="mx-auto text-[#efbd52]" /><h2 className="mt-3 font-semibold">Hemos recibido tu intención</h2><p className="mt-2 text-xs text-white/60">Vista de demostración; la conexión con el servicio se programará después.</p></div> : <form onSubmit={submit} className="mt-6 space-y-3"><input placeholder="Nombre (opcional)" className="h-12 w-full rounded-xl border border-white/15 bg-[#111b23] px-4 text-sm outline-none" /><textarea required maxLength={500} placeholder="Escribe tu intención" className="h-36 w-full rounded-xl border border-white/15 bg-[#111b23] p-4 text-sm outline-none" /><label className="flex items-center gap-2 text-xs"><input type="checkbox" /> Publicar de forma anónima</label><button className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f6d574] to-[#d49a28] py-4 text-xs font-bold text-black">ENVIAR INTENCIÓN <Send className="h-4 w-4" /></button></form>}</Shell>;
}

export function PrayerReminders() {
  const [reminders, setReminders] = useState<PrayerReminder[]>(readPrayerReminders);
  const [permission, setPermission] = useState(prayerNotificationPermission);
  const [message, setMessage] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const saved = readPrayerReminders();
    if (prayerNotificationPermission() !== "granted" || !saved.some(({ enabled }) => enabled)) return;

    let active = true;
    setSyncing(true);
    void syncPrayerPush(saved)
      .catch(() => {
        if (active) setMessage("Tus horarios siguen guardados. Abre esta pantalla con conexión para completar Web Push.");
      })
      .finally(() => {
        if (active) setSyncing(false);
      });

    return () => { active = false; };
  }, []);

  const toggleReminder = async (id: PrayerReminder["id"]) => {
    const reminder = reminders.find((item) => item.id === id);
    if (!reminder) return;

    if (!reminder.enabled) {
      const result = permission === "granted"
        ? permission
        : await requestPrayerNotificationPermission();
      setPermission(result);
      if (result !== "granted") {
        setMessage(result === "unsupported"
          ? "Este dispositivo no admite notificaciones web."
          : "Debes permitir las notificaciones para activar el recordatorio.");
        return;
      }
    }

    const next = reminders.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item,
    );
    setReminders(next);
    savePrayerReminders(next);
    setSyncing(true);
    try {
      await syncPrayerPush(next);
      setMessage(!reminder.enabled
        ? `${reminder.title} quedó programado para las ${reminder.time}, incluso con la app cerrada.`
        : `Recordatorio de ${reminder.title} desactivado.`);
    } catch (error) {
      setMessage(`${error instanceof Error ? error.message : "No fue posible activar Web Push."} El recordatorio local quedará como respaldo mientras la app esté abierta.`);
    } finally {
      setSyncing(false);
    }
  };

  const testNotification = async () => {
    setSyncing(true);
    try {
      const result = await sendPrayerPushTest();
      setMessage(result.message || "Notificación de prueba enviada.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible enviar la prueba.");
    } finally {
      setSyncing(false);
    }
  };

  const webPushEnabled = permission === "granted"
    && reminders.some(({ enabled }) => enabled)
    && prayerPushActive();

  return <Shell title="Recordatorios" active="Ajustes">
    <section className="rounded-2xl border border-[#d8a740]/30 bg-[radial-gradient(circle_at_top,rgba(216,167,64,.14),transparent_65%),#0d1720] p-5 text-center">
      <BellRing className="mx-auto h-10 w-10 text-[#efbd52]" strokeWidth={1.6} />
      <h2 className="mt-3 font-serif text-xl text-[#f6d676]">Un momento para encontrarte con Dios</h2>
      <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/65">Activa únicamente los momentos que desees. Incluye las siete horas litúrgicas y devociones en horario de Colombia.</p>
    </section>

    {message ? <p role="status" className="mt-4 rounded-xl border border-[#d8a740]/25 bg-[#d8a740]/10 px-4 py-3 text-xs leading-relaxed text-[#f6d676]">{message}</p> : null}

    <div className="mt-4 flex items-center gap-3"><span className="h-px flex-1 bg-[#d8a740]/20" /><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#efbd52]">Liturgia y devociones</p><span className="h-px flex-1 bg-[#d8a740]/20" /></div>

    <div className="mt-3 space-y-3">
      {reminders.map((reminder) => <article key={reminder.id} className={`rounded-2xl border p-4 transition ${reminder.enabled ? "border-[#d8a740]/65 bg-[#d8a740]/[0.09]" : "border-white/10 bg-[#101a22]"}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${reminder.enabled ? "bg-[#efbd52] text-black" : "bg-white/[0.06] text-[#efbd52]"}`}><Bell className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white">{reminder.title}</h3>
            <p className="mt-0.5 text-xs font-semibold text-[#efbd52]">Todos los días · {reminder.time}</p>
          </div>
          <button disabled={syncing} type="button" role="switch" aria-checked={reminder.enabled} aria-label={`${reminder.enabled ? "Desactivar" : "Activar"} recordatorio de ${reminder.title}`} onClick={() => void toggleReminder(reminder.id)} className={`relative h-7 w-12 shrink-0 rounded-full border transition disabled:opacity-50 ${reminder.enabled ? "border-[#efbd52] bg-[#efbd52]" : "border-white/20 bg-white/10"}`}><span className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-white shadow transition-transform ${reminder.enabled ? "translate-x-[1.35rem]" : "translate-x-0.5"}`} /></button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/55">{reminder.description}</p>
      </article>)}
    </div>

    {webPushEnabled ? <button type="button" disabled={syncing} onClick={() => void testNotification()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#efbd52]/60 bg-[#efbd52]/10 py-3 text-xs font-bold text-[#f6d676] disabled:cursor-not-allowed disabled:opacity-40">
      <BellRing className="h-4 w-4" /> {syncing ? "ENVIANDO…" : "PROBAR NOTIFICACIÓN"}
    </button> : null}

    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[11px] leading-relaxed text-white/50">
      <p className="font-semibold text-white/70">Importante</p>
      <p className="mt-1">Instala LVJPRAYER y autoriza las notificaciones. Web Push permite recibir los avisos seleccionados aunque la aplicación esté cerrada. En algunos teléfonos también debes permitir las notificaciones en los ajustes de Android.</p>
    </div>
  </Shell>;
}
