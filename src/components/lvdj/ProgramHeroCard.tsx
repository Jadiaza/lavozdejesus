import { BookOpen, CalendarDays, ChevronRight, Clock, Play, Radio } from "lucide-react";
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
  brandedHeader?: boolean;
  fallbackImage?: string;
}

export const ProgramHeroCard = ({
  eyebrow,
  program,
  variant,
  className,
  onAction,
  nextProgram,
  onNextAction,
  brandedHeader = false,
  fallbackImage,
}: ProgramHeroCardProps) => {
  const Icon = variant === "live" ? Radio : Clock;

  return (
    <article className={cn("overflow-visible bg-transparent", className)}>
      <div className="relative overflow-hidden">
        {program.imagenUrl || fallbackImage ? (
          <img src={program.imagenUrl || fallbackImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,hsl(var(--gold)/0.3),transparent_38%),linear-gradient(135deg,#020814,#101827)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/72 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/45" />

        {brandedHeader && (
          <div className="relative z-10 flex items-center gap-3 border-b border-gold/25 px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-8">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F7D95D] via-[#D4AF37] to-[#A67C00] shadow-[0_0_26px_rgba(212,175,55,.35)]">
              <CalendarDays className="h-7 w-7 text-[#050505]" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-[#E6C54A] sm:text-xs">La Voz de Jesús</span>
              <span className="block font-display text-[clamp(2rem,9vw,3rem)] leading-none text-[#FFF8E8]">Programación</span>
            </span>
          </div>
        )}

        <div className="relative z-10 flex min-h-[260px] max-w-[82%] flex-col px-5 pb-7 pt-7 sm:min-h-[330px] sm:max-w-[72%] sm:px-7 sm:pb-8 sm:pt-8">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-gold sm:text-sm">
            <Icon className="h-5 w-5" />
            {variant === "live" && <span className="h-2.5 w-2.5 rounded-full bg-red-600 shadow-[0_0_12px_rgba(220,38,38,.9)]" />}
            {eyebrow}
          </div>
          <h2 className="font-display text-[clamp(2.15rem,9vw,4rem)] font-semibold leading-[.92] text-[#fffaf0]">{program.nombre}</h2>
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
        <button
          type="button"
          onClick={() => onNextAction?.(nextProgram)}
          className="relative mt-3 grid min-h-[108px] w-full grid-cols-[38px_minmax(0,1fr)_36px] items-center gap-3 overflow-hidden px-5 py-4 text-left sm:min-h-[124px] sm:grid-cols-[44px_minmax(0,1fr)_38px] sm:px-7"
        >
          {nextProgram.imagenUrl || fallbackImage ? (
            <img
              src={nextProgram.imagenUrl || fallbackImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,hsl(var(--gold)/0.18),transparent_35%),linear-gradient(135deg,#020814,#101827)]" />
          )}
          <span className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/78 to-black/45" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />

          <Clock className="relative z-10 h-7 w-7 text-gold sm:h-8 sm:w-8" strokeWidth={1.8} />
          <span className="relative z-10 min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-gold sm:text-xs">Próximo programa</span>
            <span className="mt-1 flex min-w-0 items-center gap-2">
              <BookOpen className="h-6 w-6 shrink-0 text-gold" />
              <span className="truncate font-display text-xl font-semibold text-[#fffaf0] sm:text-2xl">{nextProgram.nombre}</span>
            </span>
            <span className="ml-8 block text-xs font-extrabold text-gold sm:text-sm">{nextProgram.horaInicio}{nextProgram.horaFin ? ` - ${nextProgram.horaFin}` : ""}</span>
          </span>
          <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold"><ChevronRight className="h-5 w-5" /></span>
        </button>
      )}
    </article>
  );
};
