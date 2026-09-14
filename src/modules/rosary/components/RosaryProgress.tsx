import { CircleDot, Crown } from "lucide-react";

interface Props {
  progress: number;
  mysteryNumber?: number | null;
  mysteryTotal?: number;
  prayerLabel: string;
  sectionLabel?: string;
}

/** Progreso visual del misterio y de la cuenta actual. */
export const RosaryProgress = ({
  progress,
  mysteryNumber,
  mysteryTotal = 5,
  prayerLabel,
  sectionLabel,
}: Props) => (
  <section
    className="overflow-hidden rounded-[1.25rem] border border-gold/35 bg-[#071522]/95 shadow-[0_14px_32px_rgba(0,0,0,0.24)]"
    aria-label="Progreso del Santo Rosario"
  >
    <div className="grid min-h-[4.25rem] grid-cols-[1fr_auto_1fr] items-center px-1.5">
      <div className="flex min-w-0 items-center gap-2 px-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/5">
          <Crown className="h-4.5 w-4.5 text-gold-bright" strokeWidth={1.55} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            Misterio
          </span>
          <strong className="mt-0.5 block line-clamp-2 font-display text-[0.86rem] font-semibold leading-[1.05] text-gold-bright">
            {mysteryNumber
              ? `${mysteryNumber} de ${mysteryTotal}`
              : sectionLabel ?? "Oraciones"}
          </strong>
        </span>
      </div>

      <span className="h-9 w-px bg-gold/25" aria-hidden="true" />

      <div className="flex min-w-0 items-center gap-2 px-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/5">
          <CircleDot className="h-4.5 w-4.5 text-gold-bright" strokeWidth={1.55} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            Cuenta
          </span>
          <strong className="mt-0.5 block line-clamp-2 font-display text-[0.86rem] font-semibold leading-[1.05] text-foreground">
            {prayerLabel}
          </strong>
        </span>
      </div>
    </div>

    <div
      className="h-[3px] w-full bg-white/5"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso general: ${progress}%`}
    >
      <div
        className="h-full bg-gradient-gold transition-[width] duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  </section>
);
