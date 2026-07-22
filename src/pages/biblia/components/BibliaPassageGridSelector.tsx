import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { BibliaLibro, TestamentoBiblico } from "@/services/bibliaService";

interface BibliaPassageGridSelectorProps {
  books: BibliaLibro[];
  book: string;
  chapter: number;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: number) => void;
}

export function BibliaPassageGridSelector({ books, book, chapter, onBookChange, onChapterChange }: BibliaPassageGridSelectorProps) {
  const selectedBook = books.find((item) => item.codigo === book);
  const [testament, setTestament] = useState<TestamentoBiblico>(selectedBook?.testamento ?? "AT");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (selectedBook) setTestament(selectedBook.testamento);
  }, [selectedBook]);

  const normalizedQuery = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const visibleBooks = books.filter((item) => item.testamento === testament && (!normalizedQuery || `${item.nombre} ${item.abreviatura} ${item.codigo}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery)));
  const groups = Array.from(new Set(books.filter((item)=>item.testamento===testament).map((item)=>item.grupo).filter(Boolean)));
  const chapters = Array.from({ length: selectedBook?.capitulos ?? 0 }, (_, index) => index + 1);

  const groupTone = (group: string) => {
    const value=group.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(value.includes("pentateuco")||value.includes("ley"))return "border-amber-400/80 bg-amber-500/35 text-amber-50";
    if(value.includes("histor"))return "border-lime-400/60 bg-lime-500/20 text-lime-50";
    if(value.includes("sapien")||value.includes("poet"))return "border-violet-400/65 bg-violet-500/25 text-violet-50";
    if(value.includes("profet"))return "border-orange-400/75 bg-orange-600/30 text-orange-50";
    if(value.includes("evangel"))return "border-cyan-400/65 bg-cyan-500/20 text-cyan-50";
    if(value.includes("carta")||value.includes("paulin")||value.includes("epistol"))return "border-sky-400/65 bg-sky-500/20 text-sky-50";
    return "border-[#D4AF37]/45 bg-[#D4AF37]/12 text-[#F2D27A]";
  };

  return <div className="space-y-5">
    <section aria-labelledby="selector-libro-title">
      <label className="relative mb-3 block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4AF37]"/><span className="sr-only">Buscar libro bíblico</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Buscar libro bíblico…" className="h-12 w-full rounded-2xl border border-[#D4AF37]/35 bg-[#090909] pl-10 pr-4 text-sm text-[#F8F5EA] outline-none placeholder:text-[#706A5E] focus:border-[#D4AF37]"/></label>
      <div className="mb-3 grid grid-cols-2 rounded-xl border border-[#D4AF37]/35 bg-[#090909] p-1">
        {(["AT","NT"] as TestamentoBiblico[]).map((value)=><button key={value} type="button" onClick={()=>{setTestament(value);setQuery("");}} aria-pressed={testament===value} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${testament===value?"border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#F2D27A]":"text-[#C9C3B3]"}`}>{value==="AT"?"Antiguo Testamento":"Nuevo Testamento"}</button>)}
      </div>
      <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#080808] p-3">
        <div className="mb-3"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">{testament==="AT"?"Antiguo Testamento":"Nuevo Testamento"}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">{groups.map((group)=><span key={group} className="inline-flex items-center gap-1 text-[9px] text-[#C9C3B3]"><i className={`h-2 w-2 rounded-full border ${groupTone(group)}`}/>{group}</span>)}</div></div>
        <h3 id="selector-libro-title" className="sr-only">{selectedBook?.nombre || "Selecciona un libro"}</h3>
        <div className="grid max-h-[28rem] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 lg:grid-cols-5">
          {visibleBooks.map((item)=><button key={item.codigo} type="button" title={item.nombre} onClick={()=>onBookChange(item.codigo)} aria-pressed={book===item.codigo} className={`min-h-16 rounded-xl border px-1.5 py-2 text-center transition ${book===item.codigo?"border-[#F2D27A] bg-[#D4AF37] text-black ring-2 ring-[#F2D27A]/35":groupTone(item.grupo)}`}><span className="block truncate font-display text-base font-semibold">{item.abreviatura}</span><span className={`mt-0.5 block truncate text-[9px] ${book===item.codigo?"text-black/70":"opacity-80"}`}>{item.nombre}</span></button>)}
          {visibleBooks.length===0&&<p className="col-span-full py-8 text-center text-sm text-[#8F897C]">No se encontraron libros.</p>}
        </div>
      </div>
    </section>

    {selectedBook&&<section aria-labelledby="selector-capitulo-title">
      <div className="mb-2"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">Capítulo</p><h3 id="selector-capitulo-title" className="mt-0.5 text-sm font-semibold text-[#F8F5EA]">{chapter>0?`${selectedBook.nombre} ${chapter}`:"Selecciona un capítulo"}</h3></div>
      <div className="grid max-h-52 grid-cols-6 gap-2 overflow-y-auto pr-1 sm:grid-cols-8">
        {chapters.map((value)=><button key={value} type="button" onClick={()=>onChapterChange(value)} aria-pressed={chapter===value} className={`aspect-square rounded-xl border text-sm font-semibold transition ${chapter===value?"border-[#F2D27A] bg-[#D4AF37] text-black":"border-[#D4AF37]/25 bg-[#111] text-[#F2D27A] hover:border-[#D4AF37]/60"}`}>{value}</button>)}
      </div>
    </section>}
  </div>;
}
