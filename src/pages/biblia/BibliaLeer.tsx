import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  AlignJustify,
  AlignLeft,
  BookMarked,
  BookOpen,
  Bookmark,
  Check,
  Columns3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  Library,
  MoreVertical,
  Share2,
  Sparkles,
  StickyNote,
  X,
} from "lucide-react";
import { BibliaLayout } from "./BibliaLayout";
import {
  getMeta,
  deleteMeta,
  setMeta,
  toggleFavorito,
  esFavorito,
  crearNotaPersonal,
  eliminarResaltado,
  guardarResaltado,
  listarResaltadosCapitulo,
  registrarHistorial,
  toggleMarcador,
  type ColorResaltado,
} from "@/features/biblia/db";
import {
  getBibliaCapitulo,
  getBibliaCatalogo,
  getBibliaNotas,
  type BibliaLibro,
  type BibliaNota,
  type BibliaVersion,
  type BibliaVersiculo,
  type TestamentoBiblico,
} from "@/services/bibliaService";
import { toast } from "@/components/ui/sonner";

type Tema = "oscuro" | "claro" | "sepia";
type FuenteLectura = "literata" | "georgia" | "garamond" | "atkinson" | "sans";
type FuenteLecturaGuardada = FuenteLectura | "bookerly";
type PestanaConfiguracion = "temas" | "fuente" | "formato" | "mas";
type AlineacionLectura = "izquierda" | "justificada";
type MargenLectura = "estrecho" | "normal" | "amplio";
type SelectorLectura = "libro" | "capitulo" | "versiculo" | null;

const etiquetasTema: Record<Tema, string> = {
  claro: "Claro",
  oscuro: "Oscuro",
  sepia: "Tinta",
};

const fuentesLectura: Array<{ id: FuenteLectura; nombre: string; descripcion: string; familia: string; recomendada?: boolean }> = [
  { id: "literata", nombre: "Literata", descripcion: "Diseñada para lectura prolongada en pantalla", familia: "'Literata', Georgia, serif", recomendada: true },
  { id: "georgia", nombre: "Georgia", descripcion: "Clásica y clara incluso en tamaños pequeños", familia: "Georgia, 'Times New Roman', serif" },
  { id: "garamond", nombre: "Garamond", descripcion: "Elegancia editorial para textos extensos", familia: "'EB Garamond', Garamond, serif" },
  { id: "atkinson", nombre: "Atkinson", descripcion: "Formas diferenciadas para máxima accesibilidad", familia: "'Atkinson Hyperlegible', Arial, sans-serif" },
  { id: "sans", nombre: "Moderna", descripcion: "Trazos limpios y presentación contemporánea", familia: "'Montserrat', system-ui, sans-serif" },
];

const coloresResaltado: Array<{ color: ColorResaltado; clase: string; muestra: string }> = [
  { color: "dorado", clase: "bg-[#D4AF37]/20", muestra: "bg-[#D4AF37]" },
  { color: "verde", clase: "bg-emerald-500/20", muestra: "bg-emerald-500" },
  { color: "azul", clase: "bg-sky-500/20", muestra: "bg-sky-500" },
  { color: "rosa", clase: "bg-rose-500/20", muestra: "bg-rose-500" },
  { color: "morado", clase: "bg-violet-500/20", muestra: "bg-violet-500" },
];

export default function BibliaLeer() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tieneSeleccion = !!params.get("libro") && !!params.get("cap");
  const libroCodigo = (params.get("libro") ?? "").toUpperCase();
  const capitulo = Number(params.get("cap") ?? "0");
  const versiculoSeleccionado = Number(params.get("versiculo") ?? "0");

  const [version, setVersion] = useState<BibliaVersion | null>(null);
  const [libros, setLibros] = useState<BibliaLibro[]>([]);
  const [caps, setCaps] = useState<number[]>([]);
  const [versiculos, setVersiculos] = useState<BibliaVersiculo[]>([]);
  const [tam, setTam] = useState<number>(17);
  const [tema, setTema] = useState<Tema>("oscuro");
  const [fuente, setFuente] = useState<FuenteLectura>("literata");
  const [pesoFuente, setPesoFuente] = useState(400);
  const [interlineado, setInterlineado] = useState(1.9);
  const [alineacion, setAlineacion] = useState<AlineacionLectura>("izquierda");
  const [margenLectura, setMargenLectura] = useState<MargenLectura>("normal");
  const [versiculoActivo, setVersiculoActivo] = useState<number | null>(null);
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);
  const [notasPorVersiculo, setNotasPorVersiculo] = useState<Record<number, BibliaNota[]>>({});
  const [favs, setFavs] = useState<Record<number, boolean>>({});
  const [resaltados, setResaltados] = useState<Record<number, ColorResaltado>>({});
  const [versiculosSeleccionados, setVersiculosSeleccionados] = useState<number[]>([]);
  const [textoSeleccionado, setTextoSeleccionado] = useState("");
  const [hayContenido, setHayContenido] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [mostrarTipografia, setMostrarTipografia] = useState(false);
  const [mostrarSelectorFuentes, setMostrarSelectorFuentes] = useState(false);
  const [pestanaConfiguracion, setPestanaConfiguracion] = useState<PestanaConfiguracion>("fuente");
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [selectorLectura, setSelectorLectura] = useState<SelectorLectura>(null);
  const [testamentoSelector, setTestamentoSelector] = useState<TestamentoBiblico>("AT");
  const inicioLecturaRef = useRef<HTMLDivElement>(null);
  const botonTipografiaRef = useRef<HTMLButtonElement>(null);
  const panelTipografiaRef = useRef<HTMLDivElement>(null);
  const botonMenuRef = useRef<HTMLButtonElement>(null);
  const panelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const s = await getMeta<{ tam: number; tema: Tema; fuente?: FuenteLecturaGuardada; pesoFuente?: number; interlineado?: number; alineacion?: AlineacionLectura; margenLectura?: MargenLectura }>("prefsLectura");
      if (s) {
        setTam(s.tam ?? 17);
        setTema(s.tema ?? "oscuro");
        setFuente(!s.fuente || s.fuente === "bookerly" ? "literata" : s.fuente);
        setPesoFuente(s.pesoFuente ?? 400);
        setInterlineado(s.interlineado ?? 1.9);
        setAlineacion(s.alineacion ?? "izquierda");
        setMargenLectura(s.margenLectura ?? "normal");
      }
    })();
  }, []);

  useEffect(() => {
    if (!mostrarTipografia) return;

    const cerrarAlPresionarFuera = (event: PointerEvent) => {
      const objetivo = event.target as Node;
      if (panelTipografiaRef.current?.contains(objetivo)) return;
      if (botonTipografiaRef.current?.contains(objetivo)) return;
      setMostrarTipografia(false);
      setMostrarSelectorFuentes(false);
    };

    document.addEventListener("pointerdown", cerrarAlPresionarFuera);
    return () => document.removeEventListener("pointerdown", cerrarAlPresionarFuera);
  }, [mostrarTipografia]);

  useEffect(() => {
    if (!mostrarMenu) return;

    const cerrarMenuAlPresionarFuera = (event: PointerEvent) => {
      const objetivo = event.target as Node;
      if (panelMenuRef.current?.contains(objetivo)) return;
      if (botonMenuRef.current?.contains(objetivo)) return;
      setMostrarMenu(false);
    };

    document.addEventListener("pointerdown", cerrarMenuAlPresionarFuera);
    return () => document.removeEventListener("pointerdown", cerrarMenuAlPresionarFuera);
  }, [mostrarMenu]);

  useEffect(() => {
    let active = true;
    getBibliaCatalogo()
      .then((data) => {
        if (!active) return;
        setVersion(data.version);
        setLibros(data.libros);
      })
      .catch((cause: Error) => active && setError(cause.message));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setHayContenido(null);
    setVersiculoActivo(null);
    setVersiculosSeleccionados([]);
    setTextoSeleccionado("");
    setOpenNoteId(null);
    setNotasPorVersiculo({});
    setError("");
    getBibliaCapitulo(libroCodigo, capitulo)
      .then(async (data) => {
        if (!active) return;
        setVersion(data.version);
        setVersiculos(data.versiculos);
        setNotasPorVersiculo(Object.fromEntries(
          data.versiculos
            .filter((verse) => verse.notas.length > 0)
            .map((verse) => [verse.versiculo, verse.notas]),
        ));
        setCaps(Array.from({ length: data.libro.capitulos }, (_, index) => index + 1));
        setHayContenido(data.versiculos.length > 0);
        const resaltadosGuardados = await listarResaltadosCapitulo(
          data.version.codigo,
          data.libro.codigo,
          capitulo,
        );
        if (active) {
          setResaltados(Object.fromEntries(resaltadosGuardados.map((item) => [item.versiculo, item.color])));
        }
        const favMap: Record<number, boolean> = {};
        for (const verse of data.versiculos) {
          favMap[verse.versiculo] = await esFavorito(
            data.libro.id,
            capitulo,
            verse.versiculo,
          );
        }
        if (active) setFavs(favMap);
        await setMeta("ultimaLectura", {
          libroId: data.libro.id,
          libroCodigo: data.libro.codigo,
          libroNombre: data.libro.nombre,
          capitulo,
          versiculo: data.versiculos[0]?.versiculo || 1,
          texto: data.versiculos[0]?.texto || "",
        });
        await registrarHistorial({
          version: data.version.codigo,
          libroId: data.libro.id,
          libroCodigo: data.libro.codigo,
          libroNombre: data.libro.nombre,
          capitulo,
          versiculo: data.versiculos[0]?.versiculo || 1,
          texto: data.versiculos[0]?.texto || "",
        });
      })
      .catch((cause: Error) => {
        if (!active) return;
        setVersiculos([]);
        setHayContenido(false);
        setError(cause.message);
      });
    return () => {
      active = false;
    };
  }, [libroCodigo, capitulo]);

  useEffect(() => {
    if (!versiculoSeleccionado || hayContenido !== true) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`versiculo-${versiculoSeleccionado}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [versiculoSeleccionado, hayContenido]);

  const libroActual = libros.find((book) => book.codigo === libroCodigo);
  const librosSelector = libros.filter((book) => book.testamento === testamentoSelector);

  useEffect(() => {
    if (!libroActual || !versiculoSeleccionado || versiculos.length === 0) return;
    const verse = versiculos.find((item) => item.versiculo === versiculoSeleccionado);
    if (!verse) return;

    void setMeta("ultimaLectura", {
      libroId: libroActual.id,
      libroCodigo: libroActual.codigo,
      libroNombre: libroActual.nombre,
      capitulo,
      versiculo: verse.versiculo,
      texto: verse.texto,
    });
  }, [libroActual, capitulo, versiculoSeleccionado, versiculos]);

  const savePrefs = async (
    nuevoTam: number,
    nuevoTema: Tema,
    nuevaFuente: FuenteLectura = fuente,
    nuevoPeso: number = pesoFuente,
    nuevoInterlineado: number = interlineado,
    nuevaAlineacion: AlineacionLectura = alineacion,
    nuevoMargen: MargenLectura = margenLectura,
  ) => {
    setTam(nuevoTam);
    setTema(nuevoTema);
    setFuente(nuevaFuente);
    setPesoFuente(nuevoPeso);
    setInterlineado(nuevoInterlineado);
    setAlineacion(nuevaAlineacion);
    setMargenLectura(nuevoMargen);
    await setMeta("prefsLectura", { tam: nuevoTam, tema: nuevoTema, fuente: nuevaFuente, pesoFuente: nuevoPeso, interlineado: nuevoInterlineado, alineacion: nuevaAlineacion, margenLectura: nuevoMargen });
  };

  const restablecerPreferencias = async () => {
    setTam(17);
    setTema("oscuro");
    setFuente("literata");
    setPesoFuente(400);
    setInterlineado(1.9);
    setAlineacion("izquierda");
    setMargenLectura("normal");
    setMostrarSelectorFuentes(false);
    await deleteMeta("prefsLectura");
    toast.success("Preferencias de lectura restablecidas");
  };

  const bgTema =
    tema === "claro"
      ? "border-[#D4AF37]/30 bg-[#F8F5EA] text-[#14120d]"
      : tema === "sepia"
        ? "biblia-eink-paper border-[#5f5b4d]/25 text-[#20211d] shadow-none"
        : "border-[#D4AF37]/20 bg-[#111111] text-[#F8F5EA]";
  const esTinta = tema === "sepia";
  const colorTitulo = tema === "oscuro" ? "text-[#F8F0D8]" : "text-[#24231f]";
  const colorAcento = esTinta ? "text-[#655a35]" : "text-[#D4AF37]";
  const estiloNota = esTinta
    ? "border-[#4b4c45]/35 border-l-[#3f403a] bg-[#77786d]/[0.08] text-[#242520] shadow-none"
    : "border-[#D4AF37]/30 border-l-[#D4AF37] bg-[#D4AF37]/[0.06] shadow-[0_0_24px_rgba(212,175,55,0.07)]";
  const colorNota = esTinta ? "text-[#30312c]" : "text-[#D4AF37]";
  const fuenteSeleccionada = fuentesLectura.find((item) => item.id === fuente) ?? fuentesLectura[0];
  const familiaLectura = fuenteSeleccionada.familia;
  const anchoLectura = margenLectura === "estrecho"
    ? { width: "100%", maxWidth: "56rem" }
    : margenLectura === "amplio"
      ? { width: "calc(100% - 1.5rem)", maxWidth: "40rem" }
      : { width: "calc(100% - 0.5rem)", maxWidth: "48rem" };
  const estiloBotonCapitulo =
    tema === "sepia"
      ? "border-[#5f5b4d]/50 bg-[#d8d0ba] text-[#34342e] hover:bg-[#cec5ad] focus-visible:ring-[#5f5b4d]"
      : tema === "claro"
        ? "border-[#8f741f]/45 bg-white/55 text-[#4c4018] hover:bg-[#D4AF37]/15 focus-visible:ring-[#8f741f]"
        : "border-[#D4AF37]/35 bg-white/[0.03] text-[#F2D27A] hover:bg-[#D4AF37]/10 focus-visible:ring-[#D4AF37]";
  const seleccionOrdenada = [...versiculosSeleccionados].sort((a, b) => a - b);
  const referenciaSeleccion = seleccionOrdenada.length === 0
    ? ""
    : seleccionOrdenada.length === 1
      ? `${libroActual?.nombre} ${capitulo},${seleccionOrdenada[0]}`
      : `${libroActual?.nombre} ${capitulo},${seleccionOrdenada[0]}–${seleccionOrdenada.at(-1)}`;

  const textoDeSeleccion = () => textoSeleccionado || [...versiculosSeleccionados]
    .sort((a, b) => a - b)
    .map((numero) => {
      const verse = versiculos.find((item) => item.versiculo === numero);
      return `${libroActual?.nombre} ${capitulo},${numero}: ${verse?.texto ?? ""}`;
    })
    .join("\n\n");

  const onCopiar = async () => {
    const txt = textoDeSeleccion();
    if (!txt) return;
    await navigator.clipboard.writeText(txt);
    toast.success("Selección copiada");
  };

  const onCompartir = async () => {
    const txt = textoDeSeleccion();
    if (!txt) return;
    if (navigator.share) {
      try {
        await navigator.share({ text: txt });
      } catch {
        /* cancel */
      }
    } else {
      await navigator.clipboard.writeText(txt);
      toast.success("Copiado (compartir no disponible)");
    }
  };

  const onResaltarSeleccion = async (color: ColorResaltado) => {
    const versionCodigo = version?.codigo || "SPAPLATENSE";
    await Promise.all(versiculosSeleccionados.map((numero) =>
      guardarResaltado(versionCodigo, libroCodigo, capitulo, numero, color),
    ));
    setResaltados((actual) => ({ ...actual, ...Object.fromEntries(versiculosSeleccionados.map((numero) => [numero, color])) }));
    setVersiculosSeleccionados([]);
    setTextoSeleccionado("");
    setVersiculoActivo(null);
    toast.success(`${versiculosSeleccionados.length} versículo${versiculosSeleccionados.length === 1 ? "" : "s"} resaltado${versiculosSeleccionados.length === 1 ? "" : "s"}`);
  };

  const onFavoritosSeleccion = async () => {
    if (!libroActual) return;
    const debenGuardarse = versiculosSeleccionados.some((numero) => !favs[numero]);
    for (const numero of versiculosSeleccionados) {
      if (Boolean(favs[numero]) === debenGuardarse) continue;
      const verse = versiculos.find((item) => item.versiculo === numero);
      await toggleFavorito(libroActual.id, capitulo, numero, {
        libroCodigo: libroActual.codigo, libroNombre: libroActual.nombre,
        texto: verse?.texto, version: version?.codigo || "SPAPLATENSE",
      });
    }
    setFavs((actual) => ({ ...actual, ...Object.fromEntries(versiculosSeleccionados.map((numero) => [numero, debenGuardarse])) }));
    setVersiculosSeleccionados([]);
    setTextoSeleccionado("");
    setVersiculoActivo(null);
  };

  const onMarcadoresSeleccion = async () => {
    if (!libroActual) return;
    for (const numero of versiculosSeleccionados) {
      const verse = versiculos.find((item) => item.versiculo === numero);
      await toggleMarcador({ version: version?.codigo || "SPAPLATENSE", libroId: libroActual.id, libroCodigo, libroNombre: libroActual.nombre, capitulo, versiculo: numero, texto: verse?.texto });
    }
    setVersiculosSeleccionados([]);
    setTextoSeleccionado("");
    setVersiculoActivo(null);
    toast.success("Marcadores actualizados");
  };

  const onNotaSeleccion = async () => {
    if (!libroActual || versiculosSeleccionados.length === 0) return;
    const texto = window.prompt(`Nota personal para ${versiculosSeleccionados.length} versículo${versiculosSeleccionados.length === 1 ? "" : "s"}`);
    if (!texto?.trim()) return;
    const ordenados = [...versiculosSeleccionados].sort((a, b) => a - b);
    await crearNotaPersonal({ libroId: libroActual.id, libroCodigo, libroNombre: libroActual.nombre, capitulo, versiculo: ordenados[0], versiculos: ordenados, version: version?.codigo || "SPAPLATENSE", texto: texto.trim() });
    setVersiculosSeleccionados([]);
    setTextoSeleccionado("");
    setVersiculoActivo(null);
    toast.success("Nota personal guardada");
  };

  const onQuitarResaltadosSeleccion = async () => {
    const versionCodigo = version?.codigo || "SPAPLATENSE";
    await Promise.all(versiculosSeleccionados.map((numero) =>
      eliminarResaltado(versionCodigo, libroCodigo, capitulo, numero),
    ));
    setResaltados((actual) => {
      const siguiente = { ...actual };
      versiculosSeleccionados.forEach((numero) => delete siguiente[numero]);
      return siguiente;
    });
    setVersiculosSeleccionados([]);
    setTextoSeleccionado("");
    setVersiculoActivo(null);
    toast.success("Resaltado eliminado de la selección");
  };

  const alternarNotaEstudio = async (v: BibliaVersiculo) => {
    if (openNoteId === v.id) {
      setOpenNoteId(null);
      return;
    }

    setOpenNoteId(v.id);
    if (notasPorVersiculo[v.versiculo]) return;

    try {
      const notas = await getBibliaNotas(libroCodigo, capitulo, v.versiculo);
      setNotasPorVersiculo((actual) => ({ ...actual, [v.versiculo]: notas }));
    } catch (cause) {
      setOpenNoteId(null);
      toast.error(cause instanceof Error ? cause.message : "No fue posible cargar la nota");
    }
  };

  const capturarSeleccion = () => {
    const seleccion = window.getSelection();
    const texto = seleccion?.toString().trim() ?? "";
    if (!seleccion || seleccion.rangeCount === 0 || seleccion.isCollapsed || !texto) return;

    const rango = seleccion.getRangeAt(0);
    const numeros = versiculos
      .filter((verse) => {
        const elemento = document.getElementById(`versiculo-${verse.versiculo}`);
        if (!elemento) return false;
        try {
          return rango.intersectsNode(elemento);
        } catch {
          return false;
        }
      })
      .map((verse) => verse.versiculo);

    if (numeros.length === 0) return;
    setTextoSeleccionado(texto);
    setVersiculosSeleccionados(numeros);
    setVersiculoActivo(numeros[0]);
  };

  const limpiarSeleccion = () => {
    setTextoSeleccionado("");
    setVersiculosSeleccionados([]);
    setVersiculoActivo(null);
    window.getSelection()?.removeAllRanges();
  };

  const irAlCapitulo = (numero: number) => {
    if (numero < 1 || numero > caps.length) return;
    setOpenNoteId(null);
    setVersiculosSeleccionados([]);
    setTextoSeleccionado("");
    setVersiculoActivo(null);
    setMostrarMenu(false);
    setMostrarTipografia(false);
    setParams({ libro: libroCodigo, cap: String(numero) });
    window.setTimeout(() => inicioLecturaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  if (!tieneSeleccion || !Number.isInteger(capitulo) || capitulo < 1) {
    return <Navigate to="/biblia/libros" replace />;
  }

  if (hayContenido === false && error) {
    return (
      <BibliaLayout title="Leer Biblia" back={`/biblia/libros?libro=${libroCodigo}&cap=${capitulo}`} hideBottomNav>
        <div className="rounded-[2rem] border border-[#D4AF37]/25 bg-[#111111] p-7 text-center shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          <BookMarked className="mx-auto mb-4 h-9 w-9 text-[#D4AF37]" />
          <div className="font-display mb-2 text-2xl text-[#F8F5EA]">
            No se pudo cargar la Biblia
          </div>
          <p className="mb-5 text-sm leading-relaxed text-[#C9C3B3]">
            {error}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] px-5 py-2.5 font-semibold text-[#070707] shadow-[0_12px_28px_rgba(212,175,55,0.25)]"
          >
            Intentar nuevamente
          </button>
        </div>
      </BibliaLayout>
    );
  }

  return (
    <BibliaLayout hideHeader hideBottomNav>
      <div ref={inicioLecturaRef} className="scroll-mt-24" />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#D4AF37]/25 bg-[#050505]/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[430px] items-center gap-2 px-3 md:max-w-4xl">
          <button type="button" onClick={() => navigate(`/biblia/libros?libro=${libroCodigo}&cap=${capitulo}`)} className="lvj-sacred-icon-button h-11 w-11 shrink-0" aria-label="Volver a elegir libro y capítulo"><ArrowLeft className="h-5 w-5" /></button>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] to-[#B88914]"><BookOpen className="h-5 w-5 text-[#050505]" /></span>
          <div className="min-w-0 flex-1"><div className="truncate text-[9px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">La Voz de Jesús</div><div className="font-display text-lg leading-tight text-[#F8F5EA]">Biblia</div></div>
          <button ref={botonTipografiaRef} type="button" onClick={() => { setMostrarTipografia((visible) => { if (visible) setMostrarSelectorFuentes(false); return !visible; }); setMostrarMenu(false); }} className="flex h-11 min-w-11 items-center justify-center font-display text-2xl text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]" aria-label="Opciones de lectura" aria-expanded={mostrarTipografia}>Aa</button>
          <button ref={botonMenuRef} type="button" onClick={() => { setMostrarMenu((v) => !v); setMostrarTipografia(false); setMostrarSelectorFuentes(false); }} className="lvj-sacred-icon-button h-11 w-11" aria-label="Más opciones" aria-expanded={mostrarMenu}><MoreVertical className="h-5 w-5" /></button>
        </div>
        <div className="mx-auto flex h-12 max-w-[430px] items-center justify-center border-t border-[#D4AF37]/10 px-3 md:max-w-4xl">
          <div className="flex h-9 max-w-full items-stretch overflow-hidden rounded-lg border border-[#D4AF37]/35 bg-[#111111] text-sm font-semibold text-[#F8F5EA] shadow-[0_6px_20px_rgba(0,0,0,0.3)]">
            <button type="button" onClick={() => { setTestamentoSelector(libroActual?.testamento || "AT"); setSelectorLectura("libro"); }} className="flex min-w-0 max-w-[9rem] items-center gap-1 border-r border-[#D4AF37]/20 px-3 focus:bg-[#D4AF37]/10" aria-label="Abrir cuadrícula de libros"><span className="truncate">{libroActual?.abreviatura || libroCodigo}</span><ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" /></button>
            <button type="button" onClick={() => setSelectorLectura("capitulo")} className="flex items-center gap-1 border-r border-[#D4AF37]/20 px-3 focus:bg-[#D4AF37]/10" aria-label="Abrir cuadrícula de capítulos"><span>{capitulo}</span><ChevronDown className="h-3.5 w-3.5 text-[#D4AF37]" /></button>
            <button type="button" onClick={() => setSelectorLectura("versiculo")} className="flex items-center gap-1 px-3 focus:bg-[#D4AF37]/10" aria-label="Abrir cuadrícula de versículos"><span>{versiculoSeleccionado || "—"}</span><ChevronDown className="h-3.5 w-3.5 text-[#D4AF37]" /></button>
          </div>
        </div>
        {mostrarTipografia && <div ref={panelTipografiaRef} className="mx-auto max-h-[calc(100dvh-8rem)] max-w-[430px] overflow-y-auto border-t border-[#D4AF37]/20 bg-[#0B0B0B] text-[#F8F5EA] shadow-[0_18px_45px_rgba(0,0,0,0.65)] md:max-w-4xl">
          <div className="grid grid-cols-4 border-b border-[#D4AF37]/20 px-2" role="tablist" aria-label="Configuración de lectura">
            {([['temas', 'Temas'], ['fuente', 'Fuente'], ['formato', 'Formato'], ['mas', 'Más']] as Array<[PestanaConfiguracion, string]>).map(([id, etiqueta]) => <button key={id} type="button" role="tab" aria-selected={pestanaConfiguracion === id} onClick={() => { setPestanaConfiguracion(id); setMostrarSelectorFuentes(false); }} className={`relative min-h-11 px-1 text-[11px] font-semibold transition ${pestanaConfiguracion === id ? "text-[#F2D27A] after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-[#D4AF37]" : "text-[#8F897C]"}`}>{etiqueta}</button>)}
          </div>

          <div className="p-3">
            {pestanaConfiguracion === 'temas' && <div className="grid grid-cols-3 gap-2">{(["claro", "oscuro", "sepia"] as Tema[]).map((t) => <button type="button" key={t} onClick={() => savePrefs(tam, t)} className={`min-h-20 rounded-xl border p-2 text-xs ${tema === t ? "border-[#D4AF37] bg-[#D4AF37]/12 text-[#F2D27A]" : "border-[#D4AF37]/20 text-[#C9C3B3]"}`}><span className={`mx-auto mb-2 block h-8 w-8 rounded-full border ${t === 'claro' ? 'border-stone-300 bg-[#F8F5EA]' : t === 'sepia' ? 'border-[#756e5d] bg-[#e7e1cf]' : 'border-stone-700 bg-[#111]'}`} />{etiquetasTema[t]}</button>)}</div>}

            {pestanaConfiguracion === 'fuente' && <div>
              <button type="button" onClick={() => setMostrarSelectorFuentes((visible) => !visible)} className="flex w-full items-center border-y border-[#D4AF37]/25 px-2 py-3 text-left" aria-expanded={mostrarSelectorFuentes} aria-controls="selector-fuentes-lectura">
                <span className="w-32 shrink-0 text-xs text-[#C9C3B3]">Familia de fuentes</span><span className="flex min-w-0 flex-1 items-center justify-end gap-2"><span className="text-3xl text-[#F8F5EA]" style={{ fontFamily: fuenteSeleccionada.familia }}>Aa</span><strong className="truncate text-xs text-[#C9C3B3]">— {fuenteSeleccionada.nombre}</strong><ChevronRight className="h-4 w-4 text-[#D4AF37]" /></span>
              </button>
              {mostrarSelectorFuentes && <div id="selector-fuentes-lectura" className="mt-2 max-h-[42vh] space-y-1 overflow-y-auto rounded-xl border border-[#D4AF37]/20 bg-[#080808] p-2" aria-label="Elegir tipo de letra">{fuentesLectura.map((opcion) => <button type="button" key={opcion.id} onClick={() => { void savePrefs(tam, tema, opcion.id); setMostrarSelectorFuentes(false); }} className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left ${fuente === opcion.id ? "border-[#D4AF37] bg-[#D4AF37]/12" : "border-transparent hover:bg-white/[0.04]"}`}><span className="w-10 text-center text-2xl text-[#F2D27A]" style={{ fontFamily: opcion.familia }}>Aa</span><span className="min-w-0 flex-1"><strong className="text-sm" style={{ fontFamily: opcion.familia }}>{opcion.nombre}</strong><span className="block truncate text-[10px] text-[#8F897C]">{opcion.descripcion}</span></span>{opcion.recomendada && <span className="hidden rounded-full bg-[#D4AF37]/15 px-2 py-1 text-[8px] text-[#D4AF37] min-[380px]:block">Recomendada</span>}<Check className={`h-4 w-4 ${fuente === opcion.id ? "text-[#D4AF37]" : "text-transparent"}`} /></button>)}</div>}
            </div>}

            {pestanaConfiguracion === 'formato' && <div className="divide-y divide-[#D4AF37]/20 border-y border-[#D4AF37]/25">
              <div className="flex min-h-16 items-center gap-3 px-2"><span className="w-20 text-xs text-[#C9C3B3]">Negrita</span><button type="button" aria-label="Reducir grosor" onClick={() => savePrefs(tam, tema, fuente, Math.max(400, pesoFuente - 100))} className="h-11 w-9 text-xl">−</button><div className="flex flex-1 gap-1">{[400, 500, 600].map((peso) => <span key={peso} className={`h-1 flex-1 ${peso <= pesoFuente ? "bg-[#D4AF37]" : "border border-[#6d675a]"}`} />)}</div><button type="button" aria-label="Aumentar grosor" onClick={() => savePrefs(tam, tema, fuente, Math.min(600, pesoFuente + 100))} className="h-11 w-9 text-xl">+</button></div>
              <div className="flex min-h-16 items-center gap-3 px-2"><span className="w-20 text-xs text-[#C9C3B3]">Tamaño</span><button type="button" aria-label="Reducir tamaño" onClick={() => savePrefs(Math.max(13, tam - 1), tema)} className="h-11 w-9 text-xl">−</button><div className="flex flex-1 items-center gap-0.5">{Array.from({ length: 14 }, (_, index) => index + 13).map((valor) => <button type="button" key={valor} aria-label={`Tamaño ${valor}`} onClick={() => savePrefs(valor, tema)} className={`h-2 flex-1 ${valor <= tam ? "bg-[#D4AF37]" : "border border-[#6d675a]"}`} />)}</div><span className="w-5 text-center text-[10px] text-[#D4AF37]">{tam}</span><button type="button" aria-label="Aumentar tamaño" onClick={() => savePrefs(Math.min(26, tam + 1), tema)} className="h-11 w-9 text-xl">+</button></div>
              <div className="flex min-h-20 items-center gap-3 px-2"><span className="w-20 text-xs text-[#C9C3B3]">Alineación</span><div className="grid flex-1 grid-cols-2 gap-2">{([['izquierda', 'Izquierda', AlignLeft], ['justificada', 'Justificada', AlignJustify]] as const).map(([valor, etiqueta, Icono]) => <button type="button" key={valor} onClick={() => savePrefs(tam, tema, fuente, pesoFuente, interlineado, valor, margenLectura)} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[10px] ${alineacion === valor ? "border-[#D4AF37] bg-[#D4AF37]/12 text-[#F2D27A]" : "border-[#D4AF37]/20 text-[#8F897C]"}`}><Icono className="h-5 w-5" />{etiqueta}</button>)}</div></div>
              <div className="flex min-h-20 items-center gap-3 px-2"><span className="w-20 text-xs text-[#C9C3B3]">Márgenes</span><div className="grid flex-1 grid-cols-3 gap-2">{([['estrecho', 'Estrecho', 'px-1'], ['normal', 'Normal', 'px-2'], ['amplio', 'Amplio', 'px-3.5']] as const).map(([valor, etiqueta, relleno]) => <button type="button" key={valor} onClick={() => savePrefs(tam, tema, fuente, pesoFuente, interlineado, alineacion, valor)} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border text-[9px] ${margenLectura === valor ? "border-[#D4AF37] bg-[#D4AF37]/12 text-[#F2D27A]" : "border-[#D4AF37]/20 text-[#8F897C]"}`}><span className={`block h-5 w-9 rounded-sm border border-current ${relleno}`}><span className="mt-1 block border-t border-current" /><span className="mt-1 block border-t border-current" /></span>{etiqueta}</button>)}</div></div>
            </div>}

            {pestanaConfiguracion === 'mas' && <div className="divide-y divide-[#D4AF37]/20 border-y border-[#D4AF37]/25"><div className="flex min-h-16 items-center gap-3 px-2"><span className="w-24 text-xs text-[#C9C3B3]">Interlineado</span><div className="grid flex-1 grid-cols-3 gap-1">{[1.7, 1.9, 2.1].map((valor) => <button type="button" key={valor} onClick={() => savePrefs(tam, tema, fuente, pesoFuente, valor)} className={`min-h-11 rounded-lg border text-xs ${interlineado === valor ? "border-[#D4AF37] bg-[#D4AF37]/12 text-[#F2D27A]" : "border-[#D4AF37]/20 text-[#8F897C]"}`}>{valor === 1.7 ? 'Compacto' : valor === 1.9 ? 'Normal' : 'Amplio'}</button>)}</div></div><div className="p-3"><button type="button" onClick={() => void restablecerPreferencias()} className="min-h-11 w-full rounded-lg border border-[#D4AF37]/25 px-4 text-xs font-semibold text-[#C9C3B3] transition hover:border-[#D4AF37]/50 hover:text-[#F2D27A]">Restablecer preferencias de lectura</button></div></div>}
          </div>
        </div>}
        {mostrarMenu && <div className="absolute inset-x-0 top-full px-3 pt-2">
          <div className="mx-auto flex max-w-[430px] justify-end md:max-w-4xl">
            <div ref={panelMenuRef} className="w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[#D4AF37]/35 bg-[#090909]/[0.98] text-[#F8F5EA] shadow-[0_24px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="border-b border-[#D4AF37]/15 px-4 py-3"><span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Versión activa</span><strong className="mt-1 block truncate text-xs text-[#C9C3B3]">{version?.nombre || "Biblia"}</strong></div>
              <nav className="p-1.5" aria-label="Más acciones de lectura">
                {[
                  { label: "Comparar este capítulo", detail: "Ver otras traducciones", icon: Columns3, action: () => navigate(`/biblia/comparar?libro=${libroCodigo}&cap=${capitulo}`) },
                  { label: "Estudiar este pasaje", detail: "Estructura, teología y oración", icon: Sparkles, action: () => navigate(`/biblia/estudio?libro=${libroCodigo}&cap=${capitulo}`) },
                  { label: "Abrir Mi Biblia", detail: "Favoritos, notas y resaltados", icon: Library, action: () => navigate("/biblia/mi-biblia") },
                  { label: "Elegir otro pasaje", detail: "Cambiar libro o capítulo", icon: BookOpen, action: () => navigate(`/biblia/libros?libro=${libroCodigo}&cap=${capitulo}`) },
                ].map(({ label, detail, icon: Icono, action }) => <button type="button" key={label} onClick={() => { setMostrarMenu(false); action(); }} className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[#D4AF37]/10 focus-visible:bg-[#D4AF37]/10 focus-visible:outline-none"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]"><Icono className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-xs text-[#F8F5EA]">{label}</strong><span className="mt-0.5 block text-[10px] text-[#8F897C]">{detail}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-[#D4AF37]/70" /></button>)}
              </nav>
            </div>
          </div>
        </div>}
      </header>

      {selectorLectura && <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/75 px-4 pb-8 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-sm" onClick={() => setSelectorLectura(null)}>
        <section className="w-full max-w-[430px] rounded-[1.6rem] border border-[#D4AF37]/40 bg-[#0B0B0B] p-4 text-[#F8F5EA] shadow-[0_28px_90px_rgba(0,0,0,0.8)]" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37]">Navegación bíblica</p><h2 className="font-display mt-1 text-2xl">Elegir {selectorLectura}</h2></div><button type="button" onClick={() => setSelectorLectura(null)} className="lvj-sacred-icon-button h-11 w-11" aria-label="Cerrar selector"><X className="h-4 w-4" /></button></div>
          {selectorLectura === "libro" && <><div className="mb-4 grid grid-cols-2 rounded-xl border border-[#D4AF37]/25 p-1">{(["AT", "NT"] as TestamentoBiblico[]).map((value) => <button key={value} type="button" onClick={() => setTestamentoSelector(value)} className={`min-h-11 rounded-lg text-xs font-semibold ${testamentoSelector === value ? "bg-[#D4AF37] text-[#050505]" : "text-[#C9C3B3]"}`}>{value === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}</button>)}</div><div className="grid max-h-[65vh] grid-cols-4 gap-2 overflow-y-auto pr-1">{librosSelector.map((book) => <button key={book.codigo} type="button" title={book.nombre} onClick={() => { setParams({ libro: book.codigo, cap: "1" }); setSelectorLectura("capitulo"); }} className={`min-h-14 rounded-xl border px-1 py-2 text-sm font-semibold ${book.codigo === libroCodigo ? "border-[#F2D27A] bg-[#D4AF37] text-[#050505]" : "border-[#D4AF37]/25 bg-[#111111] text-[#F2D27A]"}`}>{book.abreviatura}</button>)}</div></>}
          {selectorLectura === "capitulo" && <div className="grid max-h-[70vh] grid-cols-6 gap-2 overflow-y-auto pr-1">{caps.map((numero) => <button key={numero} type="button" onClick={() => { irAlCapitulo(numero); setSelectorLectura(null); }} className={`aspect-square rounded-xl border text-sm font-semibold ${numero === capitulo ? "border-[#F2D27A] bg-[#D4AF37] text-[#050505]" : "border-[#D4AF37]/25 bg-[#111111] text-[#F2D27A]"}`}>{numero}</button>)}</div>}
          {selectorLectura === "versiculo" && <div className="grid max-h-[70vh] grid-cols-6 gap-2 overflow-y-auto pr-1">{versiculos.map((verse) => <button key={verse.id} type="button" onClick={() => { setParams({ libro: libroCodigo, cap: String(capitulo), versiculo: String(verse.versiculo) }); setSelectorLectura(null); }} className={`aspect-square rounded-xl border text-sm font-semibold ${verse.versiculo === versiculoSeleccionado ? "border-[#F2D27A] bg-[#D4AF37] text-[#050505]" : "border-[#D4AF37]/25 bg-[#111111] text-[#F2D27A]"}`}>{verse.versiculo}</button>)}</div>}
        </section>
      </div>}

      <article className={`-mx-4 min-h-screen border-x-0 px-5 pt-[calc(8rem+env(safe-area-inset-top))] transition-colors md:mx-0 md:px-10 ${versiculosSeleccionados.length > 0 ? "pb-52" : "pb-10"} ${bgTema}`}>
        <header className="mb-8 pt-7 text-center">
          <h1 className={`inline-flex items-baseline justify-center gap-2 font-display text-4xl md:text-5xl ${colorTitulo}`}>
            <span aria-hidden="true" className={`text-[0.72em] font-normal ${colorAcento}`}>✝</span>
            <span>{libroActual?.nombre}</span>
            <span className={colorAcento}>{capitulo}</span>
          </h1>
        </header>
        {hayContenido === null ? <p className="py-10 text-center opacity-70">Cargando capítulo…</p> : versiculos.length === 0 ? <p className="py-10 text-center opacity-70">Este capítulo no tiene versículos disponibles.</p> : <div style={{ ...anchoLectura, fontSize: tam, lineHeight: interlineado, fontFamily: familiaLectura, fontWeight: pesoFuente, textAlign: alineacion === "justificada" ? "justify" : "left" }} className="mx-auto transition-[width,max-width]">
          {versiculos.map((v) => {
            const notaAbierta = openNoteId === v.id;
            const noteContentId = `nota-versiculo-${v.id}`;
            const claseResaltado = coloresResaltado.find((item) => item.color === resaltados[v.versiculo])?.clase || "";
            return <section key={v.id} id={`versiculo-${v.versiculo}`} data-versiculo={v.versiculo} onPointerUp={() => window.setTimeout(capturarSeleccion, 0)} className={`scroll-mt-28 select-text touch-pan-y rounded-lg px-1 py-2 transition-colors ${claseResaltado} ${versiculoSeleccionado === v.versiculo && !claseResaltado ? "bg-[#D4AF37]/5" : ""}`}>
              <p><span className={`mr-3 inline-block align-baseline text-[1.35em] font-semibold ${colorAcento}`}>{v.versiculo}</span><span>{v.texto}</span>{v.tiene_nota && <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); void alternarNotaEstudio(v); }} className={`ml-2 inline-flex min-h-11 min-w-11 items-center justify-center align-middle text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${colorAcento}`} aria-label={`${notaAbierta ? "Cerrar" : "Abrir"} nota del versículo ${v.versiculo}`} aria-expanded={notaAbierta} aria-controls={noteContentId}>◆</button>}</p>
              {notaAbierta && <aside id={noteContentId} onClick={(e) => e.stopPropagation()} className={`mt-4 rounded-2xl border border-l-[3px] p-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 ${estiloNota}`}>
                <div className="mb-4 flex items-center justify-between"><strong className={`text-sm uppercase tracking-[0.22em] ${colorNota}`}>Nota {notasPorVersiculo[v.versiculo]?.[0]?.numero ?? notasPorVersiculo[v.versiculo]?.[0]?.orden ?? 1}</strong><button type="button" onClick={() => setOpenNoteId(null)} className={`flex h-11 w-11 items-center justify-center rounded-full border ${esTinta ? "border-[#4b4c45]/35 text-[#30312c] hover:bg-black/[0.05]" : "border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/10"}`} aria-label={`Cerrar nota del versículo ${v.versiculo}`}><X className="h-4 w-4" /></button></div>
                {!notasPorVersiculo[v.versiculo] ? <p className="text-sm opacity-75">Cargando nota de estudio…</p> : notasPorVersiculo[v.versiculo].map((nota) => <div key={nota.id} className="mb-3 last:mb-0"><p className="text-[0.92em] leading-relaxed">{nota.texto}</p>{nota.referencia && <p className={`mt-2 text-[0.82em] ${colorNota}`}>Referencias: {nota.referencia}</p>}</div>)}
              </aside>}
            </section>;
          })}
        </div>}
        <nav className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3" aria-label="Navegación entre capítulos">
          <button type="button" disabled={capitulo <= 1} onClick={() => irAlCapitulo(capitulo - 1)} className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 ${estiloBotonCapitulo}`}><ChevronLeft className="h-5 w-5" />Capítulo anterior</button>
          <button type="button" disabled={!caps.length || capitulo >= caps.length} onClick={() => irAlCapitulo(capitulo + 1)} className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 ${estiloBotonCapitulo}`}>Capítulo siguiente<ChevronRight className="h-5 w-5" /></button>
        </nav>
        {version && <p className="mt-6 text-center text-[10px] uppercase tracking-[0.18em] opacity-50">{version.nombre}</p>}
      </article>

      {versiculosSeleccionados.length > 0 && !mostrarTipografia && !selectorLectura && <aside className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[55] mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#D4AF37]/55 bg-[#080808]/[0.98] text-[#F8F5EA] shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-xl" aria-label="Acciones para los versículos seleccionados">
        <div className="flex items-center justify-between border-b border-[#D4AF37]/15 px-4 py-2.5">
          <div className="min-w-0"><strong className="block truncate text-sm text-[#F2D27A]">{referenciaSeleccion}</strong><span className="block max-w-[16rem] truncate text-[10px] text-[#9E9788]">“{textoSeleccionado}”</span></div>
          <button type="button" onClick={limpiarSeleccion} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#C9C3B3] hover:bg-white/5" aria-label="Cerrar acciones de selección"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-2" aria-label="Colores para resaltar">
          {coloresResaltado.map((item) => <button key={item.color} type="button" onClick={() => void onResaltarSeleccion(item.color)} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition focus-visible:ring-2 focus-visible:ring-[#F2D27A] ${versiculosSeleccionados.every((numero) => resaltados[numero] === item.color) ? "border-white" : "border-transparent"}`} aria-label={`Resaltar selección en ${item.color}`}><span className={`h-6 w-6 rounded-full ${item.muestra}`} /></button>)}
          {versiculosSeleccionados.some((numero) => Boolean(resaltados[numero])) && <button type="button" onClick={() => void onQuitarResaltadosSeleccion()} className="ml-1 min-h-10 shrink-0 rounded-full border border-[#D4AF37]/25 px-3 text-[10px] text-[#C9C3B3]">Sin color</button>}
        </div>
        <div className="grid grid-cols-5 border-t border-[#D4AF37]/15 px-2 py-1.5">
          <button type="button" onClick={() => void onFavoritosSeleccion()} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[9px] text-[#D4AF37]" aria-label="Alternar favoritos seleccionados"><Heart className={`h-4 w-4 ${versiculosSeleccionados.every((numero) => favs[numero]) ? "fill-[#D4AF37]" : "fill-transparent"}`} /><span>Favorito</span></button>
          <button type="button" onClick={() => void onMarcadoresSeleccion()} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[9px] text-[#D4AF37]" aria-label="Guardar marcadores"><Bookmark className="h-4 w-4" /><span>Guardar</span></button>
          <button type="button" onClick={() => void onNotaSeleccion()} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[9px] text-[#D4AF37]" aria-label="Crear nota personal"><StickyNote className="h-4 w-4" /><span>Nota</span></button>
          <button type="button" onClick={() => void onCopiar()} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[9px] text-[#D4AF37]" aria-label="Copiar selección"><Copy className="h-4 w-4" /><span>Copiar</span></button>
          <button type="button" onClick={() => void onCompartir()} className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[9px] text-[#D4AF37]" aria-label="Compartir selección"><Share2 className="h-4 w-4" /><span>Compartir</span></button>
        </div>
      </aside>}
    </BibliaLayout>
  );
}
