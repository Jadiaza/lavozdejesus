import { BookOpen, ChevronRight } from "lucide-react";
import bible from "@/assets/bible.jpg";

export const GospelCard = () => (
  <article className="relative overflow-hidden rounded-2xl glass gold-border shadow-deep">
    <div className="absolute inset-y-0 right-0 w-1/2 opacity-60">
      <img src={bible} alt="" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-card/60 to-card" />
    </div>
    <div className="relative p-5 max-w-[65%]">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="h-4 w-4 text-gold" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          Evangelio del Día
        </span>
      </div>
      <p className="font-display text-xl leading-snug">
        <span className="text-gold/70 mr-1 text-2xl align-top">“</span>
        Habla, Señor, que tu siervo escucha.
      </p>
      <div className="text-xs text-muted-foreground mt-2">1 Samuel 3,9</div>
      <button className="mt-4 inline-flex items-center gap-1 gold-border rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition">
        Leer Evangelio <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  </article>
);