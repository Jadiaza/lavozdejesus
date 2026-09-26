import { useEffect, useMemo, useState } from "react";
import { AlignJustify, AlignLeft, Check, ChevronRight } from "lucide-react";
import {
  DEFAULT_READING_PREFERENCES,
  loadReadingPreferences,
  resetReadingPreferences,
  saveReadingPreferences,
  type ReadingFont,
  type ReadingPreferences,
  type ReadingTheme,
  type ReadingWidth,
} from "./readingPreferences";
import { toast } from "@/components/ui/sonner";

type ReadingTab = "temas" | "fuente" | "formato" | "mas";

const fonts: Array<{ id: ReadingFont; name: string; family: string; description: string; recommended?: boolean }> = [
  { id: "literata", name: "Literata", family: "'Literata', Georgia, serif", description: "Diseñada para lectura prolongada en pantalla", recommended: true },
  { id: "georgia", name: "Georgia", family: "Georgia, 'Times New Roman', serif", description: "Clásica y clara incluso en tamaños pequeños" },
  { id: "garamond", name: "Garamond", family: "'EB Garamond', Garamond, serif", description: "Elegancia editorial para textos extensos" },
  { id: "atkinson", name: "Atkinson", family: "'Atkinson Hyperlegible', Arial, sans-serif", description: "Formas diferenciadas para máxima accesibilidad" },
  { id: "sans", name: "Moderna", family: "'Montserrat', system-ui, sans-serif", description: "Trazos limpios y presentación contemporánea" },
];

const themeLabels: Record<ReadingTheme, string> = { claro: "Claro", oscuro: "Oscuro", sepia: "Tinta" };
const selected = "border-[#D4AF37] bg-[#D4AF37]/12 text-[#F2D27A]";
const idle = "border-[#D4AF37]/20 text-[#8F897C]";

