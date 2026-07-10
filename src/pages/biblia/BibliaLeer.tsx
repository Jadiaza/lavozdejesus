import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Copy, Heart, Share2, StickyNote, BookMarked, Type } from "lucide-react";
import { BibliaLayout } from "./BibliaLayout";
import { LIBROS, libroById, type Testamento } from "@/features/biblia/books";
import {
  getCapitulosDeLibro,
  getMeta,
  getVersiculosDeCapitulo,
  getNotasStraubinger,
  setMeta,
  toggleFavorito,
  esFavorito,
  crearNotaPersonal,
  type VersiculoRow,
  type NotaStraubingerRow,
} from "@/features/biblia/db";
import { toast } from "@/components/ui/sonner";

const VERSION = "straubinger";

type Tema = "oscuro" | "claro" | "sepia";

const selectClass =
  "rounded-2xl border border-[#D4AF37]/25 bg-[#0B0B0B] px-3 py-2.5 text-sm text-[#F8F5EA] outline-none transition focus:border-[#F2D27A] focus:ring-2 focus:ring-[#D4AF37]/20 disabled:opacity-70";

const optionClass = "bg-[#0B0B0B] text-[#F8F5EA]";

export default function BibliaLeer() {
  const [params, setParams] = useSearchParams();
  const libroId = Number(params.get("libro") ?? "1");
  const capitulo = Number(params.get("cap") ?? "1");

  const [test, setTest] = useState<Testamento>(
    (libroById(libroId)?.testamento ?? "AT") as Testamento,
  );
  const [caps, setCaps] = useState<number[]>([]);
  const [versiculos, setVersiculos] = useState<VersiculoRow[]>([]);
  const [tam, setTam] = useState<number>(17);
  const [tema, setTema] = useState<Tema>("oscuro");
  const [notaAbierta, setNotaAbierta] = useState<NotaStraubingerRow[] | null>(null);
  const [favs, setFavs] = useState<Record<number, boolean>>({});
  const [hayContenido, setHayContenido] = useState<boolean | null>(null);

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
    (async () => {
      const cs = await getCapitulosDeLibro(VERSION, libroId);
      setCaps(cs);
      setHayContenido(cs.length > 0);
    })();
  }, [libroId]);

  useEffect(() => {
    (async () => {
      const vs = await getVersiculosDeCapitulo(VERSION, libroId, capitulo);
      setVersiculos(vs);
      const favMap: Record<number, boolean> = {};
      for (const v of vs) {
        favMap[v.versiculo] = await esFavorito(libroId, capitulo, v.versiculo);
      }
      setFavs(favMap);
      await setMeta("ultimaLectura", { libroId, capitulo });
    })();
  }, [libroId, capitulo]);

  const librosDelTest = useMemo(
    () => LIBROS.filter((l) => l.testamento === test),
    [test],
  );

  const libroActual = libroById(libroId);

  const cambiar = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) next.set(k, v);
    setParams(next);
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

  const onCopiar = async (v: VersiculoRow) => {
    const txt = `${libroActual?.nombre} ${v.capitulo},${v.versiculo}: ${v.texto}`;
    await navigator.clipboard.writeText(txt);
    toast.success("Versículo copiado");
  };

  const onCompartir = async (v: VersiculoRow) => {
    const txt = `${libroActual?.nombre} ${v.capitulo},${v.versiculo}: ${v.texto}`;
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

  const onFav = async (v: VersiculoRow) => {
    const nowFav = await toggleFavorito(libroId, capitulo, v.versiculo);
    setFavs((p) => ({ ...p, [v.versiculo]: nowFav }));
    toast.success(nowFav ? "Guardado en favoritos" : "Quitado de favoritos");
  };

  const onVerNota = async (v: VersiculoRow) => {
    const ns = await getNotasStraubinger(libroId, capitulo, v.versiculo);
    setNotaAbierta(ns.length ? ns : []);
  };

  const onNotaPersonal = async (v: VersiculoRow) => {
    const texto = window.prompt(
      `Nota personal - ${libroActual?.nombre} ${v.capitulo},${v.versiculo}`,
    );
    if (!texto?.trim()) return;
    await crearNotaPersonal({
      libroId,
      capitulo,
      versiculo: v.versiculo,
      texto: texto.trim(),
    });
    toast.success("Nota personal guardada");
  };

  if (hayContenido === false) {
    return (
      <BibliaLayout title="Leer Biblia">
        <div className="rounded-[2rem] border border-[#D4AF37]/25 bg-[#111111] p-7 text-center shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
          <BookMarked className="mx-auto mb-4 h-9 w-9 text-[#D4AF37]" />
          <div className="font-display mb-2 text-2xl text-[#F8F5EA]">
            Aún no hay texto cargado
          </div>
          <p className="mb-5 text-sm leading-relaxed text-[#C9C3B3]">
            Importa la Biblia Straubinger para comenzar a leer.
          </p>
          <Link
            to="/biblia/importar"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] px-5 py-2.5 font-semibold text-[#070707] shadow-[0_12px_28px_rgba(212,175,55,0.25)]"
          >
            Ir al importador
          </Link>
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
            Straubinger
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
        <select
          className={selectClass}
          value={test}
          onChange={(e) => {
            const t = e.target.value as Testamento;
            setTest(t);
            const first = LIBROS.find((l) => l.testamento === t)!;
            cambiar({ libro: String(first.id), cap: "1" });
          }}
        >
          <option value="AT" className={optionClass}>
            Antiguo Testamento
          </option>
          <option value="NT" className={optionClass}>
            Nuevo Testamento
          </option>
        </select>
        <select
          className={selectClass}
          value={libroId}
          onChange={(e) => cambiar({ libro: e.target.value, cap: "1" })}
        >
          {librosDelTest.map((l) => (
            <option key={l.id} value={l.id} className={optionClass}>
              {l.nombre}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={capitulo}
          onChange={(e) => cambiar({ cap: e.target.value })}
        >
          {(caps.length ? caps : [1]).map((c) => (
            <option key={c} value={c} className={optionClass}>
              Capítulo {c}
            </option>
          ))}
        </select>
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

        {versiculos.length === 0 ? (
          <p className="text-sm opacity-70">Este capítulo no tiene versículos cargados.</p>
        ) : (
          <div style={{ fontSize: tam, lineHeight: 1.78 }} className="space-y-4">
            {versiculos.map((v) => (
              <div
                key={v.versiculo}
                className="group rounded-2xl border border-transparent px-1.5 py-1 transition hover:border-[#D4AF37]/15 hover:bg-[#D4AF37]/5"
              >
                <p className="leading-relaxed">
                  <sup className="mr-1.5 font-semibold text-[#D4AF37]">{v.versiculo}</sup>
                  <span>{v.texto}</span>
                  {v.tieneNota && (
                    <button
                      onClick={() => onVerNota(v)}
                      className="ml-1 align-super text-[11px] text-[#D4AF37] underline underline-offset-2"
                      title="Nota de Straubinger"
                    >
                      *
                    </button>
                  )}
                </p>
                <div className="mt-2 flex items-center gap-1 opacity-70 transition group-hover:opacity-100">
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
                  {v.tieneNota && (
                    <button
                      onClick={() => onVerNota(v)}
                      className="rounded-full border border-transparent p-1.5 hover:border-[#D4AF37]/25 hover:bg-[#D4AF37]/10"
                      title="Ver nota de Straubinger"
                    >
                      <BookMarked className="h-3.5 w-3.5 text-[#D4AF37]" />
                    </button>
                  )}
                </div>
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

      {notaAbierta !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 backdrop-blur-sm md:items-center"
          onClick={() => setNotaAbierta(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-[#D4AF37]/25 bg-[#111111] p-5 text-[#F8F5EA] shadow-[0_28px_90px_rgba(0,0,0,0.7)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">
              Nota de Straubinger
            </div>
            <div className="font-display mb-4 text-lg">
              {libroActual?.nombre} {capitulo}
            </div>
            {notaAbierta.length === 0 ? (
              <p className="text-sm leading-relaxed text-[#C9C3B3]">
                Este versículo tiene marca de nota pero aún no se importó su texto.
              </p>
            ) : (
              notaAbierta.map((n) => (
                <p
                  key={n.id}
                  className="mb-3 whitespace-pre-line text-sm leading-relaxed text-[#C9C3B3]"
                >
                  {n.texto}
                </p>
              ))
            )}
            <button
              className="mt-3 w-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] py-2.5 font-semibold text-[#070707]"
              onClick={() => setNotaAbierta(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </BibliaLayout>
  );
}
