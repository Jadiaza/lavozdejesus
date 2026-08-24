import { useMemo, useState } from "react";
import { StudySectionHeading } from "./StudySectionHeading";

type PropositionType = "PP" | "PS";
type Proposition = { id:string; orden:number; tipo:PropositionType; texto:string; nucleo_verbal?:string; lema_verbal?:string; sujeto?:string; tipo_sujeto?:string; depende_de?:string|null; relacion?:string; funcion_discursiva?:string; estructura_eliptica?:boolean; texto_sobreentendido?:string|null; nivel_confianza?:"alta"|"media"|"baja"; requiere_revision?:boolean };
type TopicStage = { etapa:string; tema:string; color_key:string };
type Verse = { id:string; numero:number; referencia:string; texto_fuente:string; etapa_id:string; tema_etapa:TopicStage; proposiciones:Proposition[]; estado_validacion:string };
export type PropositionAnalysisData = { schema_version:string; referencia:string; version_biblica:string; titulo:string; subtitulo:string; metodo:string; resumen?:{total_versiculos:number;total_pp:number;total_ps:number;total_etapas:number;requiere_revision:boolean}; versiculos:Verse[] };

const stageStyles:Record<string,string> = { inicio:"border-amber-400 text-amber-300", confesion:"border-sky-400 text-sky-300", contraste:"border-orange-400 text-orange-300", eleccion:"border-violet-400 text-violet-300", centro:"border-emerald-400 text-emerald-300", desarrollo:"border-blue-400 text-blue-300", consecuencia:"border-fuchsia-400 text-fuchsia-300", fundamento:"border-cyan-400 text-cyan-300", culminacion:"border-rose-400 text-rose-300", default:"border-[#D4AF37] text-[#D4AF37]" };
const clean = (value:unknown) => String(value ?? "").trim();

function adaptLegacy(data:PropositionAnalysisData|unknown[]):PropositionAnalysisData {
  if (!Array.isArray(data)) return data;
  const grouped = new Map<string,any[]>();
  data.forEach((row:any) => { const key=clean(row.versiculos)||"?"; grouped.set(key,[...(grouped.get(key)||[]),row]); });
  const verses=[...grouped.entries()].map(([number,rows],index) => {
    const raw=clean(rows[0]?.tema_etapa); const parts=raw.split(/\s*[—|:]\s*/,2); const stage=parts[0]||"Etapa no especificada";
    return { id:`legacy_v${index+1}`, numero:Number(number.replace(/\D/g,""))||index+1, referencia:number, texto_fuente:"", etapa_id:`legacy_e${index+1}`, tema_etapa:{etapa:stage,tema:parts[1]||raw||"Tema pendiente de revisión",color_key:"default"}, proposiciones:rows.map((row:any,i:number)=>({id:`legacy_v${index+1}_p${i+1}`,orden:i+1,tipo:row.clasificacion==="PS"?"PS":"PP",texto:clean(row.texto),depende_de:clean(row.depende_de)||null,funcion_discursiva:clean(row.funcion),nivel_confianza:"media",requiere_revision:true})), estado_validacion:"pendiente_revision" } as Verse;
  });
  return {schema_version:"legacy-adapted",referencia:"",version_biblica:"",titulo:"Análisis de las proposiciones",subtitulo:"Proposiciones principales y secundarias",metodo:"PP_PS",versiculos:verses};
}

