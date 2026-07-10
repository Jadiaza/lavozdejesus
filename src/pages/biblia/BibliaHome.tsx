import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  CalendarCheck2,
  ChevronRight,
  Columns3,
  Highlighter,
  ListTree,
  MapPin,
  Search,
  Star,
  StickyNote,
  UserRound,
} from "lucide-react";
import { BibliaLayout } from "./BibliaLayout";
import { libroById } from "@/features/biblia/books";
import { getMeta } from "@/features/biblia/db";
import bibleHero from "@/assets/lvj_biblia_home_hero_cruz_amanecer.png";

interface Tile {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: string | number }>;
  className?: string;
}

const tiles: Tile[] = [
  { to: "/biblia/leer", label: "Leer", icon: BookOpen },
  { to: "/biblia/buscar", label: "Buscar", icon: Search },
  { to: "/biblia/comparar", label: "Comparar", icon: Columns3 },
  { to: "/biblia/planes", label: "Plan", icon: CalendarCheck2 },
  { to: "/biblia/favoritos", label: "Favoritos", icon: Star },
  { to: "/biblia/notas", label: "Notas", icon: StickyNote },
  { to: "/biblia/marcadores", label: "Marcadores", icon: Bookmark },
  { to: "/biblia/resaltados", label: "Resaltados", icon: Highlighter },
  { to: "/biblia/concordancia", label: "Concordancia", icon: ListTree },
  { to: "/biblia/personajes", label: "Personajes", icon: UserRound },
  { to: "/biblia/lugares", label: "Lugares", icon: MapPin, className: "col-start-2 sm:col-start-3" },
];

export default function BibliaHome() {
  const [continuar, setContinuar] = useState<{
    libroId: number;
    capitulo: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const last = await getMeta<{ libroId: number; capitulo: number }>("ultimaLectura");

      if (!mounted) return;
      if (last) setContinuar(last);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const libroCont = continuar ? libroById(continuar.libroId) : null;
  const lecturaTo = libroCont
    ? `/biblia/leer?libro=${libroCont.id}&cap=${continuar!.capitulo}`
    : "/biblia/leer?libro=50&cap=6";

  return (
    <BibliaLayout title="Biblia">
      <section className="relative -mx-4 -mt-3 min-h-[15.56rem] overflow-hidden bg-[#050505] px-4 pb-6 pt-5 min-[390px]:min-h-[19.5rem] min-[390px]:pb-10 flex flex-col">
        <img
          src={bibleHero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.32)_22%,rgba(0,0,0,0.08)_50%,rgba(0,0,0,0)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.01)_0%,rgba(0,0,0,0)_100%)]" />

        <div className="relative z-10 mb-5 flex items-start justify-between gap-3 min-[390px]:mb-7">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] via-[#D4AF37] to-[#9B7417] shadow-[0_0_26px_rgba(212,175,55,0.3)]">
              <BookOpen className="h-5 w-5 text-[#050505]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <div className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                La Voz de Jesús
              </div>
              <h1 className="font-display text-[clamp(1.82rem,8.5vw,2.35rem)] leading-none text-[#F8F5EA] drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)]">
                Biblia
              </h1>
            </div>
          </div>

          <button
            type="button"
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/70 bg-[#050505]/35 text-[#F2D27A] shadow-[0_0_18px_rgba(212,175,55,0.14)] backdrop-blur-sm"
            aria-label="Perfil"
          >
            <UserRound className="h-5 w-5" strokeWidth={1.7} />
          </button>
        </div>

       <div className="absolute left-6 bottom-14 z-10 max-w-[15rem]">
          <p className="mt-1 text-[11px] font-medium tracking-wide text-[#F8F5EA]/90">
            Antorcha para mis pies es tu palabra,<br />
            y luz para mi senda.
          </p>
          <p className="mt-1 text-[11px] font-medium tracking-wide text-[#D4AF37]/80">
            Salmo 119, 105
          </p>
        </div>
      </section>

      <Link
        to={lecturaTo}
        className="group relative z-10 mt-[0.35rem] mb-3 block overflow-hidden rounded-[1.05rem] border border-[#D4AF37]/65 bg-[#080808]/94 px-3 py-2.5 shadow-[0_18px_48px_rgba(0,0,0,0.46)] transition hover:border-[#F2D27A]/90 active:scale-[0.99] min-[390px]:mt-[0.5rem] min-[390px]:px-4 min-[390px]:py-3"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_88%,rgba(212,175,55,0.22),transparent_34%),linear-gradient(110deg,rgba(5,5,5,0.94)_0%,rgba(17,17,17,0.82)_58%,rgba(5,5,5,0.62)_100%)]" />
        <div className="absolute bottom-0 right-0 h-28 w-40 bg-[radial-gradient(ellipse_at_bottom_right,rgba(242,210,122,0.2),transparent_68%)]" />

        <div className="relative flex items-start gap-2.5 min-[390px]:gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/55 bg-[#050505]/72 text-[#F2D27A] shadow-[0_0_18px_rgba(212,175,55,0.12)] min-[390px]:h-11 min-[390px]:w-11">
            <BookOpen className="h-5 w-5" strokeWidth={1.5} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="mb-1 text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.2em] text-[#D4AF37]">
              CONTINÚA DONDE QUEDASTE
            </div>
            <p className="line-clamp-1 mt-2.5 text-[0.72rem] leading-[1.35] text-[#F8F5EA]/88 min-[390px]:text-[0.72rem]">
              "Yo soy el pan de vida..."
            </p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[0.72rem] font-semibold text-[#D4AF37]">
                Jn 6, 35
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-2 py-1 text-[8px] font-bold text-[#050505] shadow-[0_8px_20px_rgba(212,175,55,0.2)] min-[390px]:px-2.5">
                <BookOpen className="h-3 w-3" strokeWidth={1.8} />
                Continuar leyendo
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="mb-3 flex items-center gap-3 text-center text-[12px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
        <span className="h-px flex-1 bg-[#D4AF37]/45" />
        Herramientas
        <span className="h-px flex-1 bg-[#D4AF37]/45" />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5 min-[390px]:gap-2.5">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className={`group relative flex min-h-[5.2rem] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[0.95rem] border border-[#D4AF37]/32 bg-[#090909]/96 p-2 text-center shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:border-[#D4AF37]/70 active:scale-95 min-[390px]:min-h-[5.65rem] ${tile.className ?? ""}`}
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(242,210,122,0.14),transparent_45%)] opacity-0 transition group-hover:opacity-100" />
            <tile.icon className="relative h-7 w-7 text-[#D4AF37]" strokeWidth={1.45} />
            <span className="relative text-[0.72rem] font-semibold leading-tight text-[#F8F5EA]">
              {tile.label}
            </span>
          </Link>
        ))}
      </div>

      <section className="mb-4 overflow-hidden rounded-[1.15rem] border border-[#D4AF37]/40 bg-[linear-gradient(115deg,#07111b_0%,#10191a_45%,#4a3b12_100%)] p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
              Espacio publicitario
            </div>
            <h3 className="text-xl font-black leading-tight text-[#F8F5EA]">La Voz de Jesús</h3>
            <p className="mt-1.5 text-sm leading-snug text-[#F8F5EA]/85">
              Acompaña esta misión evangelizadora
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 whitespace-nowrap rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-4 py-2.5 text-xs font-black text-[#050505] shadow-[0_10px_24px_rgba(212,175,55,0.22)]"
          >
            Paute aquí
          </button>
        </div>
      </section>
    </BibliaLayout>
  );
}
