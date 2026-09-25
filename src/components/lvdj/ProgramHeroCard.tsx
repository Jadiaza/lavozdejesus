import { ChevronRight, Clock, Play, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Programa {
  id: string;
  nombre: string;
  descripcion: string;
  horaInicio: string;
  horaFin?: string;
  dia: string;
  categoria: string;
  icono?: string;
  imagenUrl?: string;
  enVivo?: boolean;
  destacado?: boolean;
}

interface ProgramHeroCardProps {
  eyebrow: string;
  program: Programa;
  variant: "live" | "next";
  className?: string;
  onAction?: (program: Programa) => void;
  nextProgram?: Programa;
  onNextAction?: (program: Programa) => void;
}

export const ProgramHeroCard = ({
  eyebrow,
  program,
  variant,
  className,
  onAction,
  nextProgram,
  onNextAction,
}: ProgramHeroCardProps) => {
  const Icon = variant === "live" ? Radio : Clock;

  return (
    <article
      className={cn(
        "relative w-full max-w-full overflow-hidden rounded-2xl gold-border bg-navy-deep/80 p-5 shadow-deep",
        "sm:p-6",
        className,
      )}
    >
      {program.imagenUrl ? (
        <img
          src={program.imagenUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-65"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,hsl(var(--gold)/0.28),transparent_38%),linear-gradient(135deg,hsl(var(--navy-deep)),hsl(var(--navy)))]" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-navy-deep/75 to-navy-deep/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-transparent to-black/35" />

      <div className="relative z-10 flex min-h-[235px] min-w-0 max-w-[520px] flex-col sm:min-h-[285px]">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-gold sm:mb-5 sm:text-xs sm:tracking-[0.16em]">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </div>

        <h2 className="font-display text-4xl font-semibold leading-[0.95] text-[#F8F5EA] sm:text-5xl lg:text-5xl">
          {program.nombre}
        </h2>

        <div className="mt-3 text-sm font-bold text-gold sm:mt-4 sm:text-base">
          {program.horaInicio}
          {program.horaFin ? ` - ${program.horaFin}` : ""}
        </div>

        {variant === "live" && (
          <p className="mt-3 max-w-[360px] text-sm leading-relaxed text-foreground/85 sm:text-base">
            {program.descripcion}
          </p>
        )}

        <button
          type="button"
          onClick={() => onAction?.(program)}
          className={cn(
            "mt-auto inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wide transition hover:scale-[1.01] sm:gap-3 sm:px-5 sm:py-3 sm:text-xs",
            variant === "live"
              ? "bg-gradient-gold text-navy-deep shadow-gold"
              : "gold-border text-gold hover:bg-gold/10",
          )}
        >
          {variant === "live" ? (
            <Play className="h-4 w-4 fill-current" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {variant === "live" ? "Escuchar ahora" : "Ver detalles"}
        </button>
      </div>

      {variant === "live" && nextProgram && (
        <button
          type="button"
          onClick={() => onNextAction?.(nextProgram)}
          className="relative z-10 mt-5 grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-gold/35 pt-4 text-left"
        >
          <Clock className="h-6 w-6 text-gold" />
          <span className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-gold sm:text-xs">Próximo programa</span>
            <span className="mt-1 block truncate font-display text-lg font-semibold text-foreground sm:text-xl">{nextProgram.nombre}</span>
            <span className="block text-xs font-bold text-gold sm:text-sm">{nextProgram.horaInicio}{nextProgram.horaFin ? ` - ${nextProgram.horaFin}` : ""}</span>
          </span>
          <ChevronRight className="h-5 w-5 text-gold" />
        </button>
      )}
    </article>
  );
};
