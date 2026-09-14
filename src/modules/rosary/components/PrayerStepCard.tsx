import { getPrayer } from "../mocks/prayers";
import type { Mystery, RosaryBead, TextSize } from "../types";

const textClass: Record<TextSize, string> = {
  sm: "text-base leading-relaxed",
  md: "text-lg leading-relaxed",
  lg: "text-2xl leading-relaxed",
};

interface Props {
  bead: RosaryBead;
  mystery?: Mystery | null;
  textSize: TextSize;
  highContrast: boolean;
}

/** Tarjeta de la oración actual. Solo texto plano, sin HTML inyectado. */
export const PrayerStepCard = ({ bead, mystery, textSize, highContrast }: Props) => {
  const prayer = getPrayer(bead.prayerKey);
  const isMysteryStep = bead.prayerKey === "anuncio" || bead.prayerKey === "pausa";

  return (
    <article
      className={`rounded-[1.7rem] border p-5 shadow-[0_18px_45px_rgba(0,0,0,0.24)] min-[390px]:p-6 ${
        highContrast
          ? "border-gold bg-background"
          : "border-gold/35 bg-[linear-gradient(145deg,rgba(12,31,47,0.98),rgba(5,19,31,0.96))]"
      }`}
      aria-live="polite"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/45" aria-hidden="true" />
        <p className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.28em] text-gold/75">
          {bead.label}
        </p>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/45" aria-hidden="true" />
      </div>

      <h2 className="text-center font-display text-[clamp(1.7rem,7vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
        {isMysteryStep && mystery ? mystery.title : prayer.title}
      </h2>

      {isMysteryStep && mystery ? (
        <div className="mt-5 space-y-3 text-center">
          <p className="font-display text-sm italic text-gold-bright">
            {mystery.scriptureRef} · Fruto: {mystery.fruit}
          </p>
          {mystery.scriptureText ? (
            <p className={`${textClass[textSize]} text-foreground/95`}>{mystery.scriptureText}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Texto bíblico aún no publicado para este misterio.
            </p>
          )}
          {mystery.meditation ? (
            <p className={`${textClass[textSize]} text-foreground/85`}>{mystery.meditation}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Meditación pendiente de contenido oficial.
            </p>
          )}
        </div>
      ) : null}

      <div className="mx-auto mt-5 max-w-[36rem] space-y-4 text-center">
        {prayer.body.map((p, i) => (
          <p key={i} className={`${textClass[textSize]} font-display text-foreground/95`}>
            {p}
          </p>
        ))}
      </div>

      {prayer.provisional ? (
        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Contenido provisional: se reemplazará por el texto oficial.
        </p>
      ) : null}
    </article>
  );
};
