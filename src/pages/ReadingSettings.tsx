import { Type } from "lucide-react";
import { BottomNav } from "@/components/lvdj/BottomNav";
import { Logo } from "@/components/lvdj/Logo";
import ReadingSettingsPanel from "@/features/reading/ReadingSettingsPanel";

export default function ReadingSettings() {
  return (
    <div className="min-h-screen bg-[#03070F] text-[#F8F5EA]">
      <main className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))] md:max-w-2xl">
        <header className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">Configuraciones</p><h1 className="mt-1 font-display text-3xl">Lectura y texto</h1></div>
          <Logo size="sm" />
        </header>

        <section className="mt-5 flex items-start gap-3 border-b border-[#D4AF37]/10 pb-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]"><Type className="h-5 w-5" /></span>
          <p className="text-xs leading-5 text-[#9C9588]">Estas preferencias se guardan en <strong className="font-semibold text-[#C9C3B3]">prefsLectura</strong> y se comparten entre Biblia (Leer, Estudio y Planes), Oraciones y Liturgia.</p>
        </section>

        <section className="mt-6"><ReadingSettingsPanel /></section>
      </main>
      <BottomNav activeLabel="Mas" />
    </div>
  );
}
