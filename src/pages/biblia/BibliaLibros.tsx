import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BibliaLayout } from "./BibliaLayout";
import { getBibliaCatalogo, type BibliaLibro, type TestamentoBiblico } from "@/services/bibliaService";

type Grupo = "pentateuco" | "historicos" | "sapienciales" | "profeticos" | "evangelios" | "hechos" | "paulinas" | "generales" | "apocalipsis";

const normalizar = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const grupoDe = (book: BibliaLibro): Grupo => {
  const grupo = normalizar(book.grupo || "");
  if (grupo.includes("pentateuco")) return "pentateuco";
  if (grupo.includes("histor")) return "historicos";
  if (grupo.includes("sapien") || grupo.includes("poetic")) return "sapienciales";
  if (grupo.includes("profet")) return "profeticos";
  if (grupo.includes("evangel")) return "evangelios";
  if (grupo.includes("hecho")) return "hechos";
  if (grupo.includes("paulin")) return "paulinas";
  if (grupo.includes("general") || grupo.includes("catolic")) return "generales";
  if (grupo.includes("apocal")) return "apocalipsis";
  if (book.testamento === "AT") {
    if (book.orden <= 5) return "pentateuco";
    if (book.orden <= 19 || book.orden === 45 || book.orden === 46) return "historicos";
    if (book.orden <= 26) return "sapienciales";
    return "profeticos";
  }
  if (book.orden <= 50) return "evangelios";
  if (book.orden === 51) return "hechos";
  if (book.orden <= 65) return "paulinas";
  if (book.orden <= 72) return "generales";
  return "apocalipsis";
};

const estilos: Record<Grupo, string> = {
  pentateuco: "border-[#e7bd45] bg-[linear-gradient(145deg,rgba(231,189,69,0.58),rgba(231,189,69,0.22))]",
  historicos: "border-[#82974e] bg-[linear-gradient(145deg,rgba(130,151,78,0.58),rgba(130,151,78,0.22))]",
  sapienciales: "border-[#9b75b8] bg-[linear-gradient(145deg,rgba(155,117,184,0.58),rgba(155,117,184,0.22))]",
  profeticos: "border-[#df7b31] bg-[linear-gradient(145deg,rgba(223,123,49,0.58),rgba(223,123,49,0.22))]",
  evangelios: "border-[#4d8bd8] bg-[linear-gradient(145deg,rgba(77,139,216,0.58),rgba(77,139,216,0.22))]",
  hechos: "border-[#61bbb7] bg-[linear-gradient(145deg,rgba(97,187,183,0.58),rgba(97,187,183,0.22))]",
  paulinas: "border-[#e7bd45] bg-[linear-gradient(145deg,rgba(231,189,69,0.58),rgba(231,189,69,0.22))]",
  generales: "border-[#9b75b8] bg-[linear-gradient(145deg,rgba(155,117,184,0.58),rgba(155,117,184,0.22))]",
  apocalipsis: "border-[#ce4b57] bg-[linear-gradient(145deg,rgba(206,75,87,0.58),rgba(206,75,87,0.22))]",
};

const leyenda: Array<[Grupo, string, string]> = [
  ["pentateuco", "Pentateuco", "bg-[#e7bd45]"], ["historicos", "Históricos", "bg-[#82974e]"],
  ["sapienciales", "Sapienciales", "bg-[#9b75b8]"], ["profeticos", "Proféticos", "bg-[#df7b31]"],
  ["evangelios", "Evangelios", "bg-[#4d8bd8]"], ["hechos", "Hechos", "bg-[#61bbb7]"],
  ["paulinas", "Cartas paulinas", "bg-[#e7bd45]"], ["generales", "Cartas generales", "bg-[#9b75b8]"],
  ["apocalipsis", "Apocalipsis", "bg-[#ce4b57]"],
];

