import { useMemo, useState } from "react";
import { Home, LoaderCircle, Map, MapPin, Search, ScrollText, UserRound, UsersRound, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BibliaLayout } from "./BibliaLayout";
import { Link } from "react-router-dom";
import { BibliaPersonaje, getBibliaPersonajes } from "@/services/bibliaService";

type TestamentFilter = "todos" | "AT" | "NT";

export default function BibliaPersonajes() {
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<TestamentFilter>("todos");
  const [category, setCategory] = useState("todas");
  const { data: characters = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["biblia", "personajes"],
    queryFn: getBibliaPersonajes,
    staleTime: 10 * 60 * 1000,
  });

  const categories = useMemo(
    () => Array.from(new Set(characters.map((character) => character.categoria))).sort(),
    [characters],
  );
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es");
    return characters.filter((character) => {
      const matchesSearch = !term || `${character.nombre} ${character.nombre_alternativo}`.toLocaleLowerCase("es").includes(term);
      const matchesTestament = testament === "todos" || character.testamento === testament;
      const matchesCategory = category === "todas" || character.categoria === category;
      return matchesSearch && matchesTestament && matchesCategory;
    });
  }, [characters, search, testament, category]);



  return (
    <BibliaLayout title="Explorar" hideBottomNav hideBack>
      <section className="pb-3">
        <p className="mb-4 px-1 text-[15px] leading-6 text-[#C9C3B3]">Profundiza en la riqueza de la Biblia a través de sus personajes, lugares, mapas y más.</p>

        <div className="mb-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8F897C]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar personaje..." className="h-12 w-full rounded-2xl border border-[#D4AF37]/30 bg-[#080808] pl-12 pr-4 text-[15px] text-[#F8F5EA] outline-none focus:border-[#D4AF37]" />
          </label>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <select value={testament} onChange={(event) => setTestament(event.target.value as TestamentFilter)} className="h-11 min-w-0 rounded-2xl border border-[#D4AF37]/25 bg-[#080808] px-3 text-[13px] text-[#F8F5EA] outline-none"><option value="todos">Todos los testamentos</option><option value="AT">Antiguo Testamento</option><option value="NT">Nuevo Testamento</option></select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 min-w-0 rounded-2xl border border-[#D4AF37]/25 bg-[#080808] px-3 text-[13px] text-[#F8F5EA] outline-none"><option value="todas">Todas las categorías</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-[#D4AF37]"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Cargando personajes…</div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-950/20 p-5 text-center"><p className="text-sm text-red-100">No fue posible cargar los personajes.</p><button type="button" onClick={() => refetch()} className="mt-3 rounded-full border border-red-200/25 px-4 py-2 text-sm font-semibold text-red-100">Intentar nuevamente</button></div>
        ) : characters.length === 0 ? (
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-6 text-center"><UserRound className="mx-auto mb-2 h-7 w-7 text-[#D4AF37]" /><p className="text-sm text-[#C9C3B3]">Los primeros personajes estarán disponibles próximamente.</p></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-6 text-center"><Search className="mx-auto mb-2 h-7 w-7 text-[#D4AF37]" /><p className="text-sm text-[#C9C3B3]">No encontramos personajes con esos filtros.</p></div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((character) => (
              <button key={character.id} type="button" onClick={() => window.location.assign(`/biblia/personajes/${character.id}`)} className="group flex w-full min-h-[116px] overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-left transition active:bg-[#111111]">
                <div className="w-[112px] shrink-0 overflow-hidden bg-black sm:w-[132px]"><img src={character.imagen_url} alt={character.nombre} loading="lazy" className="h-full w-full object-cover" /></div>
                <div className="flex min-w-0 flex-1 items-center p-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl leading-tight text-[#F8F5EA]">{character.nombre}</h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#C9C3B3]">{character.resumen}</p>
                    <div className="mt-2 flex min-w-0 gap-1.5 overflow-hidden">
                      <span className="truncate rounded-full border border-[#D4AF37]/45 px-2 py-1 text-[9px] font-semibold text-[#D4AF37]">{character.testamento === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}</span>
                      <span className="truncate rounded-full border border-white/15 px-2 py-1 text-[9px] text-[#C9C3B3]">{character.categoria}</span>
                    </div>
                  </div>
                  <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-[#D4AF37]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D4AF37]/25 bg-[#080808]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto grid h-[76px] max-w-[640px] grid-cols-5">
          <Link to="/biblia" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><Home className="h-5 w-5" /><span className="text-[10px]">Inicio</span></Link>
          <div className="relative flex flex-col items-center justify-center gap-1 text-[#D4AF37]"><UsersRound className="h-5 w-5" /><span className="text-[10px] font-semibold">Personajes</span><span className="absolute bottom-1 h-0.5 w-7 rounded-full bg-[#D4AF37]" /></div>
          <button type="button" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><MapPin className="h-5 w-5" /><span className="text-[10px]">Lugares</span></button>
          <Link to="/biblia/mapas" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><Map className="h-5 w-5" /><span className="text-[10px]">Mapas</span></Link>
          <button type="button" className="flex flex-col items-center justify-center gap-1 text-[#B8B3AA]"><ScrollText className="h-5 w-5" /><span className="text-[10px]">Cronología</span></button>
        </div>
      </nav>


    </BibliaLayout>
  );
}
