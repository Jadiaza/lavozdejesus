import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ExternalLink, Home, ImageOff, LoaderCircle, Map, MapPin, Search, ScrollText, UsersRound, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BibliaLayout } from "./BibliaLayout";
import { Link } from "react-router-dom";
import { BibliaMapa, getBibliaMapas } from "@/services/bibliaService";

export default function BibliaMapas() {
  const [selected, setSelected] = useState<BibliaMapa | null>(null);
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState("todos");
  const { data: maps = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["biblia", "mapas"],
    queryFn: getBibliaMapas,
    staleTime: 10 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return maps.filter((map) => {
      const haystack = `${map.titulo} ${map.descripcion} ${map.periodo}`.toLocaleLowerCase("es");
      const matchesSearch = !term || haystack.includes(term);
      const period = (map.periodo || "").toLocaleLowerCase("es");
      const matchesTestament = testament === "todos" || (testament === "AT" ? period.includes("antiguo") : period.includes("nuevo"));
      return matchesSearch && matchesTestament;
    });
  }, [maps, search, testament]);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <BibliaLayout title="Mapas" hideBottomNav hideBack>
      <section className="pb-3">
        <p className="mb-4 px-1 text-[15px] leading-6 text-[#C9C3B3]">Explora territorios, recorridos y acontecimientos de la historia de la salvación.</p>
        <label className="relative mb-3 block"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8F897C]" /><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar mapa..." className="h-12 w-full rounded-2xl border border-[#D4AF37]/30 bg-[#080808] pl-12 pr-4 text-[15px] text-[#F8F5EA] outline-none focus:border-[#D4AF37]" /></label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <select value={testament} onChange={(event) => setTestament(event.target.value)} className="h-11 min-w-0 rounded-2xl border border-[#D4AF37]/25 bg-[#080808] px-3 text-[13px] text-[#F8F5EA] outline-none"><option value="todos">Todos los testamentos</option><option value="AT">Antiguo Testamento</option><option value="NT">Nuevo Testamento</option></select>
          <div className="flex h-11 items-center rounded-2xl border border-[#D4AF37]/25 bg-[#080808] px-3 text-[13px] text-[#C9C3B3]">Todos los mapas</div>
        </div>
        {isLoading ? <div className="flex min-h-40 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-[#D4AF37]"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Cargando mapas…</div>
        : isError ? <div className="rounded-2xl border border-red-400/25 bg-red-950/20 p-5 text-center"><p className="text-sm text-red-100">No fue posible cargar los mapas.</p><button type="button" onClick={() => refetch()} className="mt-3 rounded-full border border-red-200/25 px-4 py-2 text-sm font-semibold text-red-100">Intentar nuevamente</button></div>
        : maps.length === 0 ? <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-6 text-center"><ImageOff className="mx-auto mb-2 h-7 w-7 text-[#D4AF37]" /><p className="text-sm text-[#C9C3B3]">Los primeros mapas estarán disponibles próximamente.</p></div>
        : filtered.length === 0 ? <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-6 text-center text-sm text-[#C9C3B3]">No encontramos mapas con esos filtros.</div>
        : <div className="space-y-2.5">{filtered.map((map) => (
          <button key={map.id} type="button" onClick={() => setSelected(map)} className="group flex min-h-[116px] w-full overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-left transition active:bg-[#111111]">
            <div className="w-[112px] shrink-0 overflow-hidden bg-black sm:w-[132px]"><img src={map.imagen_url} alt={map.titulo} loading="lazy" className="h-full w-full object-cover" /></div>
            <div className="flex min-w-0 flex-1 items-center p-3"><div className="min-w-0 flex-1">{map.periodo && <p className="mb-1 truncate text-[9px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">{map.periodo}</p>}<h2 className="font-display text-xl leading-tight text-[#F8F5EA]">{map.titulo}</h2>{map.descripcion && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#C9C3B3]">{map.descripcion}</p>}<p className="mt-2 truncate text-[10px] text-[#8F897C]">{map.fuente} · {map.licencia}</p></div><ChevronRight className="ml-2 h-5 w-5 shrink-0 text-[#D4AF37]" /></div>
          </button>
        ))}</div>}
      </section>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D4AF37]/25 bg-[#080808]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"><div className="mx-auto grid h-[76px] max-w-[640px] grid-cols-5">
        <Link to="/biblia" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><Home className="h-5 w-5" /><span className="text-[10px]">Inicio</span></Link>
        <Link to="/biblia/explorar" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><UsersRound className="h-5 w-5" /><span className="text-[10px]">Personajes</span></Link>
        <button type="button" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><MapPin className="h-5 w-5" /><span className="text-[10px]">Lugares</span></button>
        <div className="relative flex flex-col items-center justify-center gap-1 text-[#D4AF37]"><Map className="h-5 w-5" /><span className="text-[10px] font-semibold">Mapas</span><span className="absolute bottom-1 h-0.5 w-7 rounded-full bg-[#D4AF37]" /></div>
        <button type="button" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><ScrollText className="h-5 w-5" /><span className="text-[10px]">Cronología</span></button>
      </div></nav>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={selected.titulo} onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-[#0B0B0B] shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#D4AF37]/20 px-4 py-3">
              <div className="min-w-0"><p className="truncate font-display text-lg text-[#F8F5EA]">{selected.titulo}</p>{selected.periodo && <p className="text-xs text-[#D4AF37]">{selected.periodo}</p>}</div>
              <button type="button" onClick={() => setSelected(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white" aria-label="Cerrar mapa"><X className="h-5 w-5" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-black p-2 text-center sm:p-4">
              <img src={selected.imagen_url} alt={selected.titulo} className="mx-auto h-auto max-w-full" />
            </div>
            <div className="border-t border-[#D4AF37]/20 px-4 py-3 text-sm text-[#C9C3B3]">
              {selected.descripcion && <p className="mb-2 leading-relaxed">{selected.descripcion}</p>}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#8F897C]">
                <span>Fuente: {selected.fuente}</span><span>·</span><span>{selected.licencia}</span>
                {selected.fuente_url && <a href={selected.fuente_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#D4AF37]">Ver fuente <ExternalLink className="h-3 w-3" /></a>}
              </div>
            </div>
          </div>
        </div>
      )}
    </BibliaLayout>
  );
}