export function PropositionAnalysisSection({data}:{data:PropositionAnalysisData|unknown[]}) {
  const analysis=useMemo(()=>adaptLegacy(data),[data]); const [onlyPP,setOnlyPP]=useState(false); const [details,setDetails]=useState(false);
  if (!analysis.versiculos?.length) return null;
  return <section className="proposition-analysis mb-5" aria-labelledby="proposition-analysis-title">
    <StudySectionHeading number={5} title="Análisis de las proposiciones" subtitle="Proposiciones principales y secundarias" headingId="proposition-analysis-title" />
    <div className="mb-4"><div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-rose-400/50 px-2 py-1"><b className="proposition-label-pp">PP</b> — Proposición principal</span><span className="rounded-full border border-sky-400/50 px-2 py-1"><b className="proposition-label-ps">PS</b> — Proposición secundaria</span></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>setOnlyPP(v=>!v)} className="rounded-lg border border-[#D4AF37]/35 px-3 py-2 text-xs">{onlyPP?"Mostrar PP y PS":"Mostrar solo PP"}</button><button type="button" onClick={()=>setDetails(v=>!v)} className="rounded-lg border border-[#D4AF37]/35 px-3 py-2 text-xs">{details?"Ocultar detalles":"Mostrar detalles gramaticales"}</button></div></div>
    <div className="hidden overflow-hidden rounded-xl border border-[#D4AF37]/25 md:block"><div className="grid grid-cols-[4rem_minmax(0,1fr)_1rem_14rem] bg-[#D4AF37]/10 text-xs font-bold uppercase tracking-wide"><div className="p-3">Vers.</div><div className="p-3">Proposiciones (PP = principal / PS = secundaria)</div><div className="col-span-2 p-3 text-center">Tema / etapa</div></div>{analysis.versiculos.map(v=><VerseRow key={v.id} verse={v} onlyPP={onlyPP} details={details}/>)}</div>
    <div className="overflow-hidden border-y border-[#D4AF37]/25 md:hidden">{analysis.versiculos.map(v=><VerseCard key={v.id} verse={v} onlyPP={onlyPP} details={details}/>)}</div>
  </section>;
}

function Props({verse,onlyPP,details}:{verse:Verse;onlyPP:boolean;details:boolean}) { return <div className="space-y-1.5">{verse.proposiciones.filter(p=>!onlyPP||p.tipo==="PP").map(p=><div key={p.id} className={p.tipo==="PS"?"ml-5":""}><div className="flex gap-2"><span className={"min-w-7 font-bold proposition-label-"+p.tipo.toLowerCase()}>({p.tipo})</span><span>{p.texto}</span></div>{p.tipo==="PS"&&p.depende_de&&<p className="pl-9 text-[10px] opacity-55">↳ {p.depende_de}</p>}{details&&<dl className="ml-9 mt-1 grid grid-cols-2 gap-x-3 text-[11px] opacity-75"><dt>Verbo</dt><dd>{p.nucleo_verbal||"—"}</dd><dt>Sujeto</dt><dd>{p.sujeto||"—"}</dd><dt>Relación</dt><dd>{p.relacion||"—"}</dd><dt>Función</dt><dd>{p.funcion_discursiva||"—"}</dd><dt>Confianza</dt><dd>{p.nivel_confianza||"—"}{p.requiere_revision?" · revisar":""}</dd></dl>}</div>)}</div>; }
function Stage({value}:{value:TopicStage}) { const key=clean(value.color_key).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(); return <div className={`text-center ${stageStyles[key]||stageStyles.default}`}><strong className="block uppercase tracking-wide">{value.etapa}</strong><span className="mt-1 block text-current opacity-75">{value.tema}</span></div>; }
function VerseRow({verse,onlyPP,details}:{verse:Verse;onlyPP:boolean;details:boolean}) { return <article className="grid grid-cols-[4rem_minmax(0,1fr)_1rem_14rem] border-t border-[#D4AF37]/15"><div className="p-3 text-center font-bold text-[#D4AF37]">{verse.numero}</div><div className="p-3"><Props verse={verse} onlyPP={onlyPP} details={details}/></div><div aria-hidden="true" className="relative my-3 border-r border-current opacity-70 before:absolute before:right-0 before:top-0 before:w-2 before:border-t before:border-current after:absolute after:bottom-0 after:right-0 after:w-2 after:border-b after:border-current"/><div className="flex items-center justify-center p-3"><Stage value={verse.tema_etapa}/></div></article>; }
function VerseCard({verse,onlyPP,details}:{verse:Verse;onlyPP:boolean;details:boolean}) { return <article className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 border-b border-[#D4AF37]/15 py-4 last:border-b-0"><p className="pt-0.5 text-center font-display text-lg font-bold text-[#D4AF37]">{verse.numero}</p><div className="min-w-0"><Props verse={verse} onlyPP={onlyPP} details={details}/><div className="mt-3 border-l border-current pl-3"><Stage value={verse.tema_etapa}/></div></div></article>; }
