import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Columns3,
  Heart,
  ListTree,
  Loader2,
  Search,
  Sparkles,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { toggleFavorito } from "@/features/biblia/db";
import {
  normalizarReferencia,
  resolverReferenciaBiblica,
  sugerirLibrosBiblicos,
} from "@/features/biblia/referenceSearch";
import {
  buscarBiblia,
  getBibliaCapitulo,
  getBibliaCatalogo,
  getBibliaConcordancia,
  getBibliaTemas,
  type BibliaConcordanciaResponse,
  type BibliaLibro,
  type BibliaSearchResponse,
  type BibliaSearchResult,
  type BibliaTema,
  type BibliaTemasResponse,
} from "@/services/bibliaService";
import { BibliaLayout } from "./BibliaLayout";

type SearchTab = "texto" | "referencia" | "temas" | "concordancia";
type RecentSearch = { tab: Exclude<SearchTab, "temas">; query: string };

const VERSION = "SPAPLATENSE";
const HISTORY_KEY = "lvj_biblia_busquedas";
const PAGE_SIZE = 20;

const tabs: Array<{ id: SearchTab; label: string; icon: typeof Search }> = [
  { id: "texto", label: "Texto bíblico", icon: Search },
  { id: "referencia", label: "Referencia", icon: BookOpen },
  { id: "temas", label: "Temas", icon: Tags },
  { id: "concordancia", label: "Concordancia", icon: ListTree },
];

function loadHistory(): RecentSearch[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentSearch =>
          !!item &&
          typeof item === "object" &&
          typeof (item as RecentSearch).query === "string" &&
          ["texto", "referencia", "concordancia"].includes((item as RecentSearch).tab),
      )
      .slice(0, 8);
  } catch {
    return [];
  }
}

function saveHistory(items: RecentSearch[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 8)));
  } catch {
    // El historial es una mejora local y no debe bloquear el buscador.
  }
}

