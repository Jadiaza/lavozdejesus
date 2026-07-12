import { Check, Heart, MessageCircleHeart } from "lucide-react";
import { useState } from "react";

export interface PrayerItem {
  id: string;
  name: string;
  time: string;
  text: string;
  prayers: number;
}

export const PrayerCard = ({ item }: { item: PrayerItem }) => {
  const [confirmed, setConfirmed] = useState(false);

  const handlePrayer = () => {
    setConfirmed(true);
    window.setTimeout(() => setConfirmed(false), 1600);
  };

  return (
    <article className="rounded-[20px] border border-white/[0.09] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-3.5 shadow-[0_14px_35px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
          <MessageCircleHeart className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug text-foreground/90">{item.text}</p>
              <p className="mt-1 text-xs text-foreground/62">{item.name}</p>
              <p className="mt-0.5 text-xs font-medium text-gold">{item.time}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 pt-1 text-gold" aria-label={`${item.prayers} personas orando`}>
              <Heart className="h-4 w-4" />
              <span className="text-base font-semibold tabular-nums">{item.prayers}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrayer}
            className={`mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition duration-300 active:scale-[0.985] ${
              confirmed
                ? "border-gold bg-gold text-navy-deep shadow-gold"
                : "border-gold/25 bg-gold/[0.04] text-gold hover:bg-gold/10"
            }`}
          >
            {confirmed ? <Check className="h-4 w-4" /> : <MessageCircleHeart className="h-4 w-4" />}
            {confirmed ? "Oracion unida" : "Estoy orando"}
          </button>
        </div>
      </div>
    </article>
  );
};
