import { useMemo } from "react";
import { BookOpen, ExternalLink, Home, LoaderCircle, Map, MapPin, ScrollText, UsersRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { BibliaLayout } from "./BibliaLayout";
import { getBibliaPersonajes } from "@/services/bibliaService";

export default function BibliaPersonajeDetalle() {
  const { id } = useParams();
  const { data: characters = [], isLoading } = useQuery({ queryKey: ["biblia","personajes"], queryFn: getBibliaPersonajes, staleTime: 10 * 60 * 1000 });
  const selected = useMemo(() => characters.find((item) => String(item.id) === String(id)), [characters,id]);

  return <BibliaLayout title={selected?.nombre ?? "Personaje"} hideBottomNav hideBack>
    {isLoading ? <div className="flex min-h-[60vh] items-center justify-center text-[#D4AF37]"><LoaderCircle className="mr-2 h-5 w-5 animate-spin"/> Cargando personaje…</div>
    : !selected ? <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#0B0B0B] p-6 text-center text-[#C9C3B3]">No encontramos este personaje.</div>
    : <article className="overflow-hidden bg-[#070707]">
      <div className="relative min-h-[300px] overflow-hidden bg-black sm:min-h-[380px]">
        <img src={selected.imagen_url} alt={selected.nombre} className="absolute inset-0 h-full w-full object-cover"/>
        <span className="absolute inset-0 bg-gradient-to-t from-[#070707] via-black/45 to-black/10"/>
        <span className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black via-black/70 to-transparent"/>
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 [text-shadow:0_2px_8px_rgba(0,0,0,0.95)] sm:p-7">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">{selected.testamento === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}</p>
          <h1 className="font-display text-4xl leading-none text-[#F8F5EA] sm:text-5xl">{selected.nombre}</h1>
          {selected.nombre_alternativo && <p className="mt-2 text-base text-[#D8D2C4]">{selected.nombre_alternativo}</p>}
          <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[10px] text-[#E4DFD4]">{selected.testamento === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}</span><span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[10px] text-[#E4DFD4]">{selected.categoria}</span></div>
        </div>
      </div>
      <div className="space-y-4 py-4">
        <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#0B0B0B] p-5"><div className="mb-3 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#D4AF37]"><BookOpen className="h-5 w-5"/></span><h2 className="font-display text-2xl text-[#F2D27A]">Quién fue</h2></div><p className="whitespace-pre-line text-sm leading-7 text-[#D8D2C4]">{selected.resumen}</p></section>
        {selected.pasajes_principales && <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#0B0B0B] p-5"><div className="mb-3 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#D4AF37]"><BookOpen className="h-5 w-5"/></span><h2 className="text-sm font-bold uppercase tracking-[0.1em] text-[#D4AF37]">Pasajes principales</h2></div><div className="rounded-xl border border-[#D4AF37]/25 bg-[#111] px-4 py-3"><p className="whitespace-pre-line text-sm leading-6 text-[#E4DFD4]">{selected.pasajes_principales}</p></div></section>}
        {selected.ensenanza && <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#0B0B0B] p-5"><div className="mb-3 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#D4AF37]"><BookOpen className="h-5 w-5"/></span><h2 className="font-display text-2xl text-[#F2D27A]">Enseñanza</h2></div><p className="whitespace-pre-line text-sm leading-7 text-[#D8D2C4]">{selected.ensenanza}</p></section>}
        <footer className="flex flex-wrap items-center gap-2 px-1 text-[10px] text-[#8F897C]"><span>Imagen: {selected.fuente}</span><span>·</span><span>{selected.licencia}</span>{selected.fuente_url && <a href={selected.fuente_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#D4AF37]">Ver fuente <ExternalLink className="h-3 w-3"/></a>}</footer>
      </div>
    </article>}
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D4AF37]/25 bg-[#080808]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"><div className="mx-auto grid h-[76px] max-w-[640px] grid-cols-5">
      <Link to="/biblia" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><Home className="h-5 w-5"/><span className="text-[10px]">Inicio</span></Link>
      <Link to="/biblia/explorar" className="relative flex flex-col items-center justify-center gap-1 text-[#D4AF37]"><UsersRound className="h-5 w-5"/><span className="text-[10px] font-semibold">Personajes</span><span className="absolute bottom-1 h-0.5 w-7 rounded-full bg-[#D4AF37]"/></Link>
      <button type="button" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><MapPin className="h-5 w-5"/><span className="text-[10px]">Lugares</span></button>
      <Link to="/biblia/mapas" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><Map className="h-5 w-5"/><span className="text-[10px]">Mapas</span></Link>
      <button type="button" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><ScrollText className="h-5 w-5"/><span className="text-[10px]">Cronología</span></button>
    </div></nav>
  </BibliaLayout>;
}
