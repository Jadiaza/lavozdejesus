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
    <div className="fixed inset-0 z-[10000] flex items-start justify-center bg-black/45 pt-[calc(4.5rem+env(safe-area-inset-top))] backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Formato de lectura">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar formato" />
      <section className="relative z-10 max-h-[calc(100dvh-5rem-env(safe-area-inset-top))] w-full max-w-[430px] overflow-y-auto border-y border-[#D4AF37]/20 bg-[#0B0B0B] text-[#F8F5EA] shadow-[0_18px_45px_rgba(0,0,0,0.65)] md:max-w-4xl">
        <div className="flex min-h-12 items-center justify-between border-b border-[#D4AF37]/15 px-3">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[.24em] text-[#D4AF37]">{eyebrow}</p>
          <button type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center text-[#C9C3B3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]" aria-label="Cerrar configuración"><X className="h-4 w-4" /></button>
        </div>
        <ReadingSettingsPanel />
      </section>
    </div>
  );
}
