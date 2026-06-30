/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
COMPONENTE: QuickAccess.tsx
VERSION: 1.1.0

DESCRIPCION:
Modulo de accesos rapidos a las secciones principales de la aplicacion.
==============================================================================
*/

import { Link } from "react-router-dom";

interface QuickAccessItem {
  image: string;
  label: string;
  compactLabel?: string;
  compactSubtitle?: string;
  to?: string;
}

const items: QuickAccessItem[] = [
  {
    image: "/icons/evangelio.png",
    label: "Evangelio",
    compactLabel: "Liturgia del dia",
    compactSubtitle: "lecturas y santo",
    to: "/lecturas-del-dia",
  },
  {
    image: "/icons/rosario.png",
    label: "Rosario",
    compactSubtitle: "rezar ahora",
    to: "/devociones",
  },
  {
    image: "/icons/podcast.png",
    label: "Podcast",
    compactSubtitle: "escuchar",
    to: "/podcast",
  },
  {
    image: "/icons/peticiones.png",
    label: "Peticiones",
    compactSubtitle: "eleva tu intención",
    to: "/contacto",
  },
  {
    image: "/icons/biblia.png",
    label: "Biblia",
    compactSubtitle: "leer y meditar",
    to: "/biblia",
  },
  {
    image: "/icons/programa.png",
    label: "Programacion",
    compactLabel: "Programación",
    compactSubtitle: "ver horarios",
    to: "/programacion",
  },
  {
    image: "/icons/donar.png",
    label: "Donar",
    to: "/donar",
  },
  {
    image: "/icons/custodia.png",
    label: "Capilla\nVirtual",
    to: "/radio",
  },
];

const getVisibleItems = (compact: boolean) =>
  compact
    ? [items[0], items[1], items[4], items[2], items[3], items[5]]
    : items;

export const QuickAccess = ({ compact = false }: { compact?: boolean }) => (
  <div>
    <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/90">
      Accesos Rapidos
    </div>

    <div
      className={`grid gap-2.5 ${
        compact ? "grid-cols-3" : "grid-cols-4 md:grid-cols-8"
      }`}
    >
      {getVisibleItems(compact).map((item) => {
        const className =
          "group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl glass gold-border p-1.5 transition hover:bg-[hsl(var(--gold)/0.08)] active:scale-95";
        const content = (
          <>
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-radial-gold opacity-0 transition group-hover:opacity-60" />

            <img
              src={item.image}
              alt={item.label}
              className="pointer-events-none relative h-11 w-11 object-contain"
            />

            <span className="pointer-events-none relative flex min-h-[28px] flex-col items-center justify-start text-center leading-tight">
              <span
                className={`whitespace-pre-line text-[10px] font-semibold text-foreground/88 ${
                  item.label === "Programacion" ? "-mt-1 text-[9.5px]" : ""
                }`}
              >
                {compact ? item.compactLabel ?? item.label : item.label}
              </span>

              {compact && item.compactSubtitle ? (
                <span className="mt-0.5 max-w-full truncate text-[8.5px] font-medium text-foreground/70">
                  {item.compactSubtitle}
                </span>
              ) : null}
            </span>
          </>
        );

        return item.to ? (
          <Link key={item.label} to={item.to} className={className}>
            {content}
          </Link>
        ) : (
          <button key={item.label} type="button" className={className}>
            {content}
          </button>
        );
      })}
    </div>
  </div>
);
