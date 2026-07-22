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
  const visualGroup = (item: BibliaLibro) => {
    if (["TOB","JDT","1MA","2MA"].includes(item.codigo)) return "Históricos";
    if (["WIS","SIR"].includes(item.codigo)) return "Sapienciales";
    if (item.codigo === "BAR") return "Proféticos";
    const value=item.grupo.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(value.includes("pentateuco")||value.includes("ley"))return "Pentateuco";
    if(item.testamento==="AT"&&value.includes("histor"))return "Históricos";
    if(value.includes("sapien")||value.includes("poet"))return "Sapienciales";
    if(value.includes("profet"))return "Proféticos";
    if(value.includes("evangel"))return "Evangelios";
    if(value.includes("histor")||value.includes("hecho"))return "Hechos";
    if(value.includes("paulin")||value.includes("pastoral"))return "Cartas paulinas";
    if(value.includes("catolic")||value.includes("general"))return "Cartas generales";
    if(value.includes("apocal"))return "Apocalipsis";
    return item.grupo;
  };
  const visibleBooks = books.filter((item) => item.testamento === testament && (!normalizedQuery || `${item.nombre} ${item.abreviatura} ${item.codigo}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery)));
  const groups = Array.from(new Set(books.filter((item)=>item.testamento===testament).map(visualGroup).filter(Boolean)));
  const chapters = Array.from({ length: selectedBook?.capitulos ?? 0 }, (_, index) => index + 1);

  const groupTone = (group: string) => {
    const value=group.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
    if(value.includes("pentateuco")||value.includes("ley"))return "border-[#e7bd45] bg-[linear-gradient(145deg,rgba(231,189,69,0.58),rgba(231,189,69,0.22))] text-[#FFF9E9]";
    if(value.includes("histor"))return "border-[#82974e] bg-[linear-gradient(145deg,rgba(130,151,78,0.58),rgba(130,151,78,0.22))] text-[#FFF9E9]";
    if(value.includes("sapien")||value.includes("poet"))return "border-[#9b75b8] bg-[linear-gradient(145deg,rgba(155,117,184,0.58),rgba(155,117,184,0.22))] text-[#FFF9E9]";
    if(value.includes("profet"))return "border-[#df7b31] bg-[linear-gradient(145deg,rgba(223,123,49,0.58),rgba(223,123,49,0.22))] text-[#FFF9E9]";
    if(value.includes("evangel"))return "border-[#4d8bd8] bg-[linear-gradient(145deg,rgba(77,139,216,0.58),rgba(77,139,216,0.22))] text-[#FFF9E9]";
    if(value.includes("hecho"))return "border-[#61bbb7] bg-[linear-gradient(145deg,rgba(97,187,183,0.58),rgba(97,187,183,0.22))] text-[#FFF9E9]";
    if(value.includes("paulin"))return "border-[#e7bd45] bg-[linear-gradient(145deg,rgba(231,189,69,0.58),rgba(231,189,69,0.22))] text-[#FFF9E9]";
    if(value.includes("general"))return "border-[#9b75b8] bg-[linear-gradient(145deg,rgba(155,117,184,0.58),rgba(155,117,184,0.22))] text-[#FFF9E9]";
    if(value.includes("apocal"))return "border-[#ce4b57] bg-[linear-gradient(145deg,rgba(206,75,87,0.58),rgba(206,75,87,0.22))] text-[#FFF9E9]";
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
          {visibleBooks.map((item)=><button key={item.codigo} type="button" title={`${item.nombre} · ${visualGroup(item)}`} onClick={()=>onBookChange(item.codigo)} aria-pressed={book===item.codigo} className={`min-h-16 rounded-xl border px-1.5 py-2 text-center transition ${book===item.codigo?"border-[#F2D27A] bg-[#D4AF37] text-black ring-2 ring-[#F2D27A]/35":groupTone(visualGroup(item))}`}><span className="block truncate font-display text-base font-semibold">{item.abreviatura}</span><span className={`mt-0.5 block truncate text-[9px] ${book===item.codigo?"text-black/70":"opacity-80"}`}>{item.nombre}</span></button>)}
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
