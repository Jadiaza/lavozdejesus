import { Clock, ChevronRight } from "lucide-react";

export const ProgramCard = ({
  title = "Santa Misa",
  time = "10:00 AM",
}: { title?: string; time?: string }) => (
  <article className="relative overflow-hidden rounded-2xl glass gold-border p-5 flex items-center gap-4">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-gold" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          Próximo Programa
        </span>
      </div>
      <div className="font-display text-xl leading-tight">{title}</div>
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-gold/70" /> {time}
      </div>
    </div>
    <button className="shrink-0 inline-flex items-center gap-1 gold-border rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold hover:bg-gold/10 transition">
      Ver Programación <ChevronRight className="h-3 w-3" />
    </button>
  </article>
);