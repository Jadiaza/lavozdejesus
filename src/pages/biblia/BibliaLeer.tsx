import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Link } from "react-router-dom";

const VERSION = "straubinger";

type Tema = "oscuro" | "claro" | "sepia";

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
      ? "bg-[#f7f3e9] text-[#1a1a1a]"
      : tema === "sepia"
        ? "bg-[#2b1f13] text-[#f3e6c8]"
        : "bg-navy-deep text-foreground";

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
      `Nota personal – ${libroActual?.nombre} ${v.capitulo},${v.versiculo}`,
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
        <div className="glass gold-border rounded-2xl p-6 text-center">
          <BookMarked className="h-8 w-8 text-gold mx-auto mb-3" />
          <div className="font-display text-xl mb-1">Aún no hay texto cargado</div>
          <p className="text-sm text-foreground/70 mb-4">
            Importá la Biblia Straubinger para comenzar a leer.
          </p>
          <Link
            to="/biblia/importar"
            className="inline-flex items-center gap-2 bg-gradient-gold text-navy-deep font-semibold px-5 py-2.5 rounded-full shadow-gold"
          >
            Ir al importador
          </Link>
        </div>
      </BibliaLayout>
    );
  }

  return (
    <BibliaLayout title="Leer Biblia">
      {/* Selectores */}
      <div className="glass gold-border rounded-2xl p-3 mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <select
          className="bg-transparent gold-border rounded-lg px-3 py-2 text-sm"
          value="straubinger"
          disabled
        >
          <option value="straubinger">Straubinger</option>
        </select>
        <select
          className="bg-transparent gold-border rounded-lg px-3 py-2 text-sm"
          value={test}
          onChange={(e) => {
            const t = e.target.value as Testamento;
            setTest(t);
            const first = LIBROS.find((l) => l.testamento === t)!;
            cambiar({ libro: String(first.id), cap: "1" });
          }}
        >
          <option value="AT">Antiguo Testamento</option>
          <option value="NT">Nuevo Testamento</option>
        </select>
        <select
          className="bg-transparent gold-border rounded-lg px-3 py-2 text-sm"
          value={libroId}
          onChange={(e) => cambiar({ libro: e.target.value, cap: "1" })}
        >
          {librosDelTest.map((l) => (
            <option key={l.id} value={l.id} className="bg-navy-deep">
              {l.nombre}
            </option>
          ))}
        </select>
        <select
          className="bg-transparent gold-border rounded-lg px-3 py-2 text-sm"
          value={capitulo}
          onChange={(e) => cambiar({ cap: e.target.value })}
        >
          {(caps.length ? caps : [1]).map((c) => (
            <option key={c} value={c} className="bg-navy-deep">
              Capítulo {c}
            </option>
          ))}
        </select>
      </div>

      {/* Contenedor de lectura */}
      <article className={`rounded-3xl p-5 md:p-8 mb-6 transition-colors ${bgTema}`}>
        <header className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl md:text-3xl">
            {libroActual?.nombre}{" "}
            <span className="text-gold">{capitulo}</span>
          </h2>
          <span className="text-[10px] uppercase tracking-[0.25em] opacity-70">
            Biblia Straubinger
          </span>
        </header>

        {versiculos.length === 0 ? (
          <p className="text-sm opacity-70">Este capítulo no tiene versículos cargados.</p>
        ) : (
          <div style={{ fontSize: tam, lineHeight: 1.7 }} className="space-y-3">
            {versiculos.map((v) => (
              <div key={v.versiculo} className="group">
                <p className="leading-relaxed">
                  <sup className="text-gold font-semibold mr-1">{v.versiculo}</sup>
                  <span>{v.texto}</span>
                  {v.tieneNota && (
                    <button
                      onClick={() => onVerNota(v)}
                      className="ml-1 align-super text-[10px] text-gold underline"
                      title="Nota de Straubinger"
                    >
                      ✦
                    </button>
                  )}
                </p>
                <div className="mt-1 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onFav(v)}
                    className="p-1.5 rounded-full hover:bg-gold/10"
                    title="Favorito"
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${favs[v.versiculo] ? "fill-gold text-gold" : "text-gold"}`}
                    />
                  </button>
                  <button
                    onClick={() => onNotaPersonal(v)}
                    className="p-1.5 rounded-full hover:bg-gold/10"
                    title="Nota personal"
                  >
                    <StickyNote className="h-3.5 w-3.5 text-gold" />
                  </button>
                  <button
                    onClick={() => onCopiar(v)}
                    className="p-1.5 rounded-full hover:bg-gold/10"
                    title="Copiar"
                  >
                    <Copy className="h-3.5 w-3.5 text-gold" />
                  </button>
                  <button
                    onClick={() => onCompartir(v)}
                    className="p-1.5 rounded-full hover:bg-gold/10"
                    title="Compartir"
                  >
                    <Share2 className="h-3.5 w-3.5 text-gold" />
                  </button>
                  {v.tieneNota && (
                    <button
                      onClick={() => onVerNota(v)}
                      className="p-1.5 rounded-full hover:bg-gold/10"
                      title="Ver nota de Straubinger"
                    >
                      <BookMarked className="h-3.5 w-3.5 text-gold" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* Panel de tipografía */}
      <div className="glass gold-border rounded-2xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-gold" />
          <button
            onClick={() => savePrefs(Math.max(13, tam - 1), tema)}
            className="h-8 w-8 rounded-full glass gold-border"
          >
            A-
          </button>
          <span className="text-xs tabular-nums w-6 text-center">{tam}</span>
          <button
            onClick={() => savePrefs(Math.min(26, tam + 1), tema)}
            className="h-8 w-8 rounded-full glass gold-border"
          >
            A+
          </button>
        </div>
        <div className="flex items-center gap-1">
          {(["claro", "oscuro", "sepia"] as Tema[]).map((t) => (
            <button
              key={t}
              onClick={() => savePrefs(tam, t)}
              className={`px-3 h-8 rounded-full text-xs capitalize border transition ${
                tema === t
                  ? "bg-gradient-gold text-navy-deep border-transparent"
                  : "gold-border text-foreground/70 hover:text-gold"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Modal nota Straubinger */}
      {notaAbierta !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          onClick={() => setNotaAbierta(null)}
        >
          <div
            className="glass gold-border rounded-3xl max-w-lg w-full p-5 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] uppercase tracking-[0.25em] text-gold mb-2">
              Nota de Straubinger
            </div>
            <div className="font-display text-lg mb-3">
              {libroActual?.nombre} {capitulo}
            </div>
            {notaAbierta.length === 0 ? (
              <p className="text-sm text-foreground/70">
                Este versículo tiene marca de nota pero aún no se importó su texto.
              </p>
            ) : (
              notaAbierta.map((n) => (
                <p
                  key={n.id}
                  className="text-sm text-foreground/85 leading-relaxed mb-3 whitespace-pre-line"
                >
                  {n.texto}
                </p>
              ))
            )}
            <button
              className="mt-2 w-full bg-gradient-gold text-navy-deep font-semibold py-2.5 rounded-full"
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