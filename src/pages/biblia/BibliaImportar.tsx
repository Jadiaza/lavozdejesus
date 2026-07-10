import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, Trash2, Download, Play } from "lucide-react";
import { BibliaLayout } from "./BibliaLayout";
import bibliaUrl from "@/assets/biblia/toda-la-biblia.txt?url";
import notasUrl from "@/assets/biblia/todos-los-comentarios.txt?url";
import listaUrl from "@/assets/biblia/lista-libros.txt?url";
import { parseBiblia, parseComentarios, type ParsedBible } from "@/features/biblia/parser";
import {
  clearAllBibleData,
  getMeta,
  importParsedBibleData,
  setMeta,
} from "@/features/biblia/db";
import { libroById } from "@/features/biblia/books";
import { toast } from "@/components/ui/sonner";

type Estado = "idle" | "descargando" | "analizando" | "importando" | "listo" | "error";

interface Preview {
  librosDetectados: number[];
  totalCapitulos: number;
  totalVersiculos: number;
  totalNotas: number;
  errores: string[];
  parsed: ParsedBible;
  notasParsed: ReturnType<typeof parseComentarios>;
}

export default function BibliaImportar() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mensaje, setMensaje] = useState<string>("");
  const [ya, setYa] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const done = await getMeta<boolean>("importDone");
      setYa(!!done);
    })();
  }, []);

  const analizar = async () => {
    try {
      setEstado("descargando");
      setMensaje("Descargando archivos fuente...");
      const [bibliaTxt, notasTxt] = await Promise.all([
        fetch(bibliaUrl).then((r) => r.text()),
        fetch(notasUrl).then((r) => r.text()),
      ]);

      setEstado("analizando");
      setMensaje("Analizando texto bíblico...");
      const parsed = parseBiblia(bibliaTxt);
      const notasParsed = parseComentarios(notasTxt, parsed);

      const totalCapitulos = Object.values(parsed.capitulosPorLibro).reduce(
        (a, b) => a + b,
        0,
      );

      setPreview({
        librosDetectados: parsed.librosDetectados,
        totalCapitulos,
        totalVersiculos: parsed.versiculos.length,
        totalNotas: notasParsed.notas.length,
        errores: [...parsed.errores, ...notasParsed.errores],
        parsed,
        notasParsed,
      });
      setEstado("idle");
      setMensaje('Vista previa lista. Revisa los conteos y pulsa "Importar Biblia".');
    } catch (e) {
      console.error(e);
      setEstado("error");
      setMensaje("No se pudieron procesar los archivos.");
    }
  };

  const importar = async () => {
    if (!preview) return;
    try {
      setEstado("importando");
      setMensaje("Guardando en la base local...");

      await clearAllBibleData();
      await importParsedBibleData(preview.parsed.versiculos, preview.notasParsed.notas);

      await setMeta("importDone", true);
      await setMeta("importFecha", Date.now());
      await setMeta("importStats", {
        libros: preview.librosDetectados.length,
        capitulos: preview.totalCapitulos,
        versiculos: preview.totalVersiculos,
        notas: preview.totalNotas,
      });
      setYa(true);
      setEstado("listo");
      setMensaje("Importación completada.");
      toast.success("Biblia importada correctamente");
    } catch (e) {
      console.error(e);
      setEstado("error");
      setMensaje("Ocurrió un error al importar.");
    }
  };

  const limpiar = async () => {
    if (!window.confirm("¿Eliminar la Biblia y las notas importadas?")) return;
    await clearAllBibleData();
    setYa(false);
    setPreview(null);
    setMensaje("Datos eliminados.");
    toast.success("Importación limpiada");
  };

  const busy = estado === "descargando" || estado === "analizando" || estado === "importando";

  return (
    <BibliaLayout title="Importar Biblia">
      <div className="mb-5 rounded-[2rem] border border-[#D4AF37]/25 bg-[#111111] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.45)]">
        <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
          Fuente
        </div>
        <h2 className="font-display mb-1 text-2xl text-[#F8F5EA]">Biblia Straubinger</h2>
        <p className="text-sm leading-relaxed text-[#C9C3B3]">
          Archivos: <code className="text-[#F2D27A]">toda-la-biblia.txt</code>,{" "}
          <code className="text-[#F2D27A]">todos-los-comentarios.txt</code>,{" "}
          <code className="text-[#F2D27A]">lista-libros.txt</code>.
        </p>
        <div className="mt-4 inline-flex rounded-full border border-[#D4AF37]/20 bg-[#0B0B0B] px-3 py-1.5 text-xs text-[#C9C3B3]">
          Lista de libros:{" "}
          <a className="ml-1 text-[#F2D27A] underline" href={listaUrl} target="_blank" rel="noreferrer">
            ver
          </a>
        </div>
      </div>

      {mensaje && (
        <div
          className={`mb-4 flex items-start gap-2 rounded-2xl border bg-[#111111] px-4 py-3 text-sm ${
            estado === "error"
              ? "border-red-500/40 text-red-300"
              : "border-[#D4AF37]/25 text-[#C9C3B3]"
          }`}
        >
          {busy ? (
            <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-[#D4AF37]" />
          ) : estado === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 text-red-400" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#D4AF37]" />
          )}
          <span>{mensaje}</span>
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <button
          disabled={busy}
          onClick={analizar}
          className="flex items-center justify-center gap-2 rounded-2xl border border-[#D4AF37]/25 bg-[#111111] px-4 py-3 text-[#F8F5EA] transition hover:border-[#F2D27A]/60 hover:bg-[#D4AF37]/10 disabled:opacity-50"
        >
          <Play className="h-4 w-4 text-[#D4AF37]" />
          <span className="text-sm font-medium">Vista previa</span>
        </button>
        <button
          disabled={!preview || busy}
          onClick={importar}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] px-4 py-3 font-semibold text-[#070707] shadow-[0_14px_30px_rgba(212,175,55,0.25)] disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Importar Biblia
        </button>
      </div>

      {preview && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Libros" value={preview.librosDetectados.length} />
          <StatCard label="Capítulos" value={preview.totalCapitulos} />
          <StatCard label="Versículos" value={preview.totalVersiculos} />
          <StatCard label="Notas" value={preview.totalNotas} />
        </div>
      )}

      {preview && (
        <div className="mb-6 rounded-2xl border border-[#D4AF37]/25 bg-[#111111] p-4">
          <div className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]">
            Libros detectados
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {preview.librosDetectados.map((id) => {
              const l = libroById(id);
              return (
                <span
                  key={id}
                  className="rounded-full border border-[#D4AF37]/25 bg-[#0B0B0B] px-2 py-0.5 text-[#C9C3B3]"
                >
                  {l?.nombre ?? `#${id}`} ({preview.parsed.capitulosPorLibro[id] ?? 0})
                </span>
              );
            })}
          </div>
        </div>
      )}

      {ya && (
        <button
          onClick={limpiar}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-[#111111] px-4 py-3 text-red-300 transition hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Limpiar importación
        </button>
      )}

      <p className="mt-6 text-center text-[11px] text-[#C9C3B3]/60">
        Los datos se guardan en tu dispositivo (IndexedDB). Sin conexión a servidor.
      </p>
    </BibliaLayout>
  );
}

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#111111] p-3 text-center shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
    <div className="font-display text-2xl text-[#F2D27A]">{value.toLocaleString("es")}</div>
    <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#C9C3B3]/70">
      {label}
    </div>
  </div>
);
