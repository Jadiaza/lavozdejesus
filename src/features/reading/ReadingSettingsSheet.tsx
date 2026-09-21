import { X } from "lucide-react";
import ReadingSettingsPanel from "./ReadingSettingsPanel";

export default function ReadingSettingsSheet({
  open,
  onClose,
  eyebrow = "Lectura y texto",
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/65 backdrop-blur-sm md:items-center md:p-4" role="dialog" aria-modal="true" aria-label="Formato de lectura">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar formato" />
      <section className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#D4AF37]/30 bg-[#080b10] p-5 text-[#F8F5EA] shadow-2xl md:rounded-3xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#D4AF37]">{eyebrow}</p>
            <h2 className="mt-1 font-display text-xl">Formato de lectura</h2>
            <p className="mt-1 text-[11px] leading-4 text-[#8F897C]">La misma configuración se aplica en Biblia, Estudio, Planes, Oraciones y Liturgia.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15" aria-label="Cerrar configuración"><X className="h-5 w-5" /></button>
        </div>
        <ReadingSettingsPanel />
      </section>
    </div>
  );
}
