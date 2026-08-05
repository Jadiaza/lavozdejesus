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
      className={`rounded-3xl p-5 ${
        highContrast ? "bg-background border border-gold" : "glass gold-border"
      }`}
      aria-live="polite"
    >
      <p className="text-[10px] uppercase tracking-[0.24em] text-gold/80">{bead.label}</p>
      <h2 className="font-display text-2xl mt-1">{isMysteryStep && mystery ? mystery.title : prayer.title}</h2>

      {isMysteryStep && mystery && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-gold/90">{mystery.scriptureRef} · Fruto: {mystery.fruit}</p>
          {mystery.scriptureText ? (
            <p className={textClass[textSize]}>{mystery.scriptureText}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Texto bíblico aún no publicado para este misterio.
            </p>
          )}
          {mystery.meditation ? (
            <p className={`${textClass[textSize]} text-foreground/90`}>{mystery.meditation}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Meditación pendiente de contenido oficial.
            </p>
          )}
        </div>
      )}

      <div className="mt-3 space-y-3">
        {prayer.body.map((p, i) => (
          <p key={i} className={textClass[textSize]}>
            {p}
          </p>
        ))}
      </div>

      {prayer.provisional && (
        <p className="mt-4 text-[11px] text-muted-foreground">
          Contenido provisional: se reemplazará por el texto oficial.
        </p>
      )}
    </article>
  );
};