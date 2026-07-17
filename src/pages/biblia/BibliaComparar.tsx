import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronRight, Columns3, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { BibliaLayout } from "./BibliaLayout";
import {
  getBibliaCapitulo,
  getBibliaCatalogo,
  getBibliaVersiones,
  type BibliaLibro,
  type BibliaVersion,
  type BibliaVersiculo,
} from "@/services/bibliaService";

interface Columna {
  version: BibliaVersion;
  versiculos: BibliaVersiculo[];
}

export default function BibliaComparar() {
  const [versiones, setVersiones] = useState<BibliaVersion[]>([]);
  const [versionA, setVersionA] = useState("");
  const [versionB, setVersionB] = useState("");
  const [libros, setLibros] = useState<BibliaLibro[]>([]);
  const [libro, setLibro] = useState("GEN");
  const [capitulo, setCapitulo] = useState(1);
  const [columnas, setColumnas] = useState<[Columna, Columna] | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getBibliaVersiones()
      .then((data) => {
        if (!active) return;
        setVersiones(data);
        setVersionA(data[0]?.codigo ?? "");
        setVersionB(data[1]?.codigo ?? data[0]?.codigo ?? "");
        if (data.length < 2) setError("Se necesitan al menos dos versiones bíblicas activas para comparar.");
      })
      .catch((cause: Error) => active && setError(cause.message))
      .finally(() => active && setCargando(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!versionA || !versionB) return;
    let active = true;
    setCargando(true);
    setError("");
    Promise.all([getBibliaCatalogo(versionA), getBibliaCatalogo(versionB)])
      .then(([catalogoA, catalogoB]) => {
        if (!active) return;
        const disponiblesB = new Map(catalogoB.libros.map((item) => [item.codigo, item]));
        const comunes = catalogoA.libros
          .filter((item) => disponiblesB.has(item.codigo))
          .map((item) => ({
            ...item,
            capitulos: Math.min(item.capitulos, disponiblesB.get(item.codigo)!.capitulos),
          }));
        setLibros(comunes);
        setLibro((actual) => {
          if (comunes.some((item) => item.codigo === actual)) return actual;
          setCapitulo(1);
          return comunes[0]?.codigo ?? "";
        });
      })
      .catch((cause: Error) => active && setError(cause.message))
      .finally(() => active && setCargando(false));
    return () => { active = false; };
  }, [versionA, versionB]);

  useEffect(() => {
    if (!versionA || !versionB || !libro) return;
    let active = true;
    setCargando(true);
    setError("");
    Promise.all([
      getBibliaCapitulo(libro, capitulo, versionA),
      getBibliaCapitulo(libro, capitulo, versionB),
    ])
      .then(([a, b]) => {
        if (!active) return;
        setColumnas([
          { version: a.version, versiculos: a.versiculos },
          { version: b.version, versiculos: b.versiculos },
        ]);
      })
      .catch((cause: Error) => {
        if (!active) return;
        setColumnas(null);
        setError(cause.message);
      })
      .finally(() => active && setCargando(false));
    return () => { active = false; };
  }, [versionA, versionB, libro, capitulo]);

  const libroActual = libros.find((item) => item.codigo === libro);
  const numeros = useMemo(() => {
    if (!columnas) return [];
    return Array.from(new Set(columnas.flatMap((columna) => columna.versiculos.map((item) => item.versiculo)))).sort((a, b) => a - b);
  }, [columnas]);

  const cambiarLibro = (codigo: string) => {
    setLibro(codigo);
    setCapitulo(1);
  };

  return (
    <BibliaLayout title="Comparar versiones">
      <section className="mb-4 rounded-[1.5rem] border border-[#D4AF37]/25 bg-[#0B0B0B] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4AF37]/12 text-[#D4AF37]">
            <Columns3 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl text-[#F8F5EA]">Comparar traducciones</h1>
            <p className="text-xs text-[#C9C3B3]">Selecciona dos versiones, un libro y un capítulo.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Campo label="Primera versión">
            <select value={versionA} onChange={(event) => setVersionA(event.target.value)}>
              {versiones.map((item) => <option key={item.codigo} value={item.codigo} disabled={item.codigo === versionB}>{item.abreviatura}</option>)}
            </select>
          </Campo>
          <Campo label="Segunda versión">
            <select value={versionB} onChange={(event) => setVersionB(event.target.value)}>
              {versiones.map((item) => <option key={item.codigo} value={item.codigo} disabled={item.codigo === versionA}>{item.abreviatura}</option>)}
            </select>
          </Campo>
          <Campo label="Libro">
            <select value={libro} onChange={(event) => cambiarLibro(event.target.value)}>
              {libros.map((item) => <option key={item.codigo} value={item.codigo}>{item.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Capítulo">
            <select value={capitulo} onChange={(event) => setCapitulo(Number(event.target.value))}>
              {Array.from({ length: libroActual?.capitulos ?? 0 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Campo>
        </div>
      </section>

      {error && <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-200">{error}</div>}
      {cargando && <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" /></div>}

      {!cargando && columnas && (
        <Link
          to={`/biblia/estudio?libro=${encodeURIComponent(libro)}&cap=${capitulo}`}
          className="group mb-4 flex items-center gap-3 rounded-[1.15rem] border border-[#D4AF37]/55 bg-[linear-gradient(110deg,rgba(212,175,55,0.14),rgba(11,11,11,0.96)_48%,rgba(212,175,55,0.08))] p-4 shadow-[0_16px_42px_rgba(0,0,0,0.35)] transition hover:border-[#F2D27A]/85"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 text-[#F2D27A]">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm text-[#F2D27A]">Profundizar la comparación</strong>
            <span className="mt-0.5 block text-xs leading-relaxed text-[#C9C3B3]">
              Estudio comparado, estructura, teología y Lectio Divina.
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[#D4AF37] transition group-hover:translate-x-0.5" />
        </Link>
      )}

      {!cargando && columnas && (
        <section className="overflow-hidden rounded-[1.35rem] border border-[#D4AF37]/20 bg-[#0B0B0B]">
          <div className="grid grid-cols-2 border-b border-[#D4AF37]/20 bg-[#111111]">
            {columnas.map((columna) => (
              <div key={columna.version.codigo} className="min-w-0 border-r border-[#D4AF37]/15 p-3 last:border-r-0">
                <div className="truncate text-xs font-bold uppercase tracking-[0.12em] text-[#D4AF37]">{columna.version.abreviatura}</div>
                <div className="mt-1 truncate text-[11px] text-[#C9C3B3]">{columna.version.nombre}</div>
              </div>
            ))}
          </div>
          {numeros.map((numero) => (
            <div key={numero} className="grid grid-cols-2 border-b border-[#D4AF37]/10 last:border-b-0">
              {columnas.map((columna) => {
                const versiculo = columna.versiculos.find((item) => item.versiculo === numero);
                return (
                  <article key={`${columna.version.codigo}-${numero}`} className="border-r border-[#D4AF37]/10 p-3 last:border-r-0 md:p-4">
                    <sup className="mr-1.5 font-bold text-[#D4AF37]">{numero}</sup>
                    <span className="text-[0.82rem] leading-relaxed text-[#F8F5EA]/90 md:text-[0.95rem]">{versiculo?.texto || "—"}</span>
                  </article>
                );
              })}
            </div>
          ))}
        </section>
      )}
    </BibliaLayout>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.14em] text-[#D4AF37]">{label}</span>
      <span className="block [&_select]:h-10 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[#D4AF37]/25 [&_select]:bg-[#111111] [&_select]:px-2 [&_select]:text-xs [&_select]:text-[#F8F5EA] [&_select]:outline-none">
        {children}
      </span>
    </label>
  );
}
