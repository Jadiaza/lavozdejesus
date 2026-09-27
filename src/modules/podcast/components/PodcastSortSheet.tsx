import { Check, SlidersHorizontal, X } from "lucide-react";

export type PodcastSortOrder = "newest" | "oldest";

type PodcastSortSheetProps = {
  open: boolean;
  order: PodcastSortOrder;
  onChange: (order: PodcastSortOrder) => void;
  onClose: () => void;
};

export default function PodcastSortSheet({ open, order, onChange, onClose }: PodcastSortSheetProps) {
  if (!open) return null;

  const choose = (next: PodcastSortOrder) => {
    onChange(next);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10040] flex items-end bg-black/60" role="presentation" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar y ordenar episodios"
        onClick={(event) => event.stopPropagation()}
        className="mx-auto max-h-[calc(100dvh-4.5rem)] w-full max-w-[520px] overflow-y-auto rounded-t-[1.6rem] border-t border-white/10 bg-[#1B1B1B] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 text-[#F8F5EA] shadow-[0_-20px_55px_rgba(0,0,0,.55)]"
      >
        <div className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-white/30" />
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-[1.05rem] font-extrabold">Filtrar y ordenar</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]" aria-label="Cerrar filtros">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-4">
          <p className="mb-4 text-[1.05rem] font-extrabold">Filtrar</p>
          <div className="flex min-h-12 items-center justify-between text-[15px]">
            <span>Todos los episodios</span>
            <Check className="h-6 w-6 text-[#D4AF37]" strokeWidth={3} />
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="mb-2 text-[1.05rem] font-extrabold">Ordenar por</p>
          <button type="button" onClick={() => choose("newest")} className="flex min-h-12 w-full items-center justify-between text-left text-[15px]">
            <span>Más reciente</span>
            {order === "newest" && <Check className="h-6 w-6 text-[#D4AF37]" strokeWidth={3} />}
          </button>
          <button type="button" onClick={() => choose("oldest")} className="flex min-h-12 w-full items-center justify-between text-left text-[15px]">
            <span>Más antiguo</span>
            {order === "oldest" && <Check className="h-6 w-6 text-[#D4AF37]" strokeWidth={3} />}
          </button>
        </div>
      </section>
    </div>
  );
}
