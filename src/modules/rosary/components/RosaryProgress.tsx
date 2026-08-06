import { CircleDot, Crown } from "lucide-react";

interface Props {
  progress: number;
  mysteryNumber?: number | null;
  mysteryTotal?: number;
  prayerLabel: string;
  sectionLabel?: string;
}

/**
 * Progreso textual del misterio y de la oración actual.
 */
export const RosaryProgress = ({
  progress,
  mysteryNumber,
  mysteryTotal = 5,
  prayerLabel,
  sectionLabel,
}: Props) => (
  <section
    className="overflow-hidden rounded-2xl border border-gold/30 bg-navy/80"
    aria-label="Progreso del Santo Rosario"
  >
    <div className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center">
      <div className="flex min-w-0 items-center justify-center gap-2 px-3">
        <Crown
          className="h-5 w-5 shrink-0 text-gold"
          strokeWidth={1.6}
          aria-hidden="true"
        />

        <span className="truncate text-sm font-medium text-gold">
          {mysteryNumber
            ? `Misterio ${mysteryNumber} de ${mysteryTotal}`
            : sectionLabel ?? "Oraciones"}
        </span>
      </div>

      <span
        className="h-8 w-px bg-gold/25"
        aria-hidden="true"
      />

      <div className="flex min-w-0 items-center justify-center gap-2 px-3">
        <CircleDot
          className="h-5 w-5 shrink-0 text-foreground/75"
          strokeWidth={1.6}
          aria-hidden="true"
        />

        <span className="truncate text-sm text-foreground/90">
          {prayerLabel}
        </span>
      </div>
    </div>

    <div
      className="h-0.5 w-full bg-white/5"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progreso general: ${progress}%`}
    >
      <div
        className="h-full bg-gradient-gold transition-[width] duration-300"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  </section>
);