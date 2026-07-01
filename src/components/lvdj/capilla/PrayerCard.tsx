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
    <article className="rounded-2xl border border-gold/16 bg-black/34 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
      <div className="flex gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <MessageCircleHeart className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
                {item.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-gold">{item.time}</p>
            </div>
            <div className="text-right text-xs text-foreground/70">
              <Heart className="ml-auto h-4 w-4 fill-gold text-gold" />
              <div className="mt-1 font-semibold text-foreground">{item.prayers}</div>
              personas oran
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-foreground/84">{item.text}</p>

          <button
            type="button"
            onClick={handlePrayer}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition active:scale-[0.985] ${
              confirmed
                ? "border-gold bg-gold text-navy-deep"
                : "border-gold/35 bg-black/25 text-foreground"
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
