import { useEffect, useMemo, useState } from "react";
import { Bookmark, Clock3, Heart, Highlighter, StickyNote } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { BibliaLayout } from "./BibliaLayout";
import {
  listarFavoritos,
  listarHistorial,
  listarMarcadores,
  listarNotasPersonales,
  listarResaltados,
  type FavoritoRow,
  type HistorialRow,
  type MarcadorRow,
  type NotaPersonalRow,
  type ResaltadoRow,
} from "@/features/biblia/db";

type Tab = "favoritos" | "marcadores" | "notas" | "resaltados" | "historial";

const tabs: Array<{ id: Tab; label: string; icon: typeof Heart }> = [
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "marcadores", label: "Marcadores", icon: Bookmark },
  { id: "notas", label: "Notas", icon: StickyNote },
  { id: "resaltados", label: "Resaltados", icon: Highlighter },
  { id: "historial", label: "Historial", icon: Clock3 },
];

export default function BibliaMiBiblia() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") as Tab | null;
  const active: Tab = tabs.some((tab) => tab.id === requested) ? requested! : "favoritos";
  const [favoritos, setFavoritos] = useState<FavoritoRow[]>([]);
  const [marcadores, setMarcadores] = useState<MarcadorRow[]>([]);
  const [notas, setNotas] = useState<NotaPersonalRow[]>([]);
  const [resaltados, setResaltados] = useState<ResaltadoRow[]>([]);
  const [historial, setHistorial] = useState<HistorialRow[]>([]);

  useEffect(() => {
    void Promise.all([listarFavoritos(), listarMarcadores(), listarNotasPersonales(), listarResaltados(), listarHistorial()]).then(([fav, marks, notes, highlights, history]) => {
      setFavoritos(fav); setMarcadores(marks); setNotas(notes); setResaltados(highlights); setHistorial(history);
    });
  }, []);

  const items = useMemo(() => {
    if (active === "favoritos") return favoritos.map((item) => ({ id: item.id, libroCodigo: item.libroCodigo, titulo: `${item.libroNombre || "Biblia"} ${item.capitulo},${item.versiculo}`, texto: item.texto, capitulo: item.capitulo, versiculo: item.versiculo }));
    if (active === "marcadores") return marcadores.map((item) => ({ id: item.id, libroCodigo: item.libroCodigo, titulo: `${item.libroNombre} ${item.capitulo},${item.versiculo}`, texto: item.texto, capitulo: item.capitulo, versiculo: item.versiculo }));
    if (active === "notas") return notas.map((item) => ({ id: item.id, libroCodigo: item.libroCodigo, titulo: `${item.libroNombre || "Biblia"} ${item.capitulo},${(item.versiculos || [item.versiculo]).join("-")}`, texto: item.texto, capitulo: item.capitulo, versiculo: item.versiculo }));
    if (active === "resaltados") return resaltados.map((item) => ({ id: item.id, libroCodigo: item.libroCodigo, titulo: `${item.libroCodigo} ${item.capitulo},${item.versiculo}`, texto: `Color: ${item.color}`, capitulo: item.capitulo, versiculo: item.versiculo }));
    return historial.sort((a, b) => b.visitedAt.localeCompare(a.visitedAt)).map((item) => ({ id: item.id, libroCodigo: item.libroCodigo, titulo: `${item.libroNombre} ${item.capitulo}`, texto: item.texto, capitulo: item.capitulo, versiculo: item.versiculo }));
  }, [active, favoritos, historial, marcadores, notas, resaltados]);

  const ActiveIcon = tabs.find((tab) => tab.id === active)?.icon || Heart;

  return <BibliaLayout title="Mi Biblia" back="/biblia">
    <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setParams({ tab: tab.id })} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-semibold ${active === tab.id ? "border-[#D4AF37] bg-[#D4AF37] text-[#050505]" : "border-[#D4AF37]/25 bg-[#0B0B0B] text-[#C9C3B3]"}`}><tab.icon className="h-4 w-4" />{tab.label}</button>)}
    </div>
    {items.length === 0 ? <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#0B0B0B] p-8 text-center"><ActiveIcon className="mx-auto mb-3 h-8 w-8 text-[#D4AF37]" /><p className="text-[#F8F5EA]">No hay elementos en {tabs.find((tab) => tab.id === active)?.label.toLowerCase()}.</p><p className="mt-2 text-sm text-[#C9C3B3]">Mantén presionado uno o varios versículos para guardarlos aquí.</p></div> : <div className="space-y-3">{items.map((item) => {
      const card = <><div className="font-semibold text-[#F2D27A]">{item.titulo}</div>{item.texto && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#D8D2C6]">{item.texto}</p>}</>;
      return item.libroCodigo ? <Link key={item.id} to={`/biblia/leer?libro=${item.libroCodigo}&cap=${item.capitulo}&versiculo=${item.versiculo}`} className="block rounded-2xl border border-[#D4AF37]/25 bg-[#0B0B0B] p-4 transition hover:border-[#D4AF37]/60">{card}</Link> : <article key={item.id} className="rounded-2xl border border-[#D4AF37]/25 bg-[#0B0B0B] p-4">{card}</article>;
    })}</div>}
  </BibliaLayout>;
}
