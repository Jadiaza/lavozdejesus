import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useStudyReadingTheme } from "./StudyReadingTheme";
import { StudySectionHeading } from "./StudySectionHeading";

export interface VerseComparison {
  referencia: string;
  capitulo: number;
  versiculo: number;
  platense: string;
  torres_amat: string;
  scio: string;
  coincidencias?: string[];
  diferencias_relevantes?: string[];
  reescritura_fiel?: string;
  observacion?: string;
  estado_validacion: "completo" | "incompleto" | "falta_traduccion" | "referencia_inconsistente" | "pendiente_revision";
}

export interface StructureRow {
  orden: string;
  versiculos: string;
  etapa: string;
  pregunta_guia: string;
  sujeto: string;
  verbo_central: string;
  desarrollo: string;
}

const stateLabel: Record<VerseComparison["estado_validacion"], string> = {
  completo: "Completo",
  incompleto: "Incompleto",
  falta_traduccion: "Falta traducción",
  referencia_inconsistente: "Referencia inconsistente",
  pendiente_revision: "Pendiente de revisión",
};

export function VerseComparisonTable({ rows, onClose, onNext }: { rows?: VerseComparison[]; onClose?: () => void; onNext?: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const theme = useStudyReadingTheme();
  if (!rows?.length) return null;
  const themeClass = theme === "claro" ? "study-comparison-light bg-[#fffdf8] text-[#24211a]" : theme === "sepia" ? "study-comparison-ink bg-[#eee9d9] text-[#302f29]" : "study-comparison-dark bg-[#0B0B0B] text-[#F8F5EA]";
  return createPortal(<section role="dialog" aria-modal="true" aria-labelledby="verse-comparison-title" data-study-theme={theme} className={`study-comparison-dialog fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden p-4 sm:p-5 ${themeClass}`}>
    <header className="relative mb-3 shrink-0 pr-12"><p className="text-xs uppercase tracking-[0.2em] text-[#D4AF37]">Capa textual verificable</p><h2 id="verse-comparison-title" className="font-display text-xl">Comparación versículo por versículo</h2><p className="mt-1 text-sm opacity-75">Cada registro corresponde exclusivamente al mismo versículo en las tres versiones.</p>{onClose && <button type="button" onClick={onClose} aria-label="Cerrar comparación y volver a orientación vertical" className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/35 text-[#D4AF37]"><X className="h-5 w-5" /></button>}</header>
    <div className="min-h-0 flex-1 touch-pan-y space-y-2 overflow-y-auto overscroll-contain pb-4 pr-1 [-webkit-overflow-scrolling:touch]">{rows.map((row) => {
      const expanded = open === row.versiculo;
      return <article key={row.referencia} className="overflow-hidden border-y border-[#D4AF37]/20">
        <button type="button" onClick={() => setOpen(expanded ? null : row.versiculo)} aria-expanded={expanded} className="flex min-h-14 w-full items-center gap-3 py-2 text-left">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 text-[#D4AF37]">{row.versiculo}</span>
          <strong className="min-w-0 flex-1">{row.referencia}</strong>
          <span className="text-[0.72em] uppercase tracking-wide opacity-70">{stateLabel[row.estado_validacion]}</span>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {expanded && <div className="grid min-w-0 gap-4 border-t border-[#D4AF37]/15 py-4 md:grid-cols-3">
          <VersionText title="Biblia Platense" text={row.platense} />
          <VersionText title="Torres Amat" text={row.torres_amat} />
          <VersionText title="Scío de San Miguel" text={row.scio} />
          <Detail title="Coincidencias" values={row.coincidencias} />
          <Detail title="Diferencias relevantes" values={row.diferencias_relevantes} />
          <VersionText title="Reescritura fiel (no es traducción oficial)" text={row.reescritura_fiel} />
          {row.observacion && <div className="md:col-span-3"><VersionText title="Observación" text={row.observacion} /></div>}
        </div>}
      </article>;
    })}</div>
    <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-[#D4AF37]/20 bg-inherit pb-[env(safe-area-inset-bottom)] pt-3"><button type="button" onClick={onClose} className="min-h-12 rounded-xl border border-[#D4AF37]/35 px-3 text-sm font-semibold">Volver al texto</button><button type="button" onClick={onNext} className="min-h-12 rounded-xl bg-[#D4AF37] px-3 text-sm font-bold text-black">Continuar a Estructura</button></footer>
  </section>, document.body);
}

function VersionText({ title, text }: { title: string; text?: string }) {
  return <div><h3 className="mb-1 text-sm font-bold text-[#D4AF37]">{title}</h3><p>{text?.trim() || "Texto no disponible"}</p></div>;
}

function Detail({ title, values }: { title: string; values?: string[] }) {
  return <div><h3 className="mb-1 text-sm font-bold text-[#D4AF37]">{title}</h3>{values?.length ? <ul className="list-disc pl-5">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p className="opacity-70">Pendiente de análisis editorial.</p>}</div>;
}

const tone = ["#D4AF37", "#5f8fc9", "#d9794b", "#986ab5", "#4f9b72"];

export function TextStructureView({ rows }: { rows?: StructureRow[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const stages = useMemo(() => {
    const result: Array<{ name: string; rows: StructureRow[] }> = [];
    for (const row of rows ?? []) {
      const name = row.etapa?.trim() || "Desarrollo";
      const current = result[result.length - 1];
      if (current?.name === name) current.rows.push(row);
      else result.push({ name, rows: [row] });
    }
    return result;
  }, [rows]);
  if (!rows?.length) return null;
  return <section aria-labelledby="text-structure-title" className="mt-5">
    <StudySectionHeading number={6} title="Análisis literario y estructural" subtitle="Estructura del texto" subtitleId="text-structure-title" />
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_9rem]">
      <ol className="space-y-3">{rows.map((row, index) => {
        const expanded = open === row.orden;
        const color = tone[index % tone.length];
        return <li key={row.orden + row.versiculos} className="grid grid-cols-[0.7rem_minmax(0,1fr)] gap-3">
          <svg aria-hidden="true" className="h-full min-h-24 w-3" viewBox="0 0 12 100" preserveAspectRatio="none"><path d="M11 1H3v98h8" fill="none" stroke={color} strokeWidth="1.5" /></svg>
          <article className="min-w-0 rounded-xl border border-[#D4AF37]/20 p-4">
            <button type="button" onClick={() => setOpen(expanded ? null : row.orden)} aria-expanded={expanded} className="flex w-full items-start gap-2 text-left">
              <strong style={{ color }}>{row.orden}.</strong><span className="min-w-0 flex-1"><strong className="block break-words uppercase">{row.verbo_central}</strong>{row.pregunta_guia && <em className="mt-1 block break-words opacity-70">{row.pregunta_guia}</em>}<span className="mt-1 block text-xs opacity-70 sm:hidden">{row.versiculos}</span></span><span className="hidden shrink-0 opacity-70 sm:block">{row.versiculos}</span>{expanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
            </button>
            <div className="mt-2 pl-6"><p className="font-semibold" style={{color}}>{row.sujeto}</p><p>{row.desarrollo}</p>{expanded&&<p className="mt-2 text-xs italic opacity-70">{row.etapa}</p>}</div>
          </article>
        </li>;
      })}</ol>
      <aside className="hidden md:block" aria-label="Macroestructura"><div className="sticky top-28 flex flex-col items-center">{stages.map((stage, index) => <div key={stage.name + index} className="flex w-full flex-col items-center"><span className="w-full py-2 text-center text-xs font-bold uppercase" style={{ color: tone[index % tone.length] }}>{stage.name}</span>{index < stages.length - 1 && <svg aria-hidden="true" width="20" height="54" viewBox="0 0 20 54"><path d="M10 0v45m-5-6 5 7 5-7" fill="none" stroke="currentColor" /></svg>}</div>)}</div></aside>
    </div>
  </section>;
}
