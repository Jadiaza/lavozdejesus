import { useEffect, useState } from "react";
import { getPeticiones, PrayerPetition } from "@/services/sheetsService";
import { PrayerCard } from "./PrayerCard";
import { PRAYER_CREATED_EVENT } from "./PrayerForm";

export const PrayerWall = () => {
  const [prayers, setPrayers] = useState<PrayerPetition[]>([]);
  const [pending, setPending] = useState<PrayerPetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPeticiones(10).then((rows) => {
      if (active) {
        setPrayers(rows);
        setHasMore(rows.length === 10);
      }
    }).catch(() => {
      if (active) setError("No fue posible cargar las intenciones en este momento.");
    }).finally(() => active && setLoading(false));

    const onCreated = (event: Event) => {
      const petition = (event as CustomEvent<PrayerPetition>).detail;
      setPending((current) => [petition, ...current.filter((item) => item.id !== petition.id)]);
    };
    window.addEventListener(PRAYER_CREATED_EVENT, onCreated);
    return () => {
      active = false;
      window.removeEventListener(PRAYER_CREATED_EVENT, onCreated);
    };
  }, []);

  const handleViewAll = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError("");
    try {
      const additional = await getPeticiones(50, prayers.length);
      setPrayers((current) => [
        ...current,
        ...additional.filter((item) => !current.some((currentItem) => currentItem.id === item.id)),
      ]);
      setHasMore(additional.length === 50);
    } catch {
      setError("No fue posible cargar las demás intenciones en este momento.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="px-4 pb-28 pt-4">
      <div className="mx-auto max-w-[430px] space-y-2.5">
        {pending.map((item) => <PrayerCard key={`pending-${item.id}`} item={item} pending />)}
        {loading ? <p className="py-4 text-center text-sm text-foreground/60">Cargando intenciones...</p> : null}
        {error ? <p className="py-4 text-center text-sm text-foreground/60">{error}</p> : null}
        {!loading && !error && prayers.length === 0 ? <p className="py-4 text-center text-sm text-foreground/60">Aún no hay intenciones publicadas.</p> : null}
        {prayers.map((item) => <PrayerCard key={item.id} item={item} />)}
        <button
          type="button"
          onClick={handleViewAll}
          disabled={loadingMore}
          className="flex min-h-11 w-full items-center justify-center rounded-xl border border-gold/25 bg-gold/[0.04] px-4 py-2 text-xs font-semibold text-gold transition hover:bg-gold/10 disabled:cursor-wait disabled:opacity-60"
        >
          {loadingMore ? "Cargando intenciones..." : "Ver todas las intenciones"}
        </button>
      </div>
    </section>
  );
};
