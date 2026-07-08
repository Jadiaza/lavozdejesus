import { useEffect, useState, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  CalendarCheck2,
  ChevronRight,
  Columns3,
  Download,
  Headphones,
  History,
  ListTree,
  Map as MapIcon,
  MapPin,
  Search,
  Settings2,
  Star,
  StickyNote,
  UserRound,
} from "lucide-react";
import { BibliaLayout } from "./BibliaLayout";
import { libroById } from "@/features/biblia/books";
import { getMeta } from "@/features/biblia/db";

interface Tile {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  ready?: boolean;
}

const tiles: Tile[] = [
  { to: "/biblia/leer", label: "Leer Biblia", icon: BookOpen, ready: true },
  { to: "/biblia/buscar", label: "Buscar", icon: Search },
  { to: "/biblia/comparar", label: "Comparar versiones", icon: Columns3 },
  { to: "/biblia/planes", label: "Plan de lectura", icon: CalendarCheck2 },
  { to: "/biblia/favoritos", label: "Favoritos", icon: Star },
  { to: "/biblia/notas", label: "Notas", icon: StickyNote },
  { to: "/biblia/marcadores", label: "Marcadores", icon: Bookmark },
  { to: "/biblia/concordancia", label: "Concordancia", icon: ListTree },
  { to: "/biblia/personajes", label: "Personajes", icon: UserRound },
  { to: "/biblia/lugares", label: "Lugares", icon: MapPin },
  { to: "/biblia/mapas", label: "Mapas", icon: MapIcon },
  { to: "/biblia/cronologias", label: "Cronologías", icon: History },
  { to: "/biblia/audio", label: "Audio Biblia", icon: Headphones },
  { to: "/biblia/configuracion", label: "Configuración", icon: Settings2 },
];

export default function BibliaHome() {
  const [continuar, setContinuar] = useState<{
    libroId: number;
    capitulo: number;
  } | null>(null);
  const [importada, setImportada] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const last = await getMeta<{ libroId: number; capitulo: number }>("ultimaLectura");
      const done = await getMeta<boolean>("importDone");

      if (!mounted) return;
      if (last) setContinuar(last);
      setImportada(Boolean(done));
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const libroCont = continuar ? libroById(continuar.libroId) : null;

  return (
    <BibliaLayout title="Biblia">
      <section className="glass gold-border relative mb-5 overflow-hidden rounded-3xl p-6">
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />
        <div className="relative">
          <div className="mb-2 text-[11px] uppercase tracking-[0.28em] text-gold/90">
            Palabra de Dios
          </div>
          <h1 className="font-display text-3xl leading-tight md:text-4xl">
            Biblia <span className="gold-text italic">Straubinger</span>
          </h1>
          <p className="mt-2 max-w-md text-sm text-foreground/75">
            Lee, estudia y medita la Palabra con las notas del Monseñor Juan Straubinger.
          </p>
        </div>
      </section>

      {libroCont ? (
        <Link
          to={`/biblia/leer?libro=${libroCont.id}&cap=${continuar!.capitulo}`}
          className="glass gold-border mb-4 block rounded-2xl p-4 transition hover:bg-[hsl(var(--gold)/0.06)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold">
                Continuar lectura
              </div>
              <div className="font-display text-xl">
                {libroCont.nombre} {continuar!.capitulo}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gold" />
          </div>
        </Link>
      ) : (
        <Link
          to={importada ? "/biblia/leer" : "/biblia/importar"}
          className="glass gold-border mb-4 block rounded-2xl p-4 transition hover:bg-[hsl(var(--gold)/0.06)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold">
                {importada ? "Empieza a leer" : "Primer paso"}
              </div>
              <div className="font-display text-xl">
                {importada ? "Abrir la Biblia" : "Importar la Biblia"}
              </div>
              <div className="mt-1 text-xs text-foreground/60">
                {importada
                  ? "Elige un libro y comienza."
                  : "Carga el texto Straubinger y sus notas."}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gold" />
          </div>
        </Link>
      )}

      <Link
        to="/biblia/importar"
        className="glass mb-6 flex items-center justify-between gap-3 rounded-2xl border border-[hsl(var(--gold)/0.2)] px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/10">
            <Download className="h-4 w-4 text-gold" />
          </span>
          <div>
            <div className="text-sm font-medium">Importador Straubinger</div>
            <div className="text-[11px] text-foreground/55">
              {importada ? "Biblia cargada localmente" : "Cargar Biblia y comentarios"}
            </div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gold/70" />
      </Link>

      <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/90">
        Módulos
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className={`glass gold-border group relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl p-2 transition hover:bg-[hsl(var(--gold)/0.08)] active:scale-95 ${
              tile.ready ? "" : "opacity-90"
            }`}
          >
            <span className="absolute inset-0 rounded-2xl bg-gradient-radial-gold opacity-0 transition group-hover:opacity-60" />
            <tile.icon className="relative h-6 w-6 text-gold" strokeWidth={1.6} />
            <span className="relative text-center text-[10px] font-medium leading-tight text-foreground/85">
              {tile.label}
            </span>
            {!tile.ready && (
              <span className="absolute right-1.5 top-1.5 text-[8px] uppercase tracking-wider text-gold/70">
                Pronto
              </span>
            )}
          </Link>
        ))}
      </div>
    </BibliaLayout>
  );
}
