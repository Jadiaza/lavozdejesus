interface Props {
  progress: number;
  mysteryNumber?: number | null;
  mysteryTotal?: number;
  prayerLabel: string;
  sectionLabel?: string;
}

/** Franja compacta con el misterio y la oración/cuenta actual. */
export const RosaryProgress = ({
  progress,
  mysteryNumber,
  mysteryTotal = 5,
  prayerLabel,
  sectionLabel,
}: Props) => (
  <section
    className="overflow-hidden rounded-full border border-gold/25 bg-[#071522]/90 shadow-[0_10px_26px_rgba(0,0,0,0.18)]"
    aria-label="Progreso del Santo Rosario"
  >
    <div className="flex min-h-[2.7rem] items-center gap-2.5 px-4">
      <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.18em] text-gold/65">
        Misterio
      </span>
      <strong className="shrink-0 font-display text-[0.9rem] font-semibold text-gold-bright">
        {mysteryNumber ? `${mysteryNumber} de ${mysteryTotal}` : sectionLabel ?? "Oraciones"}
      </strong>
      <span className="h-4 w-px shrink-0 bg-gold/25" aria-hidden="true" />
      <strong className="min-w-0 flex-1 truncate text-right font-display text-[0.9rem] font-medium text-foreground/90">
        {prayerLabel}
      </strong>
    </div>

    <div
      className="h-[2px] w-full bg-white/5"
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
