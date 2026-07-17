import { ArrowLeft, Filter, List, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/lvdj/BottomNav";
import { PrayerCard } from "@/components/lvdj/capilla/PrayerCard";
import { getPeticiones, PrayerCategory, PrayerPetition } from "@/services/sheetsService";

const PAGE_SIZE = 50;
const CATEGORY_OPTIONS: { value: "" | PrayerCategory; label: string }[] = [
  { value: "", label: "Todas las categorías" },
  { value: "peticion", label: "Petición" },
  { value: "accion_gracias", label: "Acción de gracias" },
  { value: "enfermos", label: "Enfermos" },
  { value: "familia", label: "Familia" },
  { value: "difuntos", label: "Difuntos" },
  { value: "vocaciones", label: "Vocaciones" },
  { value: "sacerdotes", label: "Sacerdotes" },
  { value: "trabajo", label: "Trabajo" },
  { value: "paz", label: "Paz" },
  { value: "otra", label: "Otra" },
];

const Intenciones = () => {
  const navigate = useNavigate();
  const [prayers, setPrayers] = useState<PrayerPetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<"" | PrayerCategory>("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setPrayers([]);
    setHasMore(true);

    getPeticiones(PAGE_SIZE, 0, category || undefined)
      .then((rows) => {
        if (!active) return;
        setPrayers(rows);
        setHasMore(rows.length === PAGE_SIZE);
      })
      .catch(() => {
        if (active) setError("No fue posible cargar las intenciones en este momento.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [category]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError("");

    try {
      const additional = await getPeticiones(PAGE_SIZE, prayers.length, category || undefined);
      setPrayers((current) => [
        ...current,
        ...additional.filter((item) => !current.some((currentItem) => currentItem.id === item.id)),
      ]);
      setHasMore(additional.length === PAGE_SIZE);
    } catch {
      setError("No fue posible cargar más intenciones en este momento.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="lvj-sacred-page">
      <div className="lvj-sacred-backdrop" />
      <header className="relative z-20 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="lvj-sacred-panel mx-auto flex max-w-[430px] items-center gap-3 p-2.5">
          <button
            type="button"
            onClick={() => navigate("/capilla")}
            className="lvj-sacred-icon-button h-11 w-11 shrink-0"
            aria-label="Regresar a la Capilla"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-semibold leading-tight text-foreground min-[390px]:text-2xl">
              Intenciones de oración
            </h1>
            <p className="mt-0.5 text-[11px] font-medium text-gold/90">
              Unidos como comunidad ante Jesús
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-28">
        <div className="mx-auto max-w-[430px]">
          <div className="lvj-sacred-card mb-4 grid grid-cols-2 gap-2 p-1.5" aria-label="Filtros de intenciones">
            <button
              type="button"
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gold/35 bg-gold/10 px-3 text-xs font-semibold text-gold"
              aria-pressed="true"
            >
              <List className="h-4 w-4" />
              Todas
            </button>
            <button
              type="button"
              disabled
              title="Disponible cuando inicies sesión"
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 text-xs font-semibold text-foreground/45"
            >
              <LockKeyhole className="h-4 w-4" />
              Mis intenciones
            </button>
          </div>

          <p className="mb-4 text-center text-[11px] leading-relaxed text-foreground/50">
            “Mis intenciones” estará disponible al habilitar el registro de usuarios.
          </p>

          <label className="lvj-sacred-field mb-4 flex min-h-11 items-center gap-2 rounded-xl px-3">
            <Filter className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">Filtrar por tipo de intención</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as "" | PrayerCategory)}
              className="h-11 min-w-0 flex-1 bg-transparent text-xs font-semibold text-gold outline-none"
              aria-label="Filtrar por tipo de intención"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value || "todas"} value={option.value} className="bg-[#0b0b0a] text-foreground">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2.5">
            {loading ? <p className="py-8 text-center text-sm text-foreground/60">Cargando intenciones...</p> : null}
            {error ? <p className="py-4 text-center text-sm text-foreground/60">{error}</p> : null}
            {!loading && !error && prayers.length === 0 ? (
              <p className="py-8 text-center text-sm text-foreground/60">Aún no hay intenciones publicadas.</p>
            ) : null}
            {prayers.map((item) => <PrayerCard key={item.id} item={item} />)}
            {!loading && hasMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="lvj-sacred-button-secondary w-full disabled:cursor-wait disabled:opacity-60"
              >
                {loadingMore ? "Cargando intenciones..." : "Cargar más intenciones"}
              </button>
            ) : null}
          </div>
        </div>
      </main>

      <BottomNav activeLabel="Capilla" />
    </div>
  );
};

export default Intenciones;
