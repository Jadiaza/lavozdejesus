import { Bell, Radio as RadioIcon, User2, ChevronDown, Clock, Play, Church } from "lucide-react";
import { Logo } from "./Logo";
import { RadioCard } from "./RadioCard";
import { QuickAccess } from "./QuickAccess";
import { GospelCard } from "./GospelCard";
import { ProgramCard } from "./ProgramCard";
import { Footer } from "./Footer";
import desktopBg from "@/assets/desktop-bg.png.asset.json";

const links = ["Inicio", "Radio", "Capilla", "Evangelio", "Comunidad", "Programación", "Contacto"];

const schedule = [
  { time: "05:00", title: "Liturgia de las Horas", host: "Comunidad Monástica", live: false },
  { time: "06:30", title: "Santa Misa Matutina", host: "Padre Antonio Rivera", live: true },
  { time: "10:00", title: "Caminos de Fe", host: "Diácono Luis Pérez", live: false },
  { time: "12:00", title: "Ángelus y Reflexión", host: "Padre Joaquín", live: false },
  { time: "15:00", title: "Hora de la Misericordia", host: "Adoradores", live: false },
  { time: "18:00", title: "Santo Rosario", host: "Familias en Oración", live: false },
  { time: "20:00", title: "Voces de Esperanza", host: "Padre Mateo Suárez", live: false },
];

export const DesktopHome = () => (
  <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
    {/* Top nav */}
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="glass border-b border-[hsl(var(--gold)/0.15)]">
        <div className="container flex items-center justify-between h-[88px] gap-6">
          <Logo size="md" />
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l, i) => (
              <a
                key={l}
                href="#"
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  i === 0 ? "text-gold" : "text-foreground/70 hover:text-gold"
                }`}
              >
                {l}
                {i === 0 && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 h-px w-8 bg-gradient-gold" />
                )}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="relative h-10 w-10 rounded-full glass gold-border flex items-center justify-center hover:text-gold transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold ring-2 ring-background" />
            </button>
            <button className="hidden md:inline-flex items-center gap-2 gold-border rounded-full px-4 h-10 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition">
              <RadioIcon className="h-4 w-4" /> En Vivo
            </button>
            <button className="hidden md:inline-flex items-center gap-2 glass rounded-full pl-1 pr-3 h-10 hover:border-[hsl(var(--gold)/0.5)] transition">
              <span className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <User2 className="h-4 w-4 text-navy-deep" />
              </span>
              <span className="text-xs font-medium">Mi cuenta</span>
              <ChevronDown className="h-3 w-3 text-foreground/60" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <main className="pt-[88px]">
      {/* Hero band with desktop background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={desktopBg.url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
        </div>

        <div className="container py-20 lg:py-28 grid lg:grid-cols-2 gap-10 items-center min-h-[520px]">
          <div className="max-w-xl">
            <h1 className="font-display text-5xl lg:text-6xl leading-[1.05]">
              Adora al Santísimo
              <br />
              <span className="gold-text italic">las 24 horas</span>
            </h1>
            <div className="my-6 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-gold" />
              <span className="text-gold text-lg">✦</span>
              <span className="h-px w-10 bg-gradient-gold" />
            </div>
            <p className="text-foreground/75 text-base max-w-md leading-relaxed">
              En nuestra Capilla Virtual puedes orar, adorar y estar en la presencia real de Jesús.
            </p>
            <button className="mt-8 inline-flex items-center gap-3 bg-gradient-gold text-navy-deep font-semibold px-6 py-3.5 rounded-full shadow-gold hover:scale-[1.02] transition">
              <Church className="h-5 w-5" />
              ENTRAR A LA CAPILLA VIRTUAL
            </button>
          </div>
          <div />
        </div>
      </section>

      {/* Row: Radio · Evangelio · Próximo */}
      <section className="container -mt-10 grid md:grid-cols-3 gap-5 relative z-10">
        <div className="md:col-span-1"><RadioCard /></div>
        <div className="md:col-span-1"><GospelCard /></div>
        <div className="md:col-span-1"><ProgramCard /></div>
      </section>

      {/* Accesos rápidos */}
      <section className="container mt-12">
        <QuickAccess />
      </section>

      {/* Schedule */}
      <section className="container py-16">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">En el aire</div>
            <h2 className="font-display text-4xl">Programación de Hoy</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-gold" /> Hora local
          </div>
        </div>
        <div className="glass gold-border rounded-3xl overflow-hidden">
          <div className="divide-y divide-[hsl(var(--gold)/0.1)]">
            {schedule.map((s) => (
              <div
                key={s.time}
                className={`grid grid-cols-[100px_1fr_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-[hsl(var(--gold)/0.04)] ${
                  s.live ? "bg-[hsl(var(--gold)/0.06)]" : ""
                }`}
              >
                <div className="font-display text-2xl text-gold tabular-nums">{s.time}</div>
                <div className="font-medium flex items-center gap-3">
                  {s.title}
                  {s.live && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> En vivo
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{s.host}</div>
                <button
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition ${
                    s.live
                      ? "bg-gradient-gold text-navy-deep shadow-gold"
                      : "glass text-gold hover:bg-gold/10"
                  }`}
                >
                  <Play className="h-4 w-4 ml-0.5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);