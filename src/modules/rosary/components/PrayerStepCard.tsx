import { getPrayer } from "../mocks/prayers";
import type { Mystery, RosaryBead, TextSize } from "../types";

const textClass: Record<TextSize, string> = {
  sm: "text-base leading-relaxed",
  md: "text-lg leading-relaxed",
  lg: "text-2xl leading-relaxed",
};

const compactTextClass: Record<TextSize, string> = {
  sm: "text-[clamp(0.9rem,1.9dvh,1.02rem)] leading-[1.34]",
  md: "text-[clamp(1rem,2.05dvh,1.12rem)] leading-[1.38]",
  lg: "text-[clamp(1.08rem,2.2dvh,1.2rem)] leading-[1.4]",
};

interface Props {
  bead: RosaryBead;
  mystery?: Mystery | null;
  textSize: TextSize;
  highContrast: boolean;
  compact?: boolean;
}

/** Tarjeta de la oración actual. Solo texto plano, sin HTML inyectado. */
export const PrayerStepCard = ({ bead, mystery, textSize, highContrast, compact = false }: Props) => {
  const prayer = getPrayer(bead.prayerKey);
  const isMysteryStep = bead.prayerKey === "anuncio" || bead.prayerKey === "pausa";
  const bodyLength = prayer.body.join(" ").length;
  const compactDensity = bodyLength > 700 ? "dense" : bodyLength > 420 ? "medium" : "normal";
  const activeTextClass = compact
    ? compactDensity === "dense"
      ? "text-[clamp(0.74rem,1.52dvh,0.86rem)] leading-[1.26]"
      : compactDensity === "medium"
        ? "text-[clamp(0.82rem,1.68dvh,0.94rem)] leading-[1.3]"
        : compactTextClass[textSize]
    : textClass[textSize];

  return (
    <article
      className={`${
        compact
          ? "flex h-full min-h-0 flex-col justify-center rounded-[1.35rem] px-4 py-3 min-[390px]:px-5 min-[390px]:py-3.5"
          : "rounded-[1.7rem] p-5 min-[390px]:p-6"
      } border shadow-[0_18px_45px_rgba(0,0,0,0.24)] ${
        highContrast
          ? "border-gold bg-background"
          : "border-gold/35 bg-[linear-gradient(145deg,rgba(12,31,47,0.98),rgba(5,19,31,0.96))]"
      }`}
      aria-live="polite"
    >
      {!isMysteryStep ? (
        <>
          <div className={`${compact ? "mb-2" : "mb-4"} flex items-center gap-3`}>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/45" aria-hidden="true" />
            <p className={`${compact ? "text-[9px] tracking-[0.24em]" : "text-[9px] tracking-[0.28em]"} shrink-0 font-semibold uppercase text-gold/75`}>
              {bead.label}
            </p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/45" aria-hidden="true" />
          </div>

          <h2 className={`text-center font-display font-semibold tracking-[-0.02em] text-foreground ${compact ? "text-[clamp(1.55rem,6.4vw,2rem)] leading-[1.01]" : "text-[clamp(1.7rem,7vw,2.25rem)] leading-[1.05]"}`}>
            {prayer.title}
          </h2>
        </>
      ) : null}

      {isMysteryStep && mystery ? (
        <div className="text-center">
          <p className={`${compact ? "text-[0.92rem]" : "text-sm"} font-display italic text-gold-bright`}>
            {mystery.scriptureRef} · Fruto: {mystery.fruit}
          </p>
          {mystery.scriptureText ? (
            <p className={`${compact ? "mt-2" : "mt-4"} ${activeTextClass} text-foreground/95`}>{mystery.scriptureText}</p>
          ) : null}
          {mystery.meditation ? (
            <p className={`${compact ? "mt-2" : "mt-3"} ${activeTextClass} text-foreground/85`}>{mystery.meditation}</p>
          ) : null}
        </div>
      ) : null}

      {(!isMysteryStep || !mystery) ? (
        <div className={`mx-auto max-w-[36rem] text-center ${compact ? "mt-2 space-y-1" : "mt-5 space-y-4"}`}>
          {prayer.body.map((p, i) => (
            <p key={i} className={`${activeTextClass} font-display text-foreground/95`}>
              {p}
            </p>
          ))}
        </div>
      ) : null}

      {prayer.provisional && !compact ? (
        <p className="mt-5 text-center text-[11px] text-muted-foreground">
          Contenido provisional: se reemplazará por el texto oficial.
        </p>
      ) : null}
    </article>
  );
};
