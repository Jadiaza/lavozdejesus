import { useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, LoaderCircle, Search, UserRound, UsersRound, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BibliaLayout } from "./BibliaLayout";
import { BibliaPersonaje, getBibliaPersonajes } from "@/services/bibliaService";

type TestamentFilter = "todos" | "AT" | "NT";

export default function BibliaPersonajes() {
  const [selected, setSelected] = useState<BibliaPersonaje | null>(null);
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
    <BibliaLayout title="Personajes bíblicos">
      <section className="rounded-[2rem] border border-[#D4AF37]/25 bg-[#111111] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <header className="mb-5 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]"><UsersRound className="h-6 w-6" /></div>
          <div><h1 className="font-display text-2xl text-[#F8F5EA]">Personajes bíblicos</h1><p className="mt-1 text-sm leading-relaxed text-[#C9C3B3]">Conoce su historia, sus pasajes principales y su lugar en la historia de la salvación.</p></div>
        </header>

        <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F897C]" /><input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar personaje…" className="h-11 w-full rounded-xl border border-[#D4AF37]/20 bg-[#080808] pl-10 pr-3 text-sm text-[#F8F5EA] outline-none focus:border-[#D4AF37]" /></label>
          <select value={testament} onChange={(event) => setTestament(event.target.value as TestamentFilter)} className="h-11 rounded-xl border border-[#D4AF37]/20 bg-[#080808] px-3 text-sm text-[#F8F5EA] outline-none"><option value="todos">Todos los testamentos</option><option value="AT">Antiguo Testamento</option><option value="NT">Nuevo Testamento</option></select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-xl border border-[#D4AF37]/20 bg-[#080808] px-3 text-sm text-[#F8F5EA] outline-none"><option value="todas">Todas las categorías</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
        </div>

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-[#D4AF37]"><LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Cargando personajes…</div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-950/20 p-6 text-center"><p className="text-sm text-red-100">No fue posible cargar los personajes.</p><button type="button" onClick={() => refetch()} className="mt-4 rounded-full border border-red-200/25 px-4 py-2 text-sm font-semibold text-red-100">Intentar nuevamente</button></div>
        ) : characters.length === 0 ? (
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-8 text-center"><UserRound className="mx-auto mb-3 h-8 w-8 text-[#D4AF37]" /><p className="text-sm text-[#C9C3B3]">Los primeros personajes estarán disponibles próximamente.</p></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-8 text-center"><Search className="mx-auto mb-3 h-8 w-8 text-[#D4AF37]" /><p className="text-sm text-[#C9C3B3]">No encontramos personajes con esos filtros.</p></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((character) => (
              <button key={character.id} type="button" onClick={() => setSelected(character)} className="group overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-left transition hover:-translate-y-0.5 hover:border-[#D4AF37]/45">
                <div className="aspect-[4/3] overflow-hidden bg-black"><img src={character.imagen_url} alt={character.nombre} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                <div className="p-4"><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full border border-[#D4AF37]/25 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">{character.testamento === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}</span><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-[#C9C3B3]">{character.categoria}</span></div><h2 className="font-display text-xl text-[#F8F5EA]">{character.nombre}</h2>{character.nombre_alternativo && <p className="mt-1 text-xs text-[#8F897C]">{character.nombre_alternativo}</p>}<p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#C9C3B3]">{character.resumen}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37]">Ver ficha <BookOpen className="h-3.5 w-3.5" /></span></div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-label={selected.nombre} onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <article className="max-h-full w-full max-w-4xl overflow-auto rounded-2xl border border-[#D4AF37]/30 bg-[#0B0B0B] shadow-2xl">
            <div className="relative aspect-[16/8] overflow-hidden bg-black"><img src={selected.imagen_url} alt={selected.nombre} className="h-full w-full object-cover" /><span className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-black/20" /><button type="button" onClick={() => setSelected(null)} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white" aria-label="Cerrar ficha"><X className="h-5 w-5" /></button><div className="absolute inset-x-0 bottom-0 p-5 sm:p-7"><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D4AF37]">{selected.categoria} · {selected.testamento === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}</p><h2 className="font-display text-3xl text-[#F8F5EA] sm:text-4xl">{selected.nombre}</h2>{selected.nombre_alternativo && <p className="mt-1 text-sm text-[#C9C3B3]">{selected.nombre_alternativo}</p>}</div></div>
            <div className="space-y-5 p-5 sm:p-7"><section><h3 className="mb-2 font-display text-xl text-[#F2D27A]">Quién fue</h3><p className="whitespace-pre-line text-sm leading-7 text-[#D8D2C4]">{selected.resumen}</p></section>{selected.pasajes_principales && <section className="rounded-2xl border border-[#D4AF37]/20 bg-[#111] p-4"><h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-[#D4AF37]">Pasajes principales</h3><p className="whitespace-pre-line text-sm leading-6 text-[#D8D2C4]">{selected.pasajes_principales}</p></section>}{selected.ensenanza && <section><h3 className="mb-2 font-display text-xl text-[#F2D27A]">Enseñanza</h3><p className="whitespace-pre-line text-sm leading-7 text-[#D8D2C4]">{selected.ensenanza}</p></section>}<footer className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#D4AF37]/20 pt-4 text-xs text-[#8F897C]"><span>Imagen: {selected.fuente}</span><span>·</span><span>{selected.licencia}</span>{selected.fuente_url && <a href={selected.fuente_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#D4AF37]">Ver fuente <ExternalLink className="h-3 w-3" /></a>}</footer></div>
          </article>
        </div>
      )}
    </BibliaLayout>
  );
}
