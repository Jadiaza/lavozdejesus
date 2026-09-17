import { FormEvent, ReactNode, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Bell, BookOpen, ChevronRight, Clock3, Cross, Download,
  ExternalLink, Heart, Home, Menu, Moon, Play, Search, Send, Settings,
  Shield, Sparkles, Sun, Volume2,
} from "lucide-react";
import cathedralBg from "@/assets/cathedral-bg.jpg";

const GOLD = "text-[#efbd52]";

const categories = [
  ["Oraciones del cristiano", "cristiano", "🙏"], ["Santísima Trinidad", "trinidad", "♕"],
  ["Oraciones marianas", "marianas", "♙"], ["Santos y ángeles", "santos", "♙"],
  ["Devociones", "devociones", "♡"], ["Sanación interior", "sanacion", "✝"],
  ["Protección espiritual", "proteccion", "♢"], ["Renuncia y liberación", "liberacion", "🕊"],
  ["Examen y reconciliación", "reconciliacion", "♙"], ["Necesidades e intercesión", "intercesion", "♡"],
  ["Adoración", "adoracion", "☀"], ["Peticiones de oración", "peticion", "♙"],
] as const;

const prayers = [
  { id: "ofrecimiento", title: "Ofrecimiento del día", icon: Bell },
  { id: "manana", title: "Oración de la mañana", icon: Sun },
  { id: "noche", title: "Oración de la noche", icon: Moon },
  { id: "contricion", title: "Acto de contrición", icon: Bell },
];

const hours = [
  ["oficio", "Oficio de Lectura", "04:00", BookOpen], ["laudes", "Laudes", "06:00", Sun],
  ["tercia", "Tercia", "09:00", Shield], ["sexta", "Sexta", "12:00", Bell],
  ["nona", "Nona", "15:00", Clock3], ["visperas", "Vísperas", "18:00", Sun],
  ["completas", "Completas", "21:00", Moon],
] as const;

const prayersText: Record<string, { title: string; text: string; source: string }> = {
  manana: { title: "Oración de la mañana", text: "Señor, en el silencio de este día que nace, me presento ante ti con un corazón agradecido. Te ofrezco mis pensamientos, mis palabras y mis obras. Dame la luz de tu Espíritu para caminar en tu voluntad. Que hoy pueda ser instrumento de tu paz, llevar tu amor a quienes me rodean y vivir cada momento como un regalo de tu misericordia.\n\nAmén.", source: "Oración de ejemplo para revisión editorial" },
  ofrecimiento: { title: "Ofrecimiento del día", text: "Señor Dios, te ofrezco todo lo que soy y todo cuanto viviré en este día. Une mis alegrías, trabajos y dificultades a la ofrenda de Jesucristo para tu gloria y para el bien de mis hermanos. Amén.", source: "Oración tradicional católica" },
  noche: { title: "Oración de la noche", text: "Padre bueno, al terminar este día te doy gracias por tu presencia y tu cuidado. Perdona mis faltas, recibe mis esfuerzos y concede descanso a quienes amo. En tus manos encomiendo mi espíritu. Amén.", source: "Oración tradicional católica" },
  contricion: { title: "Acto de contrición", text: "Señor mío Jesucristo, Dios y hombre verdadero, me pesa de todo corazón haberte ofendido. Propongo firmemente, con tu gracia, no volver a pecar y confiar siempre en tu infinita misericordia. Amén.", source: "Oración tradicional católica" },
};

function liturgyUrl(hour: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][now.getMonth()];
  const day = String(now.getDate()).padStart(2, "0");
  const page = hour === "oficio" ? "oficio.htm" : `${hour}.htm`;
  return `https://liturgiadelashoras.github.io/sync/${year}/${month}/${day}/${page}`;
}

function todayLabel() {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long" }).format(new Date());
}

