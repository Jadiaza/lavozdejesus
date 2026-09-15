import { BookOpen } from "lucide-react";
import { getPrayer } from "../mocks/prayers";
import type { Mystery, RosaryBead, TextSize } from "../types";

const textClass: Record<TextSize, string> = {
  sm: "text-[0.96rem] leading-[1.58]",
  md: "text-[1.02rem] leading-[1.62]",
  lg: "text-[1.1rem] leading-[1.64]",
};

interface Props {
  bead: RosaryBead;
  mystery?: Mystery | null;
  textSize: TextSize;
  highContrast: boolean;
  compact?: boolean;
}

/** Tarjeta de oración: tipografía estable y desplazamiento interno para textos largos. */
export const PrayerStepCard = ({ bead, mystery, textSize, highContrast, compact = false }: Props) => {
  const prayer = getPrayer(bead.prayerKey);
  const isMysteryStep = bead.prayerKey === "anuncio" || bead.prayerKey === "pausa";
  const activeTextClass = textClass[textSize];

  return (
    <article
      className={`flex h-full min-h-0 flex-col overflow-hidden border shadow-[0_18px_45px_rgba(0,0,0,0.24)] ${compact ? "rounded-[1.45rem] px-4 py-3.5 min-[390px]:px-5" : "rounded-[1.7rem] p-5 min-[390px]:p-6"} ${highContrast ? "border-gold bg-background" : "border-gold/45 bg-[linear-gradient(145deg,rgba(12,31,47,0.98),rgba(5,19,31,0.98))]"}`}
      aria-live="polite"
    >
      {!isMysteryStep ? (
        <div className="shrink-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-gold/80">Oración</p>
            <div className="flex items-center gap-1.5 text-[10px] text-gold/90"><BookOpen className="h-4 w-4" aria-hidden="true" /><span>Texto completo</span></div>
          </div>
          <h2 className="font-display text-[clamp(1.45rem,5.8vw,1.9rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-foreground">{prayer.title}</h2>
        </div>
      ) : null}

      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:rgba(214,164,67,.65)_rgba(255,255,255,.08)] [scrollbar-width:thin] ${isMysteryStep ? "" : "mt-3"}`}>
        {isMysteryStep && mystery ? (
          <div>
            <p className="font-display text-[0.98rem] italic text-gold-bright">{mystery.scriptureRef} · Fruto: {mystery.fruit}</p>
            {mystery.scriptureText ? <p className={`mt-3 ${activeTextClass} font-display text-foreground/95`}>{mystery.scriptureText}</p> : null}
            {mystery.meditation ? <p className={`mt-3 ${activeTextClass} font-display text-foreground/85`}>{mystery.meditation}</p> : null}
          </div>
        ) : null}

        {(!isMysteryStep || !mystery) ? (
          <div className="space-y-3 pb-1">
            {prayer.body.map((p, i) => <p key={i} className={`${activeTextClass} font-display text-foreground/95`}>{p}</p>)}
          </div>
        ) : null}
      </div>
    </article>
  );
};