import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, Loader2 } from "lucide-react";
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

export function BibliaReferenciaContenido({
  referencia,
  storageKey,
  onProgressChange,
}: {
  referencia: string;
  storageKey?: string;
  onProgressChange?: (completed: number, total: number) => void;
}) {
  const [books, setBooks] = useState<BibliaLibro[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const references = useMemo(() => splitReferences(referencia), [referencia]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getBibliaCatalogo(VERSION)
      .then((catalog) => { if (active) setBooks(catalog.libros); })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "No fue posible consultar la Biblia.");
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!books.length) return;
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
        if (!active) return;
        setPassages(items);
        setActiveIndex(0);
        if (storageKey) {
          try {
            const raw = window.localStorage.getItem(storageKey);
            const saved = raw ? JSON.parse(raw) : null;
            const restored = Array.isArray(saved?.completed)
              ? saved.completed.filter((value: unknown) => Number.isInteger(value) && Number(value) >= 0 && Number(value) < items.length)
              : [];
            setCompleted(restored);
            if (Number.isInteger(saved?.activeIndex) && saved.activeIndex >= 0 && saved.activeIndex < items.length) {
              setActiveIndex(saved.activeIndex);
            }
          } catch {
            setCompleted([]);
          }
        }
      })
      .catch((cause) => {
        if (active) {
          setPassages([]);
          setError(cause instanceof Error ? cause.message : "No fue posible consultar la Biblia.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [books, references, storageKey]);

  useEffect(() => {
    if (!passages.length) return;
    onProgressChange?.(completed.length, passages.length);
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ completed, activeIndex }));
    } catch {
      // La lectura no debe bloquearse si el almacenamiento local no está disponible.
    }
  }, [activeIndex, completed, onProgressChange, passages.length, storageKey]);

  const markCurrentAndContinue = () => {
    if (!passages.length) return;
    setCompleted((current) => current.includes(activeIndex) ? current : [...current, activeIndex].sort((a, b) => a - b));
    if (activeIndex < passages.length - 1) {
      const nextIndex = activeIndex + 1;
      setActiveIndex(nextIndex);
      window.requestAnimationFrame(() => {
        document.getElementById("plan-reading-" + nextIndex)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const shortLabel = (passage: Passage) => {
    const abbreviation = passage.libro.abreviatura?.replace(/\.$/, "") || passage.libro.nombre.slice(0, 3);
    return abbreviation + " " + passage.capitulo;
  };

  if (loading) {
    return <div className="flex min-h-36 items-center justify-center" role="status"><Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" /></div>;
  }

  if (error) {
    return <div className="rounded-2xl border border-red-500/25 bg-red-950/20 p-4 text-sm leading-relaxed text-red-200">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {passages.map((passage, index) => {
          const isActive = activeIndex === index;
          const done = completed.includes(index);
          return (
            <button
              key={"chip-" + passage.referencia + "-" + index}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                window.requestAnimationFrame(() => {
                  document.getElementById("plan-reading-" + index)?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
              className={"shrink-0 rounded-full border px-4 py-1.5 font-display text-[15px] transition " + (
                isActive
                  ? "border-[#E7C35D] bg-[linear-gradient(135deg,#F2D27A,#D4AF37)] text-[#0A0906] shadow-[0_6px_20px_rgba(212,175,55,0.2)]"
                  : done
                    ? "border-[#D4AF37]/35 bg-[#15130D] text-[#E7C35D]"
                    : "border-white/20 bg-[#0A0A09] text-[#E7E2D6]"
              )}
            >
              {shortLabel(passage)}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {passages.map((passage, index) => {
          const isActive = activeIndex === index;
          const done = completed.includes(index);
          return (
            <section
              id={"plan-reading-" + index}
              key={passage.referencia + "-" + index}
              className={
                isActive
                  ? "scroll-mt-24"
                  : "scroll-mt-24 overflow-hidden rounded-[1.05rem] border border-white/10 bg-[#090909] transition"
              }
              style={
                isActive
                  ? {
                      border: "0",
                      borderRadius: 0,
                      boxShadow: "none",
                      background: "transparent",
                      overflow: "visible",
                    }
                  : undefined
              }
            >
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={"flex w-full items-center gap-3 text-left " + (
                  isActive
                    ? "px-0 pb-2.5 pt-1"
                    : "px-3.5 py-2.5"
                )}
                aria-expanded={isActive}
              >
                <span className={"flex h-8 w-8 shrink-0 items-center justify-center " + (
                  isActive
                    ? "text-[#E7C35D]"
                    : done
                      ? "rounded-md border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] text-[#E7C35D]"
                      : "rounded-md border border-white/10 bg-white/[0.02] text-[#9E9A91]"
                )}>
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[1.22rem] leading-none text-[#F8F5EA]">{passage.referencia}</span>
                  <span className="mt-1 block text-[8.5px] font-medium tracking-[0.06em] text-[#9F998F]">Biblia Platense · Straubinger</span>
                </span>
                {isActive ? <ChevronUp className="h-5 w-5 shrink-0 text-[#E7C35D]" /> : <ChevronDown className="h-5 w-5 shrink-0 text-[#8F8A80]" />}
              </button>

              {isActive ? (
                <div className="pb-2 pt-3">
                  <div className="space-y-2.5 px-0.5">
                    {passage.versiculos.map((verse) => (
                      <p key={verse.id} className="font-display text-[17.5px] leading-[1.58] text-[#E8E2D7]">
                        <sup className="mr-1 align-super font-sans text-[9.5px] font-bold text-[#D4AF37]">{verse.versiculo}</sup>
                        {verse.texto}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-[#D4AF37]/14 pt-2.5">
                    <button type="button" onClick={markCurrentAndContinue} className="flex min-h-10 w-full items-center justify-between px-0.5 font-semibold text-[#E7C35D] transition active:scale-[0.99]">
                      <span>{done ? "Continuar lectura" : "Marcar leído y continuar"}</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
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