import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (selectedBook) setTestament(selectedBook.testamento);
  }, [selectedBook]);

  const visibleBooks = books.filter((item) => item.testamento === testament);
  const chapters = Array.from({ length: selectedBook?.capitulos ?? 0 }, (_, index) => index + 1);

  return <div className="space-y-5">
    <section aria-labelledby="selector-libro-title">
      <div className="mb-2 flex items-end justify-between gap-3">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">Libro</p><h3 id="selector-libro-title" className="mt-0.5 text-sm font-semibold text-[#F8F5EA]">{selectedBook?.nombre || "Selecciona un libro"}</h3></div>
        <div className="grid grid-cols-2 rounded-lg border border-[#D4AF37]/25 bg-[#090909] p-1">
          {(["AT","NT"] as TestamentoBiblico[]).map((value)=><button key={value} type="button" onClick={()=>setTestament(value)} aria-pressed={testament===value} className={`min-h-9 rounded-md px-3 text-[10px] font-bold ${testament===value?"bg-[#D4AF37] text-black":"text-[#C9C3B3]"}`}>{value}</button>)}
        </div>
      </div>
      <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
        {visibleBooks.map((item)=><button key={item.codigo} type="button" title={item.nombre} onClick={()=>onBookChange(item.codigo)} aria-pressed={book===item.codigo} className={`min-h-12 rounded-xl border px-2 py-2 text-left text-xs font-semibold transition ${book===item.codigo?"border-[#F2D27A] bg-[#D4AF37] text-black":"border-[#D4AF37]/25 bg-[#111] text-[#F2D27A] hover:border-[#D4AF37]/60"}`}><span className="block truncate">{item.nombre}</span><span className={`mt-0.5 block text-[9px] ${book===item.codigo?"text-black/65":"text-[#8F897C]"}`}>{item.abreviatura}</span></button>)}
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
