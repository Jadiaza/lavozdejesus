import {
  Mic2,
  HandHeart,
  Users,
  BookOpen,
  CalendarRange,
  Gift,
} from "lucide-react";

const items: any[] = [
  {
    image: "/icons/custodia.png",
    label: "Capilla\nVirtual",
  },
  {
    image: "/icons/rosario.png",
    label: "Rosario",
  },
   {
    image: "/icons/podcast.png",
    label: "Podcast",
  },
 {
    image: "/icons/peticiones.png",
    label: "Peticiones",
  },
 {
     image: "/icons/comunidad.png",
    label: "Comunidad",
  },
 {
     image: "/icons/biblia.png",
    label: "Biblia",
  },
  {
     image: "/icons/programa.png",
    label: "Programa",
  },
  {
     image: "/icons/donar.png",
    label: "Donar",
  },
  ];

export const QuickAccess = ({
  compact = false,
}: {
  compact?: boolean;
}) => (
  <div>
    <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/90 mb-3 px-1">
      Accesos Rápidos
    </div>

    <div
      className={`grid gap-2.5 ${
        compact ? "grid-cols-3" : "grid-cols-4 md:grid-cols-8"
      }`}
    >
      {(compact ? items.slice(0, 6) : items).map((it) => (
        <button
          key={it.label}
          className="group relative aspect-square rounded-2xl glass gold-border flex flex-col items-center justify-center gap-2.5 p-1.5 hover:bg-[hsl(var(--gold)/0.08)] active:scale-95 transition"
        >
          <span className="absolute inset-0 rounded-2xl bg-gradient-radial-gold opacity-0 group-hover:opacity-60 transition" />

          {it.image ? (
            <img
              src={it.image}
              alt={it.label}
              className="relative h-12 w-12 object-contain"
            />
          ) : (
            <it.icon
              className="relative h-6 w-6 text-gold"
              strokeWidth={1.6}
            />
          )}

          <span className="relative text-[10px] leading-tight text-center text-foreground/85 font-medium whitespace-pre-line">
            {it.label}
          </span>
        </button>
      ))}
    </div>
  </div>
);