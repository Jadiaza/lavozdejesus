import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookMarked,
  ChevronDown,
  Copy,
  Heart,
  Share2,
  StickyNote,
  Type,
  X,
} from "lucide-react";
import { BibliaLayout } from "./BibliaLayout";
import {
  getMeta,
  setMeta,
  toggleFavorito,
  esFavorito,
  crearNotaPersonal,
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

type SelectorAbierto = "libro" | "capitulo" | "versiculo" | null;

export default function BibliaLeer() {
  const [params, setParams] = useSearchParams();
  const libroCodigo = (params.get("libro") ?? "GEN").toUpperCase();
  const capitulo = Number(params.get("cap") ?? "1");
  const versiculoSeleccionado = Number(params.get("versiculo") ?? "0");

  const [test, setTest] = useState<TestamentoBiblico>("AT");
  const [version, setVersion] = useState<BibliaVersion | null>(null);
  const [libros, setLibros] = useState<BibliaLibro[]>([]);
  const [caps, setCaps] = useState<number[]>([]);
  const [versiculos, setVersiculos] = useState<BibliaVersiculo[]>([]);
  const [tam, setTam] = useState<number>(17);
  const [tema, setTema] = useState<Tema>("oscuro");
  const [versiculoActivo, setVersiculoActivo] = useState<number | null>(null);
  const [notaVersiculoAbierta, setNotaVersiculoAbierta] = useState<number | null>(null);
  const [notasPorVersiculo, setNotasPorVersiculo] = useState<Record<number, BibliaNota[]>>({});
  const [favs, setFavs] = useState<Record<number, boolean>>({});
  const [hayContenido, setHayContenido] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [selectorAbierto, setSelectorAbierto] = useState<SelectorAbierto>(null);
  const pulsacionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulsacionSostenida = useRef(false);

  useEffect(() => {
    (async () => {
      const s = await getMeta<{ tam: number; tema: Tema }>("prefsLectura");
      if (s) {
        setTam(s.tam ?? 17);
        setTema(s.tema ?? "oscuro");
      }
    })();
  }, []);

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
    setNotaVersiculoAbierta(null);
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
        setTest(data.libro.testamento);
        setHayContenido(data.versiculos.length > 0);
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

  const librosDelTest = useMemo(
    () => libros.filter((book) => book.testamento === test),
    [libros, test],
  );

  const libroActual = libros.find((book) => book.codigo === libroCodigo);

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

  const cambiar = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    setParams(next);
  };

  const seleccionarLibro = (book: BibliaLibro) => {
    setTest(book.testamento);
    setSelectorAbierto(null);
    cambiar({ libro: book.codigo, cap: "1", versiculo: null });
  };

  const seleccionarCapitulo = (numero: number) => {
    setSelectorAbierto(null);
    cambiar({ cap: String(numero), versiculo: null });
  };

  const seleccionarVersiculo = (numero: number) => {
    setSelectorAbierto(null);
    cambiar({ versiculo: String(numero) });
  };

  const savePrefs = async (nuevoTam: number, nuevoTema: Tema) => {
    setTam(nuevoTam);
    setTema(nuevoTema);
    await setMeta("prefsLectura", { tam: nuevoTam, tema: nuevoTema });
  };

  const bgTema =
    tema === "claro"
      ? "border-[#D4AF37]/30 bg-[#F8F5EA] text-[#14120d]"
      : tema === "sepia"
        ? "border-[#D4AF37]/25 bg-[#21180f] text-[#f4e4bd]"
        : "border-[#D4AF37]/20 bg-[#111111] text-[#F8F5EA]";

  const onCopiar = async (v: BibliaVersiculo) => {
    const seleccionado = window.getSelection()?.toString().trim();
    const txt = seleccionado ||
      `${libroActual?.nombre} ${v.capitulo},${v.versiculo}: ${v.texto}`;
    await navigator.clipboard.writeText(txt);
    toast.success("Versículo copiado");
  };

  const onCompartir = async (v: BibliaVersiculo) => {
    const seleccionado = window.getSelection()?.toString().trim();
    const txt = seleccionado ||
      `${libroActual?.nombre} ${v.capitulo},${v.versiculo}: ${v.texto}`;
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

  const onFav = async (v: BibliaVersiculo) => {
    if (!libroActual) return;
    const nowFav = await toggleFavorito(libroActual.id, capitulo, v.versiculo);
    setFavs((p) => ({ ...p, [v.versiculo]: nowFav }));
    toast.success(nowFav ? "Guardado en favoritos" : "Quitado de favoritos");
  };

  const onNotaPersonal = async (v: BibliaVersiculo) => {
    if (!libroActual) return;
    const texto = window.prompt(
      `Nota personal - ${libroActual?.nombre} ${v.capitulo},${v.versiculo}`,
    );
    if (!texto?.trim()) return;
    await crearNotaPersonal({
      libroId: libroActual.id,
      capitulo,
      versiculo: v.versiculo,
      texto: texto.trim(),
    });
    toast.success("Nota personal guardada");
  };

  const alternarNotaEstudio = async (v: BibliaVersiculo) => {
    if (notaVersiculoAbierta === v.versiculo) {
      setNotaVersiculoAbierta(null);
      return;
    }

    setNotaVersiculoAbierta(v.versiculo);
    if (notasPorVersiculo[v.versiculo]) return;

    try {
      const notas = await getBibliaNotas(libroCodigo, capitulo, v.versiculo);
      setNotasPorVersiculo((actual) => ({ ...actual, [v.versiculo]: notas }));
    } catch (cause) {
      setNotaVersiculoAbierta(null);
      toast.error(cause instanceof Error ? cause.message : "No fue posible cargar la nota");
    }
  };

  const cancelarPulsacion = () => {
    if (pulsacionTimer.current) {
      clearTimeout(pulsacionTimer.current);
      pulsacionTimer.current = null;
    }
  };

  const iniciarPulsacion = (
    event: React.PointerEvent<HTMLDivElement>,
    versiculo: number,
  ) => {
    if ((event.target as HTMLElement).closest("button")) return;
    cancelarPulsacion();
    pulsacionSostenida.current = false;
    pulsacionTimer.current = setTimeout(() => {
      pulsacionSostenida.current = true;
      setVersiculoActivo(versiculo);
      navigator.vibrate?.(20);
    }, 550);
  };

  const terminarPulsacion = (versiculo: number) => {
    cancelarPulsacion();
    if (window.getSelection()?.toString().trim()) {
      setVersiculoActivo(versiculo);
    }
  };

  const manejarClickVersiculo = () => {
    if (pulsacionSostenida.current) {
      pulsacionSostenida.current = false;
      return;
    }
    setVersiculoActivo(null);
  };

  if (hayContenido === false && error) {
    return (
      <BibliaLayout title="Leer Biblia">
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
    <BibliaLayout title="Leer Biblia">
      <section className="mb-4 rounded-[1.65rem] border border-[#D4AF37]/20 bg-[#0B0B0B]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">
              Leer la Biblia
            </div>
            <h1 className="font-display truncate text-2xl leading-tight text-[#F8F5EA]">
              {libroActual?.nombre} <span className="text-[#F2D27A]">{capitulo}</span>
            </h1>
          </div>
          <span className="shrink-0 rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#F2D27A]">
            {version?.abreviatura || "Biblia Platense"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SelectorButton
            label="Libro"
            value={libroActual?.abreviatura || libroCodigo}
            onClick={() => setSelectorAbierto("libro")}
          />
          <SelectorButton
            label="Capítulo"
            value={String(capitulo)}
            onClick={() => setSelectorAbierto("capitulo")}
          />
          <SelectorButton
            label="Versículo"
            value={versiculoSeleccionado ? String(versiculoSeleccionado) : "—"}
            onClick={() => setSelectorAbierto("versiculo")}
          />
        </div>
      </section>

      <article
        className={`mb-5 rounded-[1.45rem] border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.42)] transition-colors md:p-7 ${bgTema}`}
      >
        <header className="mb-5 flex items-center justify-between gap-3 border-b border-[#D4AF37]/15 pb-3">
          <h2 className="font-display text-xl md:text-3xl">
            {libroActual?.nombre} <span className="text-[#D4AF37]">{capitulo}</span>
          </h2>
          <span className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-2.5 py-1 text-right text-[9px] uppercase tracking-[0.2em] text-[#D4AF37]">
            Lectura
          </span>
        </header>

        {hayContenido === null ? (
          <p className="text-sm opacity-70">Cargando capítulo…</p>
        ) : versiculos.length === 0 ? (
          <p className="text-sm opacity-70">Este capítulo no tiene versículos disponibles.</p>
        ) : (
          <div style={{ fontSize: tam, lineHeight: 1.78 }} className="space-y-4">
            {versiculos.map((v) => (
              <div
                key={v.versiculo}
                id={`versiculo-${v.versiculo}`}
                onPointerDown={(event) => iniciarPulsacion(event, v.versiculo)}
                onPointerUp={() => terminarPulsacion(v.versiculo)}
                onPointerCancel={cancelarPulsacion}
                onPointerLeave={cancelarPulsacion}
                onClick={manejarClickVersiculo}
                className={`scroll-mt-28 rounded-2xl border px-1.5 py-1 transition ${
                  versiculoSeleccionado === v.versiculo
                    ? "border-[#D4AF37]/60 bg-[#D4AF37]/10 shadow-[0_0_24px_rgba(212,175,55,0.12)]"
                    :
                  versiculoActivo === v.versiculo
                    ? "border-[#D4AF37]/25 bg-[#D4AF37]/5"
                    : "border-transparent"
                }`}
              >
                <p className="leading-relaxed">
                  <sup className="mr-1.5 font-semibold text-[#D4AF37]">{v.versiculo}</sup>
                  <span>{v.texto}</span>
                  {v.tiene_nota && (
                    <button
                      type="button"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        void alternarNotaEstudio(v);
                      }}
                      className="ml-1.5 inline-flex align-super text-[0.65em] leading-none text-[#D4AF37] transition hover:text-[#F2D27A] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
                      aria-label={`${notaVersiculoAbierta === v.versiculo ? "Ocultar" : "Mostrar"} nota de estudio del versículo ${v.versiculo}`}
                      aria-expanded={notaVersiculoAbierta === v.versiculo}
                      title="Nota de estudio"
                    >
                      ◆
                    </button>
                  )}
                </p>
                {notaVersiculoAbierta === v.versiculo &&
                  !notasPorVersiculo[v.versiculo] && (
                    <aside className="my-3 border-l-2 border-[#D4AF37]/55 bg-[#D4AF37]/5 px-3 py-2.5 text-[0.78em] leading-relaxed opacity-75">
                      Cargando nota de estudio…
                    </aside>
                  )}
                {notaVersiculoAbierta === v.versiculo &&
                  notasPorVersiculo[v.versiculo]?.map((nota) => (
                  <aside
                    key={nota.id}
                    onClick={(event) => event.stopPropagation()}
                    className="my-3 border-l-2 border-[#D4AF37]/55 bg-[#D4AF37]/5 px-3 py-2.5 text-[0.78em] leading-relaxed opacity-85"
                  >
                    <span className="mr-2 font-semibold uppercase tracking-[0.12em] text-[#D4AF37]">
                      Nota {nota.numero ?? nota.orden}
                    </span>
                    <span>{nota.texto}</span>
                  </aside>
                  ))}
                {versiculoActivo === v.versiculo && (
                <div
                  className="mt-2 flex items-center gap-1"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    onClick={() => onFav(v)}
                    className="rounded-full border border-transparent p-1.5 hover:border-[#D4AF37]/25 hover:bg-[#D4AF37]/10"
                    title="Favorito"
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${favs[v.versiculo] ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D4AF37]"}`}
                    />
                  </button>
                  <button
                    onClick={() => onNotaPersonal(v)}
                    className="rounded-full border border-transparent p-1.5 hover:border-[#D4AF37]/25 hover:bg-[#D4AF37]/10"
                    title="Nota personal"
                  >
                    <StickyNote className="h-3.5 w-3.5 text-[#D4AF37]" />
                  </button>
                  <button
                    onClick={() => onCopiar(v)}
                    className="rounded-full border border-transparent p-1.5 hover:border-[#D4AF37]/25 hover:bg-[#D4AF37]/10"
                    title="Copiar"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#D4AF37]" />
                  </button>
                  <button
                    onClick={() => onCompartir(v)}
                    className="rounded-full border border-transparent p-1.5 hover:border-[#D4AF37]/25 hover:bg-[#D4AF37]/10"
                    title="Compartir"
                  >
                    <Share2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                  </button>
                </div>
                )}
              </div>
            ))}
          </div>
        )}
      </article>

      <div className="flex items-center justify-between gap-3 rounded-[1.45rem] border border-[#D4AF37]/20 bg-[#0B0B0B] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-[#D4AF37]" />
          <button
            onClick={() => savePrefs(Math.max(13, tam - 1), tema)}
            className="h-8 w-8 rounded-full border border-[#D4AF37]/25 bg-[#0B0B0B] text-xs text-[#F8F5EA]"
          >
            A-
          </button>
          <span className="w-6 text-center text-xs tabular-nums text-[#C9C3B3]">{tam}</span>
          <button
            onClick={() => savePrefs(Math.min(26, tam + 1), tema)}
            className="h-8 w-8 rounded-full border border-[#D4AF37]/25 bg-[#0B0B0B] text-xs text-[#F8F5EA]"
          >
            A+
          </button>
        </div>
        <div className="flex items-center gap-1">
          {(["claro", "oscuro", "sepia"] as Tema[]).map((t) => (
            <button
              key={t}
              onClick={() => savePrefs(tam, t)}
              className={`h-8 rounded-full border px-3 text-xs capitalize transition ${
                tema === t
                  ? "border-transparent bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] text-[#070707]"
                  : "border-[#D4AF37]/25 text-[#C9C3B3] hover:text-[#F2D27A]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {selectorAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm md:items-center"
          onClick={() => setSelectorAbierto(null)}
        >
          <section
            className="max-h-[82vh] w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-[#D4AF37]/35 bg-[#0B0B0B] text-[#F8F5EA] shadow-[0_28px_90px_rgba(0,0,0,0.75)]"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-[#D4AF37]/20 px-5 py-4">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
                  Navegación bíblica
                </div>
                <h2 className="font-display mt-1 text-xl">
                  Escoger {selectorAbierto}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectorAbierto(null)}
                className="rounded-full border border-[#D4AF37]/25 p-2 text-[#D4AF37]"
                aria-label="Cerrar selector"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="max-h-[65vh] overflow-y-auto p-4 md:p-5">
              {selectorAbierto === "libro" && (
                <>
                  <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#050505] p-1.5">
                    {(["AT", "NT"] as TestamentoBiblico[]).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTest(value)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          test === value
                            ? "bg-[#D4AF37] text-[#050505]"
                            : "text-[#C9C3B3]"
                        }`}
                      >
                        {value === "AT" ? "Antiguo Testamento" : "Nuevo Testamento"}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {librosDelTest.map((book) => (
                      <button
                        key={book.codigo}
                        type="button"
                        onClick={() => seleccionarLibro(book)}
                        title={book.nombre}
                        className={`min-h-12 rounded-xl border px-2 py-2 text-sm font-semibold transition ${
                          book.codigo === libroCodigo
                            ? "border-[#F2D27A] bg-[#D4AF37] text-[#050505]"
                            : "border-[#D4AF37]/20 bg-[#111111] text-[#F2D27A] hover:border-[#D4AF37]/60"
                        }`}
                      >
                        {book.abreviatura}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectorAbierto === "capitulo" && (
                <NumberGrid
                  values={caps.length ? caps : [1]}
                  selected={capitulo}
                  onSelect={seleccionarCapitulo}
                />
              )}

              {selectorAbierto === "versiculo" && (
                <NumberGrid
                  values={versiculos.map((verse) => verse.versiculo)}
                  selected={versiculoSeleccionado}
                  onSelect={seleccionarVersiculo}
                />
              )}
            </div>
          </section>
        </div>
      )}

    </BibliaLayout>
  );
}

function SelectorButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center justify-between gap-1 rounded-2xl border border-[#D4AF37]/25 bg-[#111111] px-3 py-2.5 text-left transition hover:border-[#D4AF37]/60"
    >
      <span className="min-w-0">
        <span className="block text-[8px] font-semibold uppercase tracking-[0.18em] text-[#D4AF37]">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-sm font-semibold text-[#F8F5EA]">
          {value}
        </span>
      </span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
    </button>
  );
}

function NumberGrid({
  values,
  selected,
  onSelect,
}: {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
      {values.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={`aspect-square rounded-xl border text-sm font-semibold tabular-nums transition ${
            selected === value
              ? "border-[#F2D27A] bg-[#D4AF37] text-[#050505]"
              : "border-[#D4AF37]/20 bg-[#111111] text-[#F2D27A] hover:border-[#D4AF37]/60"
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