const Header = ({ title, back = true }: { title: string; back?: boolean }) => (
  <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b border-[#d8a740]/20 bg-[#050b12]/95 px-4 backdrop-blur">
    {back && <Link to="/oraciones" aria-label="Volver" className="absolute left-4 rounded-full p-2 text-[#efbd52]"><ArrowLeft /></Link>}
    <div className="text-center"><Sparkles className="mx-auto h-4 w-4 text-[#efbd52]" /><h1 className="text-sm font-bold uppercase tracking-wide text-[#f2c764]">{title}</h1></div>
  </header>
);

const PrayerNav = ({ active = "Oraciones" }: { active?: string }) => {
  const items = [[Home, "Inicio", "/"], [Bell, "Oraciones", "/oraciones"], [Cross, "Liturgia", "/oraciones/liturgia"], [Heart, "Favoritos", "/oraciones/mis-oraciones"], [Settings, "Ajustes", "/oraciones"]] as const;
  return <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[520px] border-t border-[#d8a740]/20 bg-[#071018]/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur"><div className="flex justify-around">{items.map(([Icon, label, to]) => <Link key={label} to={to} className={`flex flex-col items-center gap-1 text-[9px] ${active === label ? GOLD : "text-white/55"}`}><Icon className="h-4 w-4" />{label}</Link>)}</div></nav>;
};

const Shell = ({ children, title, active, back }: { children: ReactNode; title: string; active?: string; back?: boolean }) => <div className="min-h-screen bg-[#050b12] text-[#f5f0e6]"><div className="mx-auto min-h-screen max-w-[520px] border-x border-white/5 bg-[radial-gradient(circle_at_top,rgba(197,139,35,.10),transparent_30%)]"><Header title={title} back={back} /><main className="px-4 pb-24 pt-4">{children}</main><PrayerNav active={active} /></div></div>;

export default function Oraciones() {
  return <Shell title="Oraciones" back={false}>
    <p className="-mt-3 mb-4 text-center text-xs text-white/70">Ora, medita y encuentra fortaleza</p>
    <Link to="/oraciones/liturgia" style={{ backgroundImage: `url(${cathedralBg})` }} className="relative block min-h-48 overflow-hidden rounded-2xl border border-[#d8a740] bg-cover bg-center p-5 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" /><div className="relative max-w-[75%] pt-6"><h2 className="font-serif text-xl font-bold">LITURGIA DE LAS HORAS</h2><p className="mt-2 text-sm">La oración de la Iglesia,<br />actualizada cada día</p><span className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f6d574] to-[#d49a28] px-5 py-3 text-xs font-bold text-black">REZAR AHORA <ChevronRight className="h-4 w-4" /></span></div>
    </Link>
    <div className="mt-3 grid grid-cols-2 gap-3">{[["Oraciones del cristiano", "/oraciones/categoria/cristiano", Bell], ["Devociones", "/oraciones/devociones", Heart], ["Sanación y protección", "/oraciones/categorias", Shield], ["Liberación", "/oraciones/categorias", Send]].map(([label, to, Icon]) => <Link key={String(label)} to={String(to)} className="flex min-h-20 items-center gap-3 rounded-xl border border-white/10 bg-[#111b23] p-3 text-xs font-semibold"><Icon className="h-7 w-7 text-[#efbd52]" />{String(label)}</Link>)}</div>
  </Shell>;
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
  return <Shell title={data[1]} active="Liturgia"><p className="-mt-3 mb-4 text-center text-xs text-white/65">Vista preliminar · {todayLabel()}</p>
    <article className="rounded-2xl border border-white/10 bg-[#0c151d] p-5 leading-relaxed shadow-xl"><h2 className="font-serif text-lg font-bold text-[#efbd52]">Invitación</h2><p className="mt-1">Señor, abre mis labios,<br />y mi boca proclamará tu alabanza.</p><h2 className="mt-5 font-serif text-lg font-bold text-[#efbd52]">Oración de la Iglesia</h2><p className="mt-1">Continúa en la fuente diaria para rezar el texto completo correspondiente a esta hora.</p><div className="mt-5 h-1 overflow-hidden rounded bg-white/15"><div className="h-full w-1/4 bg-[#efbd52]" /></div><div className="mt-1 text-right text-[10px] text-white/50">Fuente externa</div></article>
    <div className="mt-4 flex items-center gap-3"><button type="button" className="rounded-full border border-white/10 p-3" aria-label="Tamaño de texto">AA</button><button type="button" className="rounded-full border border-white/10 p-3" aria-label="Escuchar"><Volume2 className="h-5 w-5" /></button><a href={liturgyUrl(hora)} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f6d574] to-[#d49a28] px-4 py-3 text-xs font-bold text-black">ABRIR LITURGIA <ExternalLink className="h-4 w-4" /></a></div>
  </Shell>;
}

export function OracionCategorias() {
  return <Shell title="Categorías"><div className="grid grid-cols-3 gap-2">{categories.map(([label, id, icon]) => <Link key={id} to={id === "peticion" ? "/oraciones/peticion" : id === "devociones" ? "/oraciones/devociones" : `/oraciones/categoria/${id}`} className="flex aspect-square flex-col items-center justify-center rounded-xl border border-white/10 bg-[#111b23] p-2 text-center"><span className="text-3xl text-[#efbd52]">{icon}</span><span className="mt-2 text-[9px] font-semibold leading-tight">{label}</span></Link>)}</div></Shell>;
}

export function OracionLista() {
  const [query, setQuery] = useState("");
  const filtered = prayers.filter((prayer) => prayer.title.toLowerCase().includes(query.toLowerCase()));
  return <Shell title="Oraciones del cristiano"><div className="mb-4 flex items-center gap-2 rounded-full border border-white/10 bg-[#121c24] px-3"><Search className="h-4 w-4 text-white/50" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar una oración" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" /></div><div className="space-y-3">{filtered.map(({ id, title, icon: Icon }) => <Link key={id} to={`/oraciones/oracion/${id}`} className="flex items-center rounded-xl border border-white/10 bg-[#111b23] p-4"><Icon className="mr-3 h-6 w-6 text-[#efbd52]" /><span className="flex-1 text-sm">{title}</span><Heart className="mr-4 h-5 w-5" /><Download className="h-5 w-5" /></Link>)}</div></Shell>;
}

export function OracionDetalle() {
  const { id = "manana" } = useParams();
  const prayer = prayersText[id] ?? prayersText.manana;
  return <Shell title={prayer.title}><article className="whitespace-pre-line font-serif text-lg leading-relaxed text-[#f6f0e6]">{prayer.text}</article><div className="mt-5 flex justify-between"><button type="button" className="text-xl">AA</button><Heart className="text-[#efbd52]" /><button type="button" className="rounded-full bg-[#efbd52] p-3 text-black"><Play className="h-5 w-5 fill-current" /></button><Send /></div><div className="mt-6 text-xs"><b>Fuente</b><p className="mt-1 text-white/60">{prayer.source}</p></div></Shell>;
}

export function DevocionesPage() {
  const items = [["Divina Misericordia", "9 minutos", "✨"], ["Preciosísima Sangre", "12 minutos", "✦"], ["Sagrado Corazón", "10 minutos", "♡"], ["Vía Crucis", "14 minutos", "✝"]];
  return <Shell title="Devociones"><div className="grid grid-cols-2 gap-3">{items.map(([name, time, icon]) => <div key={name} className="overflow-hidden rounded-xl border border-[#d8a740]/70 bg-[#111b23]"><div className="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle,rgba(223,164,55,.38),transparent_70%)] text-6xl text-[#efbd52]">{icon}</div><div className="p-3 text-center"><h2 className="text-xs font-semibold">{name}</h2><p className="text-[10px] text-white/60">{time}</p><button type="button" className="mt-2 w-full rounded-full bg-gradient-to-r from-[#f6d574] to-[#d49a28] py-2 text-[10px] font-bold text-black">PRÓXIMAMENTE</button></div></div>)}</div></Shell>;
}

export function MisOraciones() {
  return <Shell title="Mis oraciones" active="Favoritos"><div className="mb-4 grid grid-cols-3 rounded-xl bg-[#111b23] p-1 text-center text-xs"><span className="rounded-lg bg-[#efd078] px-2 py-3 font-bold text-black">Favoritas</span><span className="px-2 py-3">Descargadas</span><span className="px-2 py-3">Recientes</span></div><div className="space-y-3">{prayers.map((prayer, index) => <div key={prayer.id} className="rounded-xl border border-white/10 bg-[#111b23] p-4"><div className="flex items-center"><prayer.icon className="mr-3 text-[#efbd52]" /><div className="flex-1"><b className="text-xs">{prayer.title}</b><p className="text-[10px] text-white/50">Contenido de muestra</p></div><Menu className="h-4 w-4" /></div><div className="mt-3 flex items-center gap-2"><div className="h-1 flex-1 bg-white/15"><div className="h-full bg-[#efbd52]" style={{ width: `${[80, 100, 45, 20][index]}%` }} /></div></div></div>)}</div></Shell>;
}

export function PeticionOracion() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); setSent(true); };
  return <Shell title="Petición de oración"><div className="text-center"><Bell className="mx-auto h-10 w-10 text-[#efbd52]" /><p className="mt-4 text-xs">Tu intención será tratada con respeto<br />y confidencialidad</p></div>{sent ? <div className="mt-8 rounded-2xl border border-[#d8a740]/40 bg-[#111b23] p-6 text-center"><Heart className="mx-auto text-[#efbd52]" /><h2 className="mt-3 font-semibold">Hemos recibido tu intención</h2><p className="mt-2 text-xs text-white/60">Vista de demostración; la conexión con el servicio se programará después.</p></div> : <form onSubmit={submit} className="mt-6 space-y-3"><input placeholder="Nombre (opcional)" className="h-12 w-full rounded-xl border border-white/15 bg-[#111b23] px-4 text-sm outline-none" /><textarea required maxLength={500} placeholder="Escribe tu intención" className="h-36 w-full rounded-xl border border-white/15 bg-[#111b23] p-4 text-sm outline-none" /><label className="flex items-center gap-2 text-xs"><input type="checkbox" /> Publicar de forma anónima</label><button className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f6d574] to-[#d49a28] py-4 text-xs font-bold text-black">ENVIAR INTENCIÓN <Send className="h-4 w-4" /></button></form>}</Shell>;
}
