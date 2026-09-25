import { BookOpen, ChevronRight, Clock, Play, Radio } from "lucide-react";
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
    <article className={cn("overflow-hidden rounded-2xl border border-gold/45 bg-[#020814] shadow-deep", className)}>
      <div className="relative min-h-[300px] overflow-hidden sm:min-h-[360px]">
        {program.imagenUrl ? (
          <img src={program.imagenUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,hsl(var(--gold)/0.3),transparent_38%),linear-gradient(135deg,#020814,#101827)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />

        <div className="relative z-10 flex min-h-[300px] max-w-[72%] flex-col p-5 sm:min-h-[360px] sm:p-7">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-gold sm:text-sm">
            <Icon className="h-5 w-5" />
            {variant === "live" && <span className="h-2.5 w-2.5 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,.9)]" />}
            {eyebrow}
          </div>
          <h2 className="font-display text-[clamp(2.35rem,10vw,4rem)] font-semibold leading-[.92] text-[#fffaf0]">{program.nombre}</h2>
          <div className="mt-4 text-base font-extrabold text-gold sm:text-xl">
            {program.horaInicio}{program.horaFin ? ` - ${program.horaFin}` : ""}
          </div>
          {program.descripcion && <p className="mt-3 line-clamp-3 max-w-[360px] text-sm leading-relaxed text-white/85 sm:text-base">{program.descripcion}</p>}
          <button type="button" onClick={() => onAction?.(program)} className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-gradient-gold px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-navy-deep shadow-gold sm:px-7 sm:text-sm">
            <Play className="h-4 w-4 fill-current" /> Escuchar ahora
          </button>
        </div>
      </div>

      {variant === "live" && nextProgram && (
        <button type="button" onClick={() => onNextAction?.(nextProgram)} className="grid w-full grid-cols-[44px_minmax(0,1fr)_38px] items-center gap-3 border-t border-gold/35 px-5 py-4 text-left sm:px-7">
          <Clock className="h-8 w-8 text-gold" strokeWidth={1.8} />
          <span className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-gold sm:text-xs">Próximo programa</span>
            <span className="mt-1 flex min-w-0 items-center gap-2">
              <BookOpen className="h-6 w-6 shrink-0 text-gold" />
              <span className="truncate font-display text-xl font-semibold text-[#fffaf0] sm:text-2xl">{nextProgram.nombre}</span>
            </span>
            <span className="ml-8 block text-xs font-extrabold text-gold sm:text-sm">{nextProgram.horaInicio}{nextProgram.horaFin ? ` - ${nextProgram.horaFin}` : ""}</span>
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold"><ChevronRight className="h-5 w-5" /></span>
        </button>
      )}
    </article>
  );
};
