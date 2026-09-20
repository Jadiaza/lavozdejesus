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

interface ExpandedReference extends BibliaReferenciaResuelta {
  hastaFinalCapitulo?: boolean;
}

type ExpandedReferenceResult =
  | { ok: true; data: ExpandedReference[] }
  | { ok: false; message: string };

function splitReferences(value: string) {
  return value
    .split(/[;·]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function expandReference(
  input: string,
  books: BibliaLibro[],
): ExpandedReferenceResult {
  const normalizedDashes = input.replace(/[–—]/g, "-");

  const crossChapter = normalizedDashes.match(
    /^(.+?)\s+(\d{1,3})\s*[:,]\s*(\d{1,3})\s*-\s*(\d{1,3})\s*[:,]\s*(\d{1,3})$/,
  );

  if (crossChapter) {
    const [, bookPart, startChapterRaw, startVerseRaw, endChapterRaw, endVerseRaw] =
      crossChapter;
    const startChapter = Number(startChapterRaw);
    const startVerse = Number(startVerseRaw);
    const endChapter = Number(endChapterRaw);
    const endVerse = Number(endVerseRaw);

    const startResolved = resolverReferenciaBiblica(
      `${bookPart} ${startChapter}`,
      books,
    );
    if (!startResolved.ok) return startResolved;
    const endResolved = resolverReferenciaBiblica(
      `${bookPart} ${endChapter}`,
      books,
    );
    if (!endResolved.ok) return endResolved;

    if (
      startResolved.data.libro.codigo !== endResolved.data.libro.codigo ||
      endChapter < startChapter ||
      startVerse < 1 ||
      endVerse < 1
    ) {
      return { ok: false, message: "El rango bíblico no es válido." };
    }

    const data: ExpandedReference[] = [];
    for (let chapter = startChapter; chapter <= endChapter; chapter += 1) {
      data.push({
        libro: startResolved.data.libro,
        capitulo: chapter,
        versiculoInicio: chapter === startChapter ? startVerse : undefined,
        versiculoFin: chapter === endChapter ? endVerse : undefined,
        hastaFinalCapitulo: chapter === startChapter && chapter !== endChapter,
        referencia: `${startResolved.data.libro.nombre} ${chapter}`,
      });
    }
    return { ok: true, data };
  }

  const chapterRange = normalizedDashes.match(
    /^(.+?)\s+(\d{1,3})\s*-\s*(\d{1,3})$/,
  );

  if (chapterRange) {
    const [, bookPart, startRaw, endRaw] = chapterRange;
    const startChapter = Number(startRaw);
    const endChapter = Number(endRaw);
    const startResolved = resolverReferenciaBiblica(
      `${bookPart} ${startChapter}`,
      books,
    );

    if (!startResolved.ok) return startResolved;
    if (
      endChapter < startChapter ||
      endChapter > startResolved.data.libro.capitulos
    ) {
      return {
        ok: false,
        message: `${startResolved.data.libro.nombre} no tiene ese rango de capítulos.`,
      };
    }

    return {
      ok: true,
      data: Array.from(
        { length: endChapter - startChapter + 1 },
        (_, index) => {
          const chapter = startChapter + index;
          return {
            libro: startResolved.data.libro,
            capitulo: chapter,
            referencia: `${startResolved.data.libro.nombre} ${chapter}`,
          };
        },
      ),
    };
  }

  const resolved = resolverReferenciaBiblica(normalizedDashes, books);
  return resolved.ok
    ? { ok: true, data: [resolved.data] }
    : resolved;
}

async function loadResolvedPassage(
  resolved: ExpandedReference,
): Promise<Passage> {
  const chapter = await getBibliaCapitulo(
    resolved.libro.codigo,
    resolved.capitulo,
    VERSION,
  );

  const start = resolved.versiculoInicio;
  const end = resolved.hastaFinalCapitulo
    ? Number.POSITIVE_INFINITY
    : resolved.versiculoFin ?? start;
  const verses =
    start === undefined
      ? resolved.versiculoFin === undefined
        ? chapter.versiculos
        : chapter.versiculos.filter(
            (verse) => verse.versiculo <= resolved.versiculoFin!,
          )
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

    const resolved = references.map((item) => expandReference(item, books));
    const invalid = resolved.find((item) => !item.ok);

    if (invalid && !invalid.ok) {
      setPassages([]);
      setError(invalid.message);
      setLoading(false);
      return;
    }

    const expanded = resolved.flatMap((item) => (item.ok ? item.data : []));

    Promise.all(expanded.map((item) => loadResolvedPassage(item)))
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
                {passages.map((passage, index) => (
                  <section key={`${passage.referencia}-${index}`}>
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