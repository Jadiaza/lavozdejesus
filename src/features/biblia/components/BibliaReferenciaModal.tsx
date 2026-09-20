import { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  resolverReferenciaBiblica,
  type BibliaReferenciaResuelta,
} from "@/features/biblia/referenceSearch";
import {
  getBibliaCapitulo,
  getBibliaCatalogo,
  type BibliaLibro,
  type BibliaVersiculo,
} from "@/services/bibliaService";

const VERSION = "SPAPLATENSE";

interface Passage {
  referencia: string;
  libro: BibliaLibro;
  capitulo: number;
  versiculos: BibliaVersiculo[];
}

function splitReferences(value: string) {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function loadResolvedPassage(
  resolved: BibliaReferenciaResuelta,
): Promise<Passage> {
  const chapter = await getBibliaCapitulo(
    resolved.libro.codigo,
    resolved.capitulo,
    VERSION,
  );

  const start = resolved.versiculoInicio;
  const end = resolved.versiculoFin ?? start;
  const verses =
    start === undefined
      ? chapter.versiculos
      : chapter.versiculos.filter(
          (verse) => verse.versiculo >= start && verse.versiculo <= (end ?? start),
        );

  if (!verses.length) {
    throw new Error(`No encontramos ${resolved.referencia} en la Biblia disponible.`);
  }

  return {
    referencia: resolved.referencia,
    libro: resolved.libro,
    capitulo: resolved.capitulo,
    versiculos: verses,
  };
}

export function BibliaReferenciaModal({
  referencia,
  className = "",
}: {
  referencia: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [books, setBooks] = useState<BibliaLibro[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const references = useMemo(() => splitReferences(referencia), [referencia]);

  useEffect(() => {
    if (!open || books.length > 0) return;

    let active = true;
    setLoading(true);
    setError("");

    getBibliaCatalogo(VERSION)
      .then((catalog) => {
        if (active) setBooks(catalog.libros);
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "No fue posible consultar la Biblia.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, books.length]);

  useEffect(() => {
    if (!open || !books.length) return;

    let active = true;
    setLoading(true);
    setError("");

    const resolved = references.map((item) => resolverReferenciaBiblica(item, books));
    const invalid = resolved.find((item) => !item.ok);

    if (invalid && !invalid.ok) {
      setPassages([]);
      setError(invalid.message);
      setLoading(false);
      return;
    }

    Promise.all(
      resolved.map((item) => {
        if (!item.ok) throw new Error(item.message);
        return loadResolvedPassage(item.data);
      }),
    )
      .then((items) => {
        if (active) setPassages(items);
      })
      .catch((cause) => {
        if (active) {
          setPassages([]);
          setError(
            cause instanceof Error
              ? cause.message
              : "No fue posible consultar la Biblia.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, books, references]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-left font-display text-xl text-[#F8F5EA] underline decoration-[#D4AF37]/70 decoration-1 underline-offset-4 transition hover:text-[#F2D27A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70 ${className}`}
        aria-label={`Consultar ${referencia} en la Biblia`}
      >
        <span>{referencia}</span>
        <BookOpen className="h-4 w-4 shrink-0 text-[#D4AF37]" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[82vh] w-[calc(100%-1.5rem)] max-w-xl overflow-hidden rounded-[1.4rem] border-[#D4AF37]/35 bg-[#090909] p-0 text-[#F8F5EA] shadow-[0_28px_90px_rgba(0,0,0,0.72)]">
          <DialogHeader className="border-b border-[#D4AF37]/15 px-5 pb-4 pt-5 pr-12 text-left">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <BookOpen className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Palabra de Dios
              </span>
            </div>
            <DialogTitle className="font-display text-2xl leading-tight text-[#F8F5EA]">
              {referencia}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#8F897C]">
              Biblia Platense / Straubinger · LVJPRAYER
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto px-5 py-5">
            {loading ? (
              <div className="flex min-h-40 items-center justify-center" role="status">
                <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/25 bg-red-950/20 p-4 text-sm leading-relaxed text-red-200">
                {error}
              </div>
            ) : (
              <div className="space-y-6">
                {passages.map((passage) => (
                  <section key={passage.referencia}>
                    {passages.length > 1 ? (
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
                        {passage.referencia}
                      </h3>
                    ) : null}
                    <div className="space-y-3">
                      {passage.versiculos.map((verse) => (
                        <p key={verse.id} className="text-[16px] leading-7 text-[#E6E0D4]">
                          <sup className="mr-1.5 text-[10px] font-bold text-[#D4AF37]">
                            {verse.versiculo}
                          </sup>
                          {verse.texto}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