export default function ReadingSettingsPanel() {
  const [prefs, setPrefs] = useState<ReadingPreferences>(DEFAULT_READING_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReadingTab>("temas");
  const [showFonts, setShowFonts] = useState(false);

  useEffect(() => {
    void loadReadingPreferences().then((value) => { setPrefs(value); setLoading(false); });
  }, []);

  const font = useMemo(() => fonts.find((item) => item.id === prefs.fuente) ?? fonts[0], [prefs.fuente]);

  const update = (change: Partial<ReadingPreferences>) => {
    setPrefs((current) => {
      const value = { ...current, ...change };
      void saveReadingPreferences(value);
      return value;
    });
  };

  const reset = async () => {
    const value = await resetReadingPreferences();
    setPrefs(value);
    setShowFonts(false);
    toast.success("Preferencias de lectura restablecidas");
  };

  if (loading) return <div className="py-8 text-center text-xs text-[#8F897C]">Cargando preferencias…</div>;

  return (
    <div>
      <div className="grid grid-cols-4 border-b border-[#D4AF37]/20 px-2" role="tablist" aria-label="Configuración de lectura">
        {([['temas', 'Temas'], ['fuente', 'Fuente'], ['formato', 'Formato'], ['mas', 'Más']] as Array<[ReadingTab, string]>).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => { setTab(id); setShowFonts(false); }} className={`relative min-h-11 px-1 text-[11px] font-semibold transition ${tab === id ? "text-[#F2D27A] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#D4AF37]" : "text-[#8F897C]"}`}>{label}</button>
        ))}
      </div>

      <div className="p-3">
        {tab === "temas" && <div className="grid grid-cols-3 gap-2">
          {(["claro", "oscuro", "sepia"] as ReadingTheme[]).map((value) => (
            <button key={value} type="button" onClick={() => update({ tema: value })} className={`min-h-20 rounded-xl border p-2 text-xs ${prefs.tema === value ? selected : "border-[#D4AF37]/20 text-[#C9C3B3]"}`}>
              <span className={`mx-auto mb-2 block h-8 w-8 rounded-full border ${value === "claro" ? "border-stone-300 bg-[#F8F5EA]" : value === "sepia" ? "border-[#756e5d] bg-[#e7e1cf]" : "border-stone-700 bg-[#111]"}`} />{themeLabels[value]}
            </button>
          ))}
        </div>}

        {tab === "fuente" && <div>
          <button type="button" onClick={() => setShowFonts((value) => !value)} className="flex w-full items-center border-y border-[#D4AF37]/25 px-2 py-3 text-left" aria-expanded={showFonts}>
            <span className="w-32 shrink-0 text-xs text-[#C9C3B3]">Familia de fuentes</span>
            <span className="flex min-w-0 flex-1 items-center justify-end gap-2"><span className="text-3xl text-[#F8F5EA]" style={{ fontFamily: font.family }}>Aa</span><strong className="truncate text-xs text-[#C9C3B3]">— {font.name}</strong><ChevronRight className="h-4 w-4 text-[#D4AF37]" /></span>
          </button>
          {showFonts && <div className="mt-2 max-h-[42vh] space-y-1 overflow-y-auto rounded-xl border border-[#D4AF37]/20 bg-[#080808] p-2">
            {fonts.map((option) => <button type="button" key={option.id} onClick={() => { update({ fuente: option.id }); setShowFonts(false); }} className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left ${prefs.fuente === option.id ? selected : "border-transparent hover:bg-white/[0.04]"}`}><span className="w-10 text-center text-2xl text-[#F2D27A]" style={{ fontFamily: option.family }}>Aa</span><span className="min-w-0 flex-1"><strong className="text-sm" style={{ fontFamily: option.family }}>{option.name}</strong><span className="block truncate text-[10px] text-[#8F897C]">{option.description}</span></span>{option.recommended && <span className="hidden rounded-full bg-[#D4AF37]/15 px-2 py-1 text-[8px] text-[#D4AF37] min-[380px]:block">Recomendada</span>}<Check className={`h-4 w-4 ${prefs.fuente === option.id ? "text-[#D4AF37]" : "text-transparent"}`} /></button>)}
          </div>}
        </div>}

        {tab === "formato" && <div className="divide-y divide-[#D4AF37]/20 border-y border-[#D4AF37]/25">
          <div className="flex min-h-16 items-center gap-3 px-2"><span className="w-20 text-xs text-[#C9C3B3]">Negrita</span><button type="button" onClick={() => update({ pesoFuente: Math.max(400, prefs.pesoFuente - 100) })} className="h-11 w-9 text-xl">−</button><div className="flex flex-1 gap-1">{[400,500,600].map((v) => <span key={v} className={`h-1 flex-1 ${v <= prefs.pesoFuente ? "bg-[#D4AF37]" : "border border-[#6d675a]"}`} />)}</div><button type="button" onClick={() => update({ pesoFuente: Math.min(600, prefs.pesoFuente + 100) })} className="h-11 w-9 text-xl">+</button></div>
          <div className="flex min-h-16 items-center gap-3 px-2"><span className="w-20 text-xs text-[#C9C3B3]">Tamaño</span><button type="button" onClick={() => update({ tam: Math.max(13, prefs.tam - 1) })} className="h-11 w-9 text-xl">−</button><div className="flex flex-1 items-center gap-0.5">{Array.from({length:14},(_,i)=>i+13).map((v)=><button type="button" key={v} aria-label={`Tamaño ${v}`} onClick={()=>update({tam:v})} className={`h-2 flex-1 ${v <= prefs.tam ? "bg-[#D4AF37]" : "border border-[#6d675a]"}`} />)}</div><span className="w-5 text-center text-[10px] text-[#D4AF37]">{prefs.tam}</span><button type="button" onClick={() => update({ tam: Math.min(26, prefs.tam + 1) })} className="h-11 w-9 text-xl">+</button></div>
          <div className="flex min-h-20 items-center gap-3 px-2"><span className="w-20 text-xs text-[#C9C3B3]">Alineación</span><div className="grid flex-1 grid-cols-2 gap-2">{([['izquierda','Izquierda',AlignLeft],['justificada','Justificada',AlignJustify]] as const).map(([v,l,Icon])=><button type="button" key={v} onClick={()=>update({alineacion:v})} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[10px] ${prefs.alineacion===v?selected:idle}`}><Icon className="h-5 w-5" />{l}</button>)}</div></div>
          <div className="flex min-h-20 items-center gap-3 px-2"><span className="w-20 text-xs text-[#C9C3B3]">Márgenes</span><div className="grid flex-1 grid-cols-3 gap-2">{([['estrecho','Estrecho','px-1'],['normal','Normal','px-2'],['amplio','Amplio','px-3.5']] as Array<[ReadingWidth,string,string]>).map(([v,l,p])=><button type="button" key={v} onClick={()=>update({margenLectura:v})} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[9px] ${prefs.margenLectura===v?selected:idle}`}><span className={`block h-5 w-9 rounded-sm border border-current ${p}`}><span className="mt-1 block border-t border-current"/><span className="mt-1 block border-t border-current"/></span>{l}</button>)}</div></div>
        </div>}

        {tab === "mas" && <div className="divide-y divide-[#D4AF37]/20 border-y border-[#D4AF37]/25">
          <div className="flex min-h-16 items-center gap-3 px-2"><span className="w-24 text-xs text-[#C9C3B3]">Interlineado</span><div className="grid flex-1 grid-cols-3 gap-1">{([[1.7,'Compacto'],[1.9,'Normal'],[2.1,'Amplio']] as Array<[number,string]>).map(([v,l])=><button type="button" key={v} onClick={()=>update({interlineado:v})} className={`min-h-11 rounded-lg border text-xs ${prefs.interlineado===v?selected:idle}`}>{l}</button>)}</div></div>
          <div className="p-3"><button type="button" onClick={() => void reset()} className="min-h-11 w-full rounded-lg border border-[#D4AF37]/25 px-4 text-xs font-semibold text-[#C9C3B3] transition hover:border-[#D4AF37]/50 hover:text-[#F2D27A]">Restablecer preferencias de lectura</button></div>
        </div>}
      </div>
    </div>
  );
}
