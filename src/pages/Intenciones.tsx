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
<<<<<<< HEAD
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_50%_8%,rgba(196,145,36,0.11),transparent_27%),radial-gradient(circle_at_15%_55%,rgba(18,69,92,0.14),transparent_32%),linear-gradient(180deg,#030b13_0%,#06131e_48%,#02070d_100%)] text-foreground">
      <header className="relative z-20 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-[430px] items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#07111c]/55 p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => navigate("/capilla")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-black/15 text-foreground/90 transition hover:border-gold/60 hover:text-gold active:scale-95"
=======
    <div className="lvj-sacred-page">
      <div className="lvj-sacred-backdrop" />
      <header className="relative z-20 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="lvj-sacred-panel mx-auto flex max-w-[430px] items-center gap-3 p-2.5">
          <button
            type="button"
            onClick={() => navigate("/capilla")}
            className="lvj-sacred-icon-button h-11 w-11 shrink-0"
>>>>>>> d4c07cf (Biblia estudio)
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
<<<<<<< HEAD
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1.5" aria-label="Filtros de intenciones">
=======
          <div className="lvj-sacred-card mb-4 grid grid-cols-2 gap-2 p-1.5" aria-label="Filtros de intenciones">
>>>>>>> d4c07cf (Biblia estudio)
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

<<<<<<< HEAD
          <label className="mb-4 flex min-h-11 items-center gap-2 rounded-xl border border-gold/20 bg-gold/[0.04] px-3 text-gold">
=======
          <label className="lvj-sacred-field mb-4 flex min-h-11 items-center gap-2 rounded-xl px-3">
>>>>>>> d4c07cf (Biblia estudio)
            <Filter className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">Filtrar por tipo de intención</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as "" | PrayerCategory)}
              className="h-11 min-w-0 flex-1 bg-transparent text-xs font-semibold text-gold outline-none"
              aria-label="Filtrar por tipo de intención"
            >
              {CATEGORY_OPTIONS.map((option) => (
<<<<<<< HEAD
                <option key={option.value || "todas"} value={option.value} className="bg-[#07111c] text-foreground">
=======
                <option key={option.value || "todas"} value={option.value} className="bg-[#0b0b0a] text-foreground">
>>>>>>> d4c07cf (Biblia estudio)
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
<<<<<<< HEAD
                className="flex min-h-11 w-full items-center justify-center rounded-xl border border-gold/25 bg-gold/[0.04] px-4 py-2 text-xs font-semibold text-gold transition hover:bg-gold/10 disabled:cursor-wait disabled:opacity-60"
=======
                className="lvj-sacred-button-secondary w-full disabled:cursor-wait disabled:opacity-60"
>>>>>>> d4c07cf (Biblia estudio)
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