export default function BibliaBuscar() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SearchTab>("texto");
  const [history, setHistory] = useState<RecentSearch[]>(() => loadHistory());
  const [books, setBooks] = useState<BibliaLibro[]>([]);
  const [catalogError, setCatalogError] = useState("");

  const [textQuery, setTextQuery] = useState("");
  const [searchedText, setSearchedText] = useState("");
  const [textData, setTextData] = useState<BibliaSearchResponse | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState("");

  const [referenceQuery, setReferenceQuery] = useState("");
  const [referenceError, setReferenceError] = useState("");
  const [referenceLoading, setReferenceLoading] = useState(false);

  const [themeFilter, setThemeFilter] = useState("");
  const [themeCatalog, setThemeCatalog] = useState<BibliaTema[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [themeData, setThemeData] = useState<BibliaTemasResponse | null>(null);
  const [themeLoading, setThemeLoading] = useState(false);
  const [themeError, setThemeError] = useState("");
  const [themesLoaded, setThemesLoaded] = useState(false);

  const [concordanceQuery, setConcordanceQuery] = useState("");
  const [searchedConcordance, setSearchedConcordance] = useState("");
  const [concordanceData, setConcordanceData] =
    useState<BibliaConcordanciaResponse | null>(null);
  const [concordanceLoading, setConcordanceLoading] = useState(false);
  const [concordanceError, setConcordanceError] = useState("");

  useEffect(() => {
    let active = true;
    getBibliaCatalogo(VERSION)
      .then((catalog) => {
        if (!active) return;
        setBooks(catalog.libros);
        setCatalogError("");
      })
      .catch((cause: Error) => {
        if (active) setCatalogError(cause.message);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "temas" || themesLoaded || themeLoading) return;
    let active = true;
    setThemeLoading(true);
    setThemeError("");
    getBibliaTemas("", "", 1, PAGE_SIZE, VERSION)
      .then((data) => {
        if (!active) return;
        setThemeCatalog(data.temas);
        setThemesLoaded(true);
      })
      .catch((cause: Error) => active && setThemeError(cause.message))
      .finally(() => active && setThemeLoading(false));
    return () => {
      active = false;
    };
  }, [activeTab, themeLoading, themesLoaded]);

  const addHistory = (tab: RecentSearch["tab"], query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setHistory((current) => {
      const next = [
        { tab, query: clean },
        ...current.filter(
          (item) =>
            !(item.tab === tab && item.query.toLocaleLowerCase("es") === clean.toLocaleLowerCase("es")),
        ),
      ].slice(0, 8);
      saveHistory(next);
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const executeTextSearch = async (page = 1, append = false) => {
    const query = page === 1 ? textQuery.trim() : searchedText;
    if (query.length < 2) {
      setTextError("Escribe al menos dos caracteres para buscar.");
      return;
    }

    setTextLoading(true);
    setTextError("");
    try {
      const data = await buscarBiblia(query, page, PAGE_SIZE, VERSION);
      setSearchedText(query);
      setTextData((current) =>
        append && current
          ? { ...data, resultados: [...current.resultados, ...data.resultados] }
          : data,
      );
      if (page === 1) addHistory("texto", query);
    } catch (cause) {
      setTextError(cause instanceof Error ? cause.message : "No fue posible consultar la Biblia.");
    } finally {
      setTextLoading(false);
    }
  };

  const submitText = (event: FormEvent) => {
    event.preventDefault();
    void executeTextSearch();
  };

  const referenceSuggestions = useMemo(
    () => sugerirLibrosBiblicos(referenceQuery, books),
    [referenceQuery, books],
  );

  const submitReference = async (event: FormEvent) => {
    event.preventDefault();
    setReferenceError("");

    const resolved = resolverReferenciaBiblica(referenceQuery, books);
    if (!resolved.ok) {
      setReferenceError(resolved.message);
      return;
    }

    setReferenceLoading(true);
    try {
      const { libro, capitulo, versiculoInicio, versiculoFin } = resolved.data;
      if (versiculoInicio !== undefined) {
        const chapter = await getBibliaCapitulo(libro.codigo, capitulo, VERSION);
        const available = new Set(chapter.versiculos.map((item) => item.versiculo));
        const end = versiculoFin ?? versiculoInicio;
        for (let verse = versiculoInicio; verse <= end; verse += 1) {
          if (!available.has(verse)) {
            setReferenceError(
              `${libro.nombre} ${capitulo} no contiene el versículo ${verse}.`,
            );
            return;
          }
        }
      }

      addHistory("referencia", referenceQuery);
      const verseParam =
        versiculoInicio !== undefined ? `&versiculo=${versiculoInicio}` : "";
      navigate(
        `/biblia/leer?libro=${encodeURIComponent(libro.codigo)}&cap=${capitulo}${verseParam}`,
      );
    } catch (cause) {
      setReferenceError(
        cause instanceof Error ? cause.message : "No fue posible validar la referencia.",
      );
    } finally {
      setReferenceLoading(false);
    }
  };

  const filteredThemes = useMemo(() => {
    const normalized = normalizarReferencia(themeFilter);
    if (!normalized) return themeCatalog;
    return themeCatalog.filter((item) =>
      normalizarReferencia(`${item.categoria} ${item.tema}`).includes(normalized),
    );
  }, [themeCatalog, themeFilter]);

  const executeTheme = async (theme: string, page = 1, append = false) => {
    setThemeLoading(true);
    setThemeError("");
    try {
      const data = await getBibliaTemas("", theme, page, PAGE_SIZE, VERSION);
      setSelectedTheme(theme);
      if (data.temas.length > 0) setThemeCatalog(data.temas);
      setThemeData((current) =>
        append && current
          ? { ...data, resultados: [...current.resultados, ...data.resultados] }
          : data,
      );
    } catch (cause) {
      setThemeError(cause instanceof Error ? cause.message : "No fue posible consultar los temas.");
    } finally {
      setThemeLoading(false);
    }
  };

  const executeConcordance = async (
    page = 1,
    append = false,
    bookCode = concordanceData?.filtro_libro ?? "",
  ) => {
    const query = page === 1 && !append ? concordanceQuery.trim() : searchedConcordance;
    if (query.length < 2) {
      setConcordanceError("Escribe al menos dos caracteres para consultar la concordancia.");
      return;
    }

    setConcordanceLoading(true);
    setConcordanceError("");
    try {
      const data = await getBibliaConcordancia(
        query,
        page,
        PAGE_SIZE,
        bookCode,
        VERSION,
      );
      setSearchedConcordance(query);
      setConcordanceData((current) =>
        append && current
          ? { ...data, resultados: [...current.resultados, ...data.resultados] }
          : data,
      );
      if (page === 1 && !bookCode) addHistory("concordancia", query);
    } catch (cause) {
      setConcordanceError(
        cause instanceof Error ? cause.message : "No fue posible consultar la concordancia.",
      );
    } finally {
      setConcordanceLoading(false);
    }
  };

  const submitConcordance = (event: FormEvent) => {
    event.preventDefault();
    void executeConcordance(1, false, "");
  };

  const useRecent = (item: RecentSearch) => {
    setActiveTab(item.tab);
    if (item.tab === "texto") setTextQuery(item.query);
    if (item.tab === "referencia") setReferenceQuery(item.query);
    if (item.tab === "concordancia") setConcordanceQuery(item.query);
  };

  return (
    <BibliaLayout title="Buscar">
      <section className="mb-3 rounded-[1.4rem] border border-[#D4AF37]/20 bg-[#0B0B0B]/95 p-4 shadow-[0_18px_52px_rgba(0,0,0,0.36)]">
        <p className="text-sm font-semibold text-[#F2D27A]">Buscar en la Palabra de Dios</p>
        <p className="mt-1 text-xs text-[#9E9789]">Biblia Platense / Straubinger</p>

        <div
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="tablist"
          aria-label="Tipos de búsqueda bíblica"
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`biblia-search-panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-[11px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#F2D27A] ${
                  selected
                    ? "border-[#D4AF37] bg-[#D4AF37] text-[#050505]"
                    : "border-[#D4AF37]/25 bg-[#090909] text-[#C9C3B3]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === "texto" && (
        <section id="biblia-search-panel-texto" role="tabpanel">
          <SearchBox
            value={textQuery}
            onChange={setTextQuery}
            onSubmit={submitText}
            placeholder="Palabra o frase: misericordia, no temas…"
            loading={textLoading}
          />
          <Message text={textError} error />
          {!textData && !textLoading && !textError && (
            <InitialState
              message="Busca una palabra o frase dentro del texto de la Biblia."
              history={history}
              onUse={useRecent}
              onClear={clearHistory}
              tab="texto"
            />
          )}
          {textData && !textLoading && textData.total === 0 && (
            <EmptyState query={searchedText} />
          )}
          {textData && textData.total > 0 && (
            <ResultsSection
              title={`${textData.total} coincidencia${textData.total === 1 ? "" : "s"}`}
              results={textData.resultados}
              highlight={searchedText}
            >
              {textData.has_more && (
                <LoadMore
                  loading={textLoading}
                  onClick={() => void executeTextSearch(textData.page + 1, true)}
                />
              )}
            </ResultsSection>
          )}
        </section>
      )}

      {activeTab === "referencia" && (
        <section id="biblia-search-panel-referencia" role="tabpanel">
          <SearchBox
            value={referenceQuery}
            onChange={(value) => {
              setReferenceQuery(value);
              setReferenceError("");
            }}
            onSubmit={submitReference}
            placeholder="Ej.: Jn 3,16 · Sal 23 · 1 Cor 13,1-13"
            loading={referenceLoading}
          />
          <Message text={referenceError || catalogError} error />
          {referenceQuery.trim() && referenceSuggestions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2" aria-label="Sugerencias de libros">
              {referenceSuggestions.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setReferenceQuery(`${book.nombre} `)}
                  className="rounded-full border border-[#D4AF37]/25 bg-[#0B0B0B] px-3 py-1.5 text-xs text-[#D7D0C0] transition hover:border-[#D4AF37]/60"
                >
                  {book.nombre} · {book.abreviatura}
                </button>
              ))}
            </div>
          )}
          {!referenceQuery && (
            <InitialState
              message="Escribe una referencia con nombre o abreviatura del libro. Acepta coma, dos puntos y rangos."
              history={history}
              onUse={useRecent}
              onClear={clearHistory}
              tab="referencia"
            />
          )}
        </section>
      )}

      {activeTab === "temas" && (
        <section id="biblia-search-panel-temas" role="tabpanel">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4AF37]" />
            <input
              type="search"
              value={themeFilter}
              onChange={(event) => setThemeFilter(event.target.value)}
              placeholder="Buscar un tema disponible…"
              aria-label="Buscar tema bíblico"
              className="h-12 w-full rounded-2xl border border-[#D4AF37]/30 bg-[#090909] pl-11 pr-10 text-sm text-[#F8F5EA] outline-none placeholder:text-[#756F64] focus:border-[#D4AF37]"
            />
            {themeFilter && (
              <button
                type="button"
                onClick={() => setThemeFilter("")}
                aria-label="Limpiar filtro de temas"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9789]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Message text={themeError} error />
          {themeLoading && !themeData && <Loading />}
          {!themeLoading && themesLoaded && themeCatalog.length === 0 && (
            <div className="rounded-2xl border border-[#D4AF37]/18 bg-[#0B0B0B] p-5 text-sm leading-relaxed text-[#C9C3B3]">
              Aún no hay clasificación temática disponible en los datos editoriales de la Biblia.
            </div>
          )}
          {themeCatalog.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8F897C]">
                Temas disponibles
              </p>
              <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">
                {filteredThemes.map((item) => (
                  <button
                    key={`${item.categoria}:${item.tema}`}
                    type="button"
                    onClick={() => void executeTheme(item.tema)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      selectedTheme === item.tema
                        ? "border-[#D4AF37] bg-[#D4AF37]/16"
                        : "border-[#D4AF37]/20 bg-[#090909]"
                    }`}
                  >
                    <span className="block text-xs font-semibold text-[#F2D27A]">{item.tema}</span>
                    <span className="mt-0.5 block text-[9px] text-[#8F897C]">
                      {item.categoria} · {item.total}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {themeLoading && themeData && <Loading />}
          {themeData && selectedTheme && themeData.total === 0 && !themeLoading && (
            <EmptyState query={selectedTheme} />
          )}
          {themeData && themeData.total > 0 && (
            <ResultsSection
              title={`${selectedTheme} · ${themeData.total} pasaje${themeData.total === 1 ? "" : "s"}`}
              results={themeData.resultados}
            >
              {themeData.has_more && (
                <LoadMore
                  loading={themeLoading}
                  onClick={() => void executeTheme(selectedTheme, themeData.page + 1, true)}
                />
              )}
            </ResultsSection>
          )}
        </section>
      )}

      {activeTab === "concordancia" && (
        <section id="biblia-search-panel-concordancia" role="tabpanel">
          <SearchBox
            value={concordanceQuery}
            onChange={setConcordanceQuery}
            onSubmit={submitConcordance}
            placeholder="Palabra o expresión para concordancia…"
            loading={concordanceLoading}
          />
          <Message text={concordanceError} error />
          {!concordanceData && !concordanceLoading && !concordanceError && (
            <InitialState
              message="Consulta dónde aparece una palabra y cómo se distribuye por testamento y libro."
              history={history}
              onUse={useRecent}
              onClear={clearHistory}
              tab="concordancia"
            />
          )}
          {concordanceData && !concordanceLoading && concordanceData.total === 0 && (
            <EmptyState query={searchedConcordance} />
          )}
          {concordanceData && concordanceData.total > 0 && (
            <>
              <div className="mb-4 rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
                      {searchedConcordance}
                    </div>
                    <div className="mt-1 font-display text-2xl text-[#F8F5EA]">
                      {concordanceData.total} coincidencias
                    </div>
                  </div>
                  {concordanceData.filtro_libro && (
                    <button
                      type="button"
                      onClick={() => void executeConcordance(1, false, "")}
                      className="text-xs font-semibold text-[#F2D27A]"
                    >
                      Ver todos
                    </button>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Stat label="Antiguo Testamento" value={concordanceData.testamentos.AT ?? 0} />
                  <Stat label="Nuevo Testamento" value={concordanceData.testamentos.NT ?? 0} />
                </div>
                <div className="mt-4 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                  {concordanceData.libros.map((book) => (
                    <button
                      key={book.libro_codigo}
                      type="button"
                      onClick={() => void executeConcordance(1, false, book.libro_codigo)}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        concordanceData.filtro_libro === book.libro_codigo
                          ? "border-[#D4AF37] bg-[#D4AF37] text-[#050505]"
                          : "border-[#D4AF37]/20 bg-[#080808] text-[#C9C3B3]"
                      }`}
                    >
                      {book.libro_nombre} · {book.total}
                    </button>
                  ))}
                </div>
              </div>
              <ResultsSection
                title={
                  concordanceData.filtro_libro
                    ? `${concordanceData.total_filtrado} en ${
                        concordanceData.libros.find(
                          (book) => book.libro_codigo === concordanceData.filtro_libro,
                        )?.libro_nombre ?? concordanceData.filtro_libro
                      }`
                    : "Pasajes"
                }
                results={concordanceData.resultados}
                highlight={searchedConcordance}
              >
                {concordanceData.has_more && (
                  <LoadMore
                    loading={concordanceLoading}
                    onClick={() =>
                      void executeConcordance(
                        concordanceData.page + 1,
                        true,
                        concordanceData.filtro_libro,
                      )
                    }
                  />
                )}
              </ResultsSection>
            </>
          )}
        </section>
      )}
    </BibliaLayout>
  );
}

function SearchBox({
  value,
  onChange,
  onSubmit,
  placeholder,
  loading,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  placeholder: string;
  loading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="mb-4 flex gap-2">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{placeholder}</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#D4AF37]" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-[#D4AF37]/30 bg-[#090909] pl-12 pr-10 text-sm text-[#F8F5EA] outline-none placeholder:text-[#756F64] focus:border-[#D4AF37]"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E9789]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </label>
      <button
        type="submit"
        disabled={loading}
        className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-[#D4AF37] px-4 font-bold text-[#050505] outline-none focus-visible:ring-2 focus-visible:ring-[#F8F5EA] disabled:opacity-50"
        aria-label="Buscar"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
      </button>
    </form>
  );
}

function ResultsSection({
  title,
  results,
  highlight,
  children,
}: {
  title: string;
  results: BibliaSearchResult[];
  highlight?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-[#C9C3B3]">{title}</div>
      <div className="space-y-3">
        {results.map((result) => (
          <ResultCard key={result.id} result={result} highlight={highlight} />
        ))}
      </div>
      {children}
    </div>
  );
}

function ResultCard({
  result,
  highlight,
}: {
  result: BibliaSearchResult;
  highlight?: string;
}) {
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const active = await toggleFavorito(
        result.libro_id,
        result.capitulo,
        result.versiculo,
        {
          libroCodigo: result.libro_codigo,
          libroNombre: result.libro_nombre,
          texto: result.texto,
          version: VERSION,
        },
      );
      toast.success(active ? "Guardado en favoritos" : "Quitado de favoritos");
    } catch {
      toast.error("No fue posible actualizar favoritos.");
    } finally {
      setSaving(false);
    }
  };

  const reader = `/biblia/leer?libro=${encodeURIComponent(result.libro_codigo)}&cap=${
    result.capitulo
  }&versiculo=${result.versiculo}`;
  const compare = `/biblia/comparar?libro=${encodeURIComponent(result.libro_codigo)}&cap=${
    result.capitulo
  }`;
  const study = `/biblia/estudio?libro=${encodeURIComponent(result.libro_codigo)}&cap=${
    result.capitulo
  }&versiculo_inicio=${result.versiculo}&versiculo_fin=${result.versiculo}`;

  return (
    <article className="rounded-2xl border border-[#D4AF37]/18 bg-[#0B0B0B] p-4">
      <div className="text-xs font-bold uppercase tracking-[0.11em] text-[#F2D27A]">
        {result.referencia}
      </div>
      <p className="mt-2 font-serif text-[0.98rem] leading-7 text-[#F8F5EA]/92">
        <HighlightedText text={result.texto} query={highlight ?? ""} />
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#D4AF37]/10 pt-3 sm:grid-cols-4">
        <ActionLink to={reader} icon={<BookOpen className="h-3.5 w-3.5" />} label="Leer contexto" />
        <ActionLink to={compare} icon={<Columns3 className="h-3.5 w-3.5" />} label="Comparar" />
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/20 bg-[#090909] px-2 text-[10px] font-semibold text-[#D4AF37] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Heart className="h-3.5 w-3.5" />}
          Guardar
        </button>
        <ActionLink to={study} icon={<Sparkles className="h-3.5 w-3.5" />} label="Estudiar" />
      </div>
    </article>
  );
}

function ActionLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/20 bg-[#090909] px-2 text-[10px] font-semibold text-[#D4AF37]"
    >
      {icon}
      {label}
    </Link>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const needle = normalizeForHighlight(query);
  if (!needle) return <>{text}</>;

  const { normalized, map } = buildNormalizedMap(text);
  const nodes: ReactNode[] = [];
  let normalizedCursor = 0;
  let originalCursor = 0;
  let key = 0;

  while (normalizedCursor < normalized.length) {
    const found = normalized.indexOf(needle, normalizedCursor);
    if (found < 0) break;

    const start = map[found] ?? originalCursor;
    const lastMapped = map[Math.min(found + needle.length - 1, map.length - 1)] ?? start;
    const end = Math.min(text.length, lastMapped + 1);

    if (start > originalCursor) nodes.push(text.slice(originalCursor, start));
    nodes.push(
      <mark key={`match-${key++}`} className="rounded bg-[#D4AF37]/25 px-0.5 text-[#F8F5EA]">
        {text.slice(start, end)}
      </mark>,
    );

    originalCursor = end;
    normalizedCursor = found + needle.length;
  }

  if (originalCursor === 0) return <>{text}</>;
  if (originalCursor < text.length) nodes.push(text.slice(originalCursor));
  return <>{nodes}</>;
}

function normalizeForHighlight(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function buildNormalizedMap(value: string) {
  let normalized = "";
  const map: number[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const part = normalizeForHighlight(value[index]);
    for (const character of part) {
      normalized += character;
      map.push(index);
    }
  }
  return { normalized, map };
}

function InitialState({
  message,
  history,
  onUse,
  onClear,
  tab,
}: {
  message: string;
  history: RecentSearch[];
  onUse: (item: RecentSearch) => void;
  onClear: () => void;
  tab: RecentSearch["tab"];
}) {
  const items = history.filter((item) => item.tab === tab);
  return (
    <div className="rounded-2xl border border-[#D4AF37]/18 bg-[#0B0B0B] p-5">
      <p className="text-sm leading-relaxed text-[#C9C3B3]">{message}</p>
      {items.length > 0 && (
        <div className="mt-5 border-t border-[#D4AF37]/10 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8F897C]">
              Búsquedas recientes
            </span>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 text-[10px] text-[#A39C8F]"
            >
              <Trash2 className="h-3 w-3" />
              Borrar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <button
                key={`${item.tab}:${item.query}`}
                type="button"
                onClick={() => onUse(item)}
                className="rounded-full border border-[#D4AF37]/20 bg-[#090909] px-3 py-1.5 text-xs text-[#D7D0C0]"
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/18 bg-[#0B0B0B] p-5 text-sm text-[#C9C3B3]">
      No encontramos coincidencias para «{query}».
    </div>
  );
}

function Message({ text, error = false }: { text: string; error?: boolean }) {
  if (!text) return null;
  return (
    <div
      className={`mb-4 rounded-xl border p-3 text-sm ${
        error
          ? "border-red-500/25 bg-red-950/20 text-red-200"
          : "border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[#C9C3B3]"
      }`}
    >
      {text}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-8" role="status" aria-label="Cargando resultados">
      <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
    </div>
  );
}

function LoadMore({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/8 text-sm font-semibold text-[#F2D27A] disabled:opacity-50"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Cargar más
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#D4AF37]/15 bg-[#080808] p-3">
      <div className="text-[9px] uppercase tracking-[0.12em] text-[#8F897C]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-[#F8F5EA]">{value}</div>
    </div>
  );
}
