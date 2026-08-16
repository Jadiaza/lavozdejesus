import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AlignJustify, AlignLeft, Check, ChevronRight } from "lucide-react";
import { getMeta, setMeta } from "@/features/biblia/db";
import { StudyReadingThemeContext } from "./StudyReadingTheme";

type Theme = "claro" | "oscuro" | "sepia";
type Font = "literata" | "georgia" | "garamond" | "atkinson" | "sans";
type Alignment = "izquierda" | "justificada";
type Margin = "estrecho" | "normal" | "amplio";
type PanelTab = "temas" | "fuente" | "formato" | "mas";

interface Preferences {
  tam: number;
  tema: Theme;
  fuente: Font;
  pesoFuente: number;
  interlineado: number;
  alineacion: Alignment;
  margenLectura: Margin;
}

const defaults: Preferences = {
  tam: 17,
  tema: "oscuro",
  fuente: "literata",
  pesoFuente: 400,
  interlineado: 1.9,
  alineacion: "izquierda",
  margenLectura: "normal",
};

const fonts: Array<{ id: Font; name: string; description: string; family: string }> = [
  { id: "literata", name: "Literata", description: "Diseñada para lectura prolongada en pantalla", family: "'Literata', Georgia, serif" },
  { id: "georgia", name: "Georgia", description: "Clásica y clara incluso en tamaños pequeños", family: "Georgia, 'Times New Roman', serif" },
  { id: "garamond", name: "Garamond", description: "Elegancia editorial para textos extensos", family: "'EB Garamond', Garamond, serif" },
  { id: "atkinson", name: "Atkinson", description: "Formas diferenciadas para máxima accesibilidad", family: "'Atkinson Hyperlegible', Arial, sans-serif" },
  { id: "sans", name: "Moderna", description: "Trazos limpios y presentación contemporánea", family: "'Montserrat', system-ui, sans-serif" },
];

const selectedClass = (selected: boolean) =>
  selected
    ? "border-[#D4AF37] bg-[#D4AF37]/12 text-[#F2D27A]"
    : "border-[#D4AF37]/20 text-[#8F897C]";

