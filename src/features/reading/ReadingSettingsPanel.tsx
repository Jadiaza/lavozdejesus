import { useEffect, useMemo, useState } from "react";
import { AlignJustify, AlignLeft, Check, RotateCcw } from "lucide-react";
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

const fonts: Array<{ id: ReadingFont; name: string; family: string; description: string }> = [
  { id: "literata", name: "Literata", family: "'Literata', Georgia, serif", description: "Diseñada para lectura prolongada" },
  { id: "georgia", name: "Georgia", family: "Georgia, 'Times New Roman', serif", description: "Clásica y clara" },
  { id: "garamond", name: "Garamond", family: "'EB Garamond', Garamond, serif", description: "Estilo editorial" },
  { id: "atkinson", name: "Atkinson", family: "'Atkinson Hyperlegible', Arial, sans-serif", description: "Alta legibilidad" },
  { id: "sans", name: "Moderna", family: "'Montserrat', system-ui, sans-serif", description: "Limpia y contemporánea" },
];

const selected = "border-[#D4AF37] bg-[#D4AF37]/10 text-[#F2D27A]";
const idle = "border-white/10 bg-white/[0.015] text-[#A9A295]";

export default function ReadingSettingsPanel() {
  const [prefs, setPrefs] = useState<ReadingPreferences>(DEFAULT_READING_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadReadingPreferences().then((value) => {
      setPrefs(value);
      setLoading(false);
    });
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
    toast.success("Preferencias de lectura restablecidas");
  };

  if (loading) {
    return <div className="py-10 text-center text-sm text-[#8F897C]">Cargando preferencias…</div>;
  }

  return (
    <div className="space-y-7">
      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">Tema</h2>
        <div className="grid grid-cols-3 gap-2">
          {([["oscuro", "Oscuro"], ["claro", "Claro"], ["sepia", "Tinta"]] as Array<[ReadingTheme, string]>).map(([value, label]) => (
            <button key={value} type="button" onClick={() => update({ tema: value })} className={`min-h-20 rounded-xl border p-2 text-xs transition ${prefs.tema === value ? selected : idle}`}>
              <span className={`mx-auto mb-2 block h-8 w-8 rounded-full border ${value === "claro" ? "border-stone-300 bg-[#F8F5EA]" : value === "sepia" ? "border-[#756e5d] bg-[#e7e1cf]" : "border-stone-700 bg-[#111]"}`} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">Fuente</h2>
        <div className="space-y-1.5">
          {fonts.map((option) => (
            <button key={option.id} type="button" onClick={() => update({ fuente: option.id })} className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 text-left transition ${prefs.fuente === option.id ? selected : idle}`}>
              <span className="w-10 text-center text-2xl" style={{ fontFamily: option.family }}>Aa</span>
              <span className="min-w-0 flex-1"><strong className="block text-sm" style={{ fontFamily: option.family }}>{option.name}</strong><span className="block text-[10px] text-[#8F897C]">{option.description}</span></span>
              <Check className={`h-4 w-4 ${prefs.fuente === option.id ? "text-[#D4AF37]" : "text-transparent"}`} />
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">Formato</h2>
        <div className="divide-y divide-white/10 border-y border-white/10">
          <SettingRow label="Tamaño">
            <button type="button" onClick={() => update({ tam: Math.max(13, prefs.tam - 1) })} className="h-11 w-10 text-xl">−</button>
            <input aria-label="Tamaño de texto" type="range" min="13" max="26" value={prefs.tam} onChange={(event) => update({ tam: Number(event.target.value) })} className="min-w-0 flex-1 accent-[#D4AF37]" />
            <span className="w-10 text-right text-xs text-[#D4AF37]">{prefs.tam}px</span>
            <button type="button" onClick={() => update({ tam: Math.min(26, prefs.tam + 1) })} className="h-11 w-10 text-xl">+</button>
          </SettingRow>

          <SettingRow label="Peso">
            <button type="button" onClick={() => update({ pesoFuente: Math.max(400, prefs.pesoFuente - 100) })} className="h-11 w-10 text-xl">−</button>
            <div className="flex flex-1 gap-1">{[400, 500, 600].map((value) => <span key={value} className={`h-1 flex-1 ${value <= prefs.pesoFuente ? "bg-[#D4AF37]" : "bg-white/15"}`} />)}</div>
            <span className="w-10 text-right text-xs text-[#D4AF37]">{prefs.pesoFuente}</span>
            <button type="button" onClick={() => update({ pesoFuente: Math.min(600, prefs.pesoFuente + 100) })} className="h-11 w-10 text-xl">+</button>
          </SettingRow>

          <SettingRow label="Alineación">
            <div className="grid flex-1 grid-cols-2 gap-2">
              {([["izquierda", "Izquierda", AlignLeft], ["justificada", "Justificada", AlignJustify]] as const).map(([value, label, Icon]) => (
                <button key={value} type="button" onClick={() => update({ alineacion: value })} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[10px] ${prefs.alineacion === value ? selected : idle}`}><Icon className="h-5 w-5" />{label}</button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Ancho">
            <div className="grid flex-1 grid-cols-3 gap-2">
              {([["amplio", "Amplio"], ["normal", "Normal"], ["estrecho", "Estrecho"]] as Array<[ReadingWidth, string]>).map(([value, label]) => (
                <button key={value} type="button" onClick={() => update({ margenLectura: value })} className={`min-h-12 rounded-lg border text-[10px] ${prefs.margenLectura === value ? selected : idle}`}>{label}</button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Interlineado">
            <div className="grid flex-1 grid-cols-3 gap-2">
              {([[1.7, "Compacto"], [1.9, "Normal"], [2.1, "Amplio"]] as Array<[number, string]>).map(([value, label]) => (
                <button key={value} type="button" onClick={() => update({ interlineado: value })} className={`min-h-12 rounded-lg border text-[10px] ${prefs.interlineado === value ? selected : idle}`}>{label}</button>
              ))}
            </div>
          </SettingRow>
        </div>
      </section>

      <section className="rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.03] p-4">
        <p className="text-xs leading-5 text-[#9C9588]">Vista previa</p>
        <p className="mt-2 text-[#EDE6D9]" style={{ fontFamily: font.family, fontSize: prefs.tam, fontWeight: prefs.pesoFuente, lineHeight: prefs.interlineado, textAlign: prefs.alineacion === "justificada" ? "justify" : "left" }}>
          Tu palabra es lámpara para mis pasos y luz en mi camino.
        </p>
      </section>

      <button type="button" onClick={() => void reset()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-semibold text-[#C9C3B3] transition hover:border-[#D4AF37]/30 hover:text-[#F2D27A]">
        <RotateCcw className="h-4 w-4" /> Restablecer preferencias
      </button>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex min-h-20 items-center gap-3 py-3"><span className="w-20 shrink-0 text-xs text-[#C9C3B3]">{label}</span>{children}</div>;
}
