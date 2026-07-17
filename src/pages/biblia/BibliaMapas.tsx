import { useEffect, useState } from "react";
import { ExternalLink, ImageOff, LoaderCircle, Map, X, ZoomIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BibliaLayout } from "./BibliaLayout";
import { BibliaMapa, getBibliaMapas } from "@/services/bibliaService";

export default function BibliaMapas() {
  const [selected, setSelected] = useState<BibliaMapa | null>(null);
  const { data: maps = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["biblia", "mapas"],
    queryFn: getBibliaMapas,
    staleTime: 10 * 60 * 1000,
  });

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
    <BibliaLayout title="Mapas">
      <section className="rounded-[2rem] border border-[#D4AF37]/25 bg-[#111111] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6">
        <header className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
            <Map className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-[#F8F5EA]">Mapas bíblicos</h1>
            <p className="mt-1 text-sm leading-relaxed text-[#C9C3B3]">
              Explora territorios, recorridos y acontecimientos de la historia de la salvación.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex min-h-52 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-[#D4AF37]">
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> Cargando mapas…
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-950/20 p-6 text-center">
            <p className="text-sm text-red-100">No fue posible cargar los mapas en este momento.</p>
            <button type="button" onClick={() => refetch()} className="mt-4 rounded-full border border-red-200/25 px-4 py-2 text-sm font-semibold text-red-100">
              Intentar nuevamente
            </button>
          </div>
        ) : maps.length === 0 ? (
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-8 text-center">
            <ImageOff className="mx-auto mb-3 h-8 w-8 text-[#D4AF37]" />
            <p className="text-sm text-[#C9C3B3]">Los primeros mapas estarán disponibles próximamente.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {maps.map((map) => (
              <article key={map.id} className="group overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B]">
                <button type="button" onClick={() => setSelected(map)} className="relative block aspect-[4/3] w-full overflow-hidden bg-black text-left">
                  <img src={map.imagen_url} alt={map.titulo} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#D4AF37] text-black shadow-lg">
                    <ZoomIn className="h-4 w-4" />
                  </span>
                </button>
                <div className="p-4">
                  {map.periodo && <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D4AF37]">{map.periodo}</p>}
                  <h2 className="font-display text-xl text-[#F8F5EA]">{map.titulo}</h2>
                  {map.descripcion && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#C9C3B3]">{map.descripcion}</p>}
                  <p className="mt-4 text-xs text-[#8F897C]">{map.fuente} · {map.licencia}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

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