export function StudyReadingFrame({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PanelTab>("temas");
  const [showFonts, setShowFonts] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void getMeta<Partial<Preferences> & { fuente?: Font | "bookerly" }>("prefsLectura").then((saved) => {
      if (!saved) return;
      setPrefs({
        ...defaults,
        ...saved,
        fuente: !saved.fuente || saved.fuente === "bookerly" ? "literata" : saved.fuente,
      });
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
      setShowFonts(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const save = (change: Partial<Preferences>) => {
    setPrefs((current) => {
      const value = { ...current, ...change };
      void setMeta("prefsLectura", value);
      return value;
    });
  };

  const font = useMemo(() => fonts.find((item) => item.id === prefs.fuente) ?? fonts[0], [prefs.fuente]);
  const themeClass = prefs.tema === "claro"
    ? "study-theme-light border-[#D4AF37]/25 bg-[#F8F5EA] text-[#24211a]"
    : prefs.tema === "sepia"
      ? "study-theme-ink biblia-eink-paper border-[#5f5b4d]/30 text-[#20211d]"
      : "study-theme-dark border-[#D4AF37]/20 bg-[#0B0B0B] text-[#F8F5EA]";
  const width = prefs.margenLectura === "estrecho"
    ? { width: "100%", maxWidth: "56rem" }
    : prefs.margenLectura === "amplio"
      ? { width: "calc(100% - 1.5rem)", maxWidth: "40rem" }
      : { width: "calc(100% - 0.5rem)", maxWidth: "48rem" };
  const readingStyle = {
    ...width,
    "--study-reader-font-size": `${prefs.tam}px`,
    "--study-reader-line-height": prefs.interlineado,
    "--study-reader-text-align": prefs.alineacion === "justificada" ? "justify" : "left",
    fontFamily: font.family,
    fontSize: prefs.tam,
    lineHeight: prefs.interlineado,
    fontWeight: prefs.pesoFuente,
    textAlign: prefs.alineacion === "justificada" ? "justify" : "left",
  } as CSSProperties;

  return (
    <section className="mb-4">
      <div className="sticky top-2 z-30 mb-3 flex justify-end">
        <button ref={triggerRef} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="min-h-11 min-w-11 font-display text-2xl text-[#D4AF37]">Aa</button>
      </div>

      {open && (
        <div ref={panelRef} className="study-format-panel relative z-30 mb-3 overflow-hidden border-y border-[#D4AF37]/20 bg-[#0B0B0B] text-[#F8F5EA] shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
          <div className="grid grid-cols-4 border-b border-[#D4AF37]/20 px-2" role="tablist" aria-label="Configuración de lectura">
            {([["temas", "Temas"], ["fuente", "Fuente"], ["formato", "Formato"], ["mas", "Más"]] as Array<[PanelTab, string]>).map(([value, label]) => (
              <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => { setTab(value); setShowFonts(false); }} className={"relative min-h-11 px-1 text-[11px] font-semibold " + (tab === value ? "text-[#F2D27A] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#D4AF37]" : "text-[#8F897C]")}>{label}</button>
            ))}
          </div>

          <div className="p-3">
            {tab === "temas" && (
              <div className="grid grid-cols-3 gap-2">
                {([["claro", "Claro"], ["oscuro", "Oscuro"], ["sepia", "Tinta"]] as Array<[Theme, string]>).map(([value, label]) => (
                  <button type="button" key={value} onClick={() => save({ tema: value })} className={"min-h-20 rounded-xl border p-2 text-xs " + selectedClass(prefs.tema === value)}>
                    <span className={"mx-auto mb-2 block h-9 w-9 rounded-full border " + (value === "claro" ? "border-stone-300 bg-[#F8F5EA]" : value === "sepia" ? "border-[#756e5d] bg-[#e7e1cf]" : "border-stone-700 bg-[#111]")} />
                    {label}
                  </button>
                ))}
              </div>
            )}

            {tab === "fuente" && (
              <div>
                <button type="button" onClick={() => setShowFonts((value) => !value)} className="flex w-full items-center border-y border-[#D4AF37]/25 px-2 py-3 text-left">
                  <span className="w-32 shrink-0 text-xs text-[#C9C3B3]">Familia de fuentes</span>
                  <span className="flex min-w-0 flex-1 items-center justify-end gap-2"><span className="text-3xl" style={{ fontFamily: font.family }}>Aa</span><strong className="truncate text-xs text-[#C9C3B3]">— {font.name}</strong><ChevronRight className="h-4 w-4 text-[#D4AF37]" /></span>
                </button>
                {showFonts && <div className="mt-2 max-h-[42vh] space-y-1 overflow-y-auto rounded-xl border border-[#D4AF37]/20 bg-[#080808] p-2">{fonts.map((option) => (
                  <button type="button" key={option.id} onClick={() => { save({ fuente: option.id }); setShowFonts(false); }} className={"flex w-full items-center gap-3 rounded-lg border p-2.5 text-left " + (prefs.fuente === option.id ? "border-[#D4AF37] bg-[#D4AF37]/12" : "border-transparent")}>
                    <span className="w-10 text-center text-2xl text-[#F2D27A]" style={{ fontFamily: option.family }}>Aa</span>
                    <span className="min-w-0 flex-1"><strong className="block text-sm" style={{ fontFamily: option.family }}>{option.name}</strong><span className="block truncate text-[10px] text-[#8F897C]">{option.description}</span></span>
                    <Check className={"h-4 w-4 " + (prefs.fuente === option.id ? "text-[#D4AF37]" : "text-transparent")} />
                  </button>
                ))}</div>}
              </div>
            )}

            {tab === "formato" && (
              <div className="divide-y divide-[#D4AF37]/20 border-y border-[#D4AF37]/25">
                <SettingRow label="Negrita"><button type="button" onClick={() => save({ pesoFuente: Math.max(400, prefs.pesoFuente - 100) })} className="h-11 w-9 text-xl">−</button><div className="flex flex-1 gap-1">{[400, 500, 600].map((value) => <span key={value} className={"h-1 flex-1 " + (value <= prefs.pesoFuente ? "bg-[#D4AF37]" : "border border-[#6d675a]")} />)}</div><button type="button" onClick={() => save({ pesoFuente: Math.min(600, prefs.pesoFuente + 100) })} className="h-11 w-9 text-xl">+</button></SettingRow>
                <SettingRow label="Tamaño"><button type="button" onClick={() => save({ tam: Math.max(13, prefs.tam - 1) })} className="h-11 w-9 text-xl">−</button><div className="flex flex-1 gap-0.5">{Array.from({ length: 14 }, (_, index) => index + 13).map((value) => <button type="button" key={value} onClick={() => save({ tam: value })} className={"h-2 flex-1 " + (value <= prefs.tam ? "bg-[#D4AF37]" : "border border-[#6d675a]")} />)}</div><span className="w-5 text-[10px] text-[#D4AF37]">{prefs.tam}</span><button type="button" onClick={() => save({ tam: Math.min(26, prefs.tam + 1) })} className="h-11 w-9 text-xl">+</button></SettingRow>
                <SettingRow label="Alineación"><div className="grid flex-1 grid-cols-2 gap-2">{([["izquierda", "Izquierda", AlignLeft], ["justificada", "Justificada", AlignJustify]] as const).map(([value, label, Icon]) => <button type="button" key={value} onClick={() => save({ alineacion: value })} className={"flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[10px] " + selectedClass(prefs.alineacion === value)}><Icon className="h-5 w-5" />{label}</button>)}</div></SettingRow>
                <SettingRow label="Márgenes"><div className="grid flex-1 grid-cols-3 gap-2">{([["estrecho", "Estrecho"], ["normal", "Normal"], ["amplio", "Amplio"]] as Array<[Margin, string]>).map(([value, label]) => <button type="button" key={value} onClick={() => save({ margenLectura: value })} className={"min-h-14 rounded-lg border text-[9px] " + selectedClass(prefs.margenLectura === value)}>{label}</button>)}</div></SettingRow>
              </div>
            )}

            {tab === "mas" && (
              <div className="divide-y divide-[#D4AF37]/20 border-y border-[#D4AF37]/25">
                <SettingRow label="Interlineado"><div className="grid flex-1 grid-cols-3 gap-1">{([[1.7, "Compacto"], [1.9, "Normal"], [2.1, "Amplio"]] as Array<[number, string]>).map(([value, label]) => <button type="button" key={value} onClick={() => save({ interlineado: value })} className={"min-h-11 rounded-lg border text-xs " + selectedClass(prefs.interlineado === value)}>{label}</button>)}</div></SettingRow>
                <div className="p-3"><button type="button" onClick={() => { setPrefs(defaults); setShowFonts(false); void setMeta("prefsLectura", defaults); }} className="min-h-11 w-full rounded-lg border border-[#D4AF37]/25 px-4 text-xs font-semibold text-[#C9C3B3]">Restablecer preferencias de lectura</button></div>
              </div>
            )}
          </div>
        </div>
      )}

      <StudyReadingThemeContext.Provider value={prefs.tema}>
        <article data-reading-margin={prefs.margenLectura} style={readingStyle} className={"study-reading-page mx-auto rounded-[1.5rem] border p-[clamp(1rem,5vw,1.5rem)] transition-all " + themeClass}>{children}</article>
      </StudyReadingThemeContext.Provider>
    </section>
  );
}

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex min-h-16 items-center gap-3 px-2"><span className="w-20 shrink-0 text-xs text-[#C9C3B3]">{label}</span>{children}</div>;
}