export default function BibliaLibros() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const libroConservado = (params.get("libro") || "").toUpperCase();
  const capituloConservado = Number(params.get("cap") || 0);
  const [testamento, setTestamento] = useState<TestamentoBiblico>("AT");
  const [libros, setLibros] = useState<BibliaLibro[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [seleccionado, setSeleccionado] = useState<BibliaLibro | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBibliaCatalogo().then(({ libros }) => {
      setLibros(libros);
      const anterior = libros.find((book) => book.codigo === libroConservado);
      if (anterior) {
        setTestamento(anterior.testamento);
        setSeleccionado(anterior);
      }
    }).catch((e: Error) => setError(e.message)).finally(() => setCargando(false));
  }, [libroConservado]);

  const visibles = useMemo(() => {
    const query = normalizar(busqueda.trim());
    return libros.filter((book) => (!query ? book.testamento === testamento : normalizar(`${book.nombre} ${book.abreviatura} ${book.codigo}`).includes(query)));
  }, [busqueda, libros, testamento]);
  const grupos = leyenda.filter(([grupo]) => visibles.some((book) => grupoDe(book) === grupo));

  return <BibliaLayout title="Elegir libro" back="/biblia">
    <div className="relative mb-4 mt-1">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#D4AF37]" />
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar libro bíblico..." className="h-14 w-full rounded-full border border-[#D4AF37]/35 bg-[#0c0c0c]/90 pl-12 pr-11 text-sm text-[#F8F5EA] outline-none placeholder:text-[#827d72] focus:border-[#D4AF37]/80" />
      {busqueda && <button type="button" onClick={() => setBusqueda("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9C3B3]" aria-label="Limpiar búsqueda"><X className="h-4 w-4" /></button>}
    </div>
    <div className="mb-4 grid grid-cols-2 rounded-xl border border-[#D4AF37]/35 bg-[#0b0b0b] p-1">
      {(["AT", "NT"] as const).map((value) => <button key={value} type="button" onClick={() => { setTestamento(value); setBusqueda(""); }} className={`rounded-lg px-2 py-3 text-sm ${testamento === value && !busqueda ? "border border-[#D4AF37]/35 bg-[#D4AF37]/10 font-semibold text-[#F2D27A]" : "text-[#B7B1A5]"}`}>{value === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}</button>)}
    </div>
    <section className="rounded-[1.7rem] border border-[#D4AF37]/30 bg-[#090a0a]/90 p-4 shadow-[0_22px_65px_rgba(0,0,0,0.45)]">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">{busqueda ? "Resultados" : testamento === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}</h2>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">{grupos.map(([grupo, label, dot]) => <span key={grupo} className="inline-flex items-center gap-1.5 text-[11px] text-[#D5D0C6]"><span className={`h-2.5 w-2.5 rounded-full ${dot}`} />{label}</span>)}</div>
      {cargando && <p className="py-12 text-center text-sm text-[#C9C3B3]">Cargando libros…</p>}
      {error && <p className="py-8 text-center text-sm text-red-300">{error}</p>}
      {!cargando && !error && <div className="grid grid-cols-3 gap-2 min-[390px]:grid-cols-4 md:grid-cols-5">{visibles.map((book) => <button key={book.id} type="button" onClick={() => setSeleccionado(book)} className={`min-h-[4.55rem] rounded-xl border px-1.5 py-2 shadow-[inset_0_1px_rgba(255,255,255,0.08)] transition active:scale-95 ${estilos[grupoDe(book)]}`}><span className="font-display block text-xl leading-none text-[#FFF9E9]">{book.abreviatura}</span><span className="mt-1 line-clamp-2 block text-[10px] leading-tight text-[#F5F0E5]/90">{book.nombre}</span></button>)}</div>}
      {!cargando && !error && !visibles.length && <p className="py-10 text-center text-sm text-[#C9C3B3]">No encontramos ese libro.</p>}
    </section>
    {seleccionado && <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/75 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-sm" onClick={() => setSeleccionado(null)}><div className="w-full max-w-[430px] rounded-[1.7rem] border border-[#D4AF37]/45 bg-[#0b0b0b] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}><button type="button" onClick={() => setSeleccionado(null)} className="mb-3 inline-flex items-center gap-1 text-xs text-[#D4AF37]"><ChevronLeft className="h-4 w-4" /> Volver a los libros</button><h2 className="font-display text-2xl text-[#F8F5EA]">{seleccionado.nombre}</h2><p className="mb-4 mt-1 text-sm text-[#C9C3B3]">Elige un capítulo</p><div className="max-h-[calc(100dvh-13rem)] overflow-y-auto pr-1"><div className="grid grid-cols-6 gap-2">{Array.from({ length: seleccionado.capitulos }, (_, i) => i + 1).map((cap) => <button key={cap} type="button" onClick={() => navigate(`/biblia/leer?libro=${seleccionado.codigo}&cap=${cap}`)} className={`aspect-square rounded-lg border text-sm font-semibold hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 ${cap === capituloConservado ? "border-[#F2D27A] bg-[#D4AF37] text-[#050505]" : "border-[#D4AF37]/30 bg-[#15130e] text-[#F2D27A]"}`}>{cap}</button>)}</div></div></div></div>}
    <p className="mt-4 text-center text-[11px] text-[#8f897d]">Canon católico · 73 libros</p>
  </BibliaLayout>;
}
