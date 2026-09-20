import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { BiblePlanCover } from "@/features/biblia/components/BiblePlanCover";
import { BibliaLayout } from "./BibliaLayout";
import {
  listBiblePlans,
  resolvePlanProgress,
  type BiblePlan,
  type BiblePlanProgress,
} from "@/services/biblePlansService";

export default function BibliaPlanes() {
  const [plans, setPlans] = useState<BiblePlan[]>([]);
  const [progress, setProgress] = useState<Record<number, BiblePlanProgress>>({});
  const [category, setCategory] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void listBiblePlans()
      .then(async (rows) => {
        if (!active) return;

        setPlans(rows);

        const entries = await Promise.all(
          rows.map(async (plan) => [plan.id, await resolvePlanProgress(plan.id)] as const),
        );

        if (!active) return;

        setProgress(
          Object.fromEntries(
            entries.filter(
              (entry): entry is readonly [number, BiblePlanProgress] => Boolean(entry[1]),
            ),
          ),
        );
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "No fue posible cargar los planes.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [
      "Todos",
      ...Array.from(
        new Set(plans.map((plan) => plan.categoria).filter(Boolean)),
      ),
    ],
    [plans],
  );

  const visible =
    category === "Todos"
      ? plans
      : plans.filter((plan) => plan.categoria === category);

  const current = plans.find(
    (plan) => progress[plan.id] && !progress[plan.id].completado,
  );

  const currentPercent = current
    ? Math.min(
        100,
        Math.round(
          (Math.max(0, progress[current.id].dia_actual - 1) /
            Math.max(1, current.duracion_dias)) *
            100,
        ),
      )
    : 0;

  return (
    <BibliaLayout title="Planes">
      <section className="relative overflow-hidden pb-5 pt-1">
        <div className="pointer-events-none absolute -right-5 -top-8 opacity-20">
          <BookOpen className="h-28 w-28 text-[#D4AF37]" strokeWidth={0.9} />
        </div>
        <p className="relative max-w-[85%] text-[15px] leading-7 text-[#C7C0B1]">
          Caminos para encontrarte con Dios, crecer en su Palabra y dejar que transforme tu vida.
        </p>
      </section>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-950/20 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {!loading && !error && current ? (
        <section className="mb-5 overflow-hidden rounded-[1.45rem] border border-[#D4AF37]/55 bg-[radial-gradient(circle_at_92%_5%,rgba(212,175,55,0.18),transparent_32%),linear-gradient(145deg,#0E0E0B,#080808)] p-4 shadow-[0_20px_58px_rgba(0,0,0,0.45)]">
          <div className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37] text-black shadow-[0_10px_28px_rgba(212,175,55,0.2)]">
              <BookOpenCheck className="h-6 w-6" />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                Continúa tu camino
              </p>
              <h2 className="mt-1 font-display text-[18px] leading-tight text-[#F8F5EA]">
                {current.titulo}
              </h2>
              <p className="mt-1 text-[11px] text-[#BEB7A7]">
                Jornada {progress[current.id].dia_actual} de {current.duracion_dias}
              </p>
            </div>

            <Link
              to={`/biblia/planes/${current.id}/jornada/${progress[current.id].dia_actual}`}
              className="flex min-h-10 items-center justify-center gap-1 rounded-xl bg-[#D4AF37] px-3 text-[11px] font-extrabold text-black shadow-[0_10px_26px_rgba(212,175,55,0.16)]"
            >
              CONTINUAR
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#D4AF37]"
                style={{ width: `${currentPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-[#D4AF37]">
              {currentPercent}%
            </span>
          </div>
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                  category === item
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                    : "border-[#D4AF37]/25 bg-[#090909] text-[#D8D1C3]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mb-3 flex items-center gap-3">
            <h2 className="shrink-0 text-[11px] font-bold uppercase tracking-[0.24em] text-[#F8F5EA]">
              Explorar planes
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/55 to-transparent" />
            {category !== "Todos" ? (
              <button
                type="button"
                onClick={() => setCategory("Todos")}
                className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-[#D8D1C3]"
              >
                Ver todos
                <ChevronRight className="h-3.5 w-3.5 text-[#D4AF37]" />
              </button>
            ) : (
              <span className="shrink-0 text-[10px] font-medium text-[#A39C8F]">
                {visible.length} {visible.length === 1 ? "plan" : "planes"}
              </span>
            )}
          </div>

          <section className="grid grid-cols-6 gap-3">
            {visible.map((plan, index) => {
              const saved = progress[plan.id];
              const pct = saved
                ? Math.min(
                    100,
                    Math.round(
                      (Math.max(0, saved.dia_actual - 1) /
                        Math.max(1, plan.duracion_dias)) *
                        100,
                    ),
                  )
                : 0;

              const layoutClass =
                index === 0
                  ? "col-span-4"
                  : index === 1
                    ? "col-span-2"
                    : "col-span-3";

              const compact = index === 1;
              const imageClass = compact
                ? "aspect-[4/5] w-full"
                : index === 0
                  ? "aspect-[16/7] w-full"
                  : "aspect-[16/8] w-full";

              return (
                <Link
                  key={plan.id}
                  to={`/biblia/planes/${plan.id}`}
                  className={`group ${layoutClass} overflow-hidden rounded-[1.25rem] border border-[#D4AF37]/28 bg-[#0B0B0B] shadow-[0_18px_48px_rgba(0,0,0,0.3)] transition hover:border-[#D4AF37]/55`}
                >
                  <BiblePlanCover
                    src={plan.imagen_url}
                    alt={plan.titulo}
                    className={imageClass}
                    fallbackClassName={imageClass}
                    iconClassName={compact ? "h-8 w-8" : "h-10 w-10"}
                    fit="stretch"
                  />

                  <div className={compact ? "p-3" : "p-4"}>
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div
                          className={`flex flex-wrap items-center gap-1.5 font-bold uppercase text-[#D4AF37] ${
                            compact
                              ? "text-[7px] tracking-[0.12em]"
                              : "text-[9px] tracking-[0.16em]"
                          }`}
                        >
                          <span>{plan.categoria || "Plan"}</span>
                          {!compact ? <span className="text-[#777166]">•</span> : null}
                          <span>{plan.duracion_dias} jornadas</span>
                        </div>

                        <h3
                          className={`mt-2 font-display leading-[1.08] text-[#F8F5EA] ${
                            compact ? "text-[16px]" : "text-[20px]"
                          }`}
                        >
                          {plan.titulo}
                        </h3>

                        {!compact ? (
                          <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[#AAA396]">
                            {plan.descripcion}
                          </p>
                        ) : null}
                      </div>

                      <ChevronRight
                        className={`${
                          compact ? "h-4 w-4" : "h-5 w-5"
                        } mt-0.5 shrink-0 text-[#D4AF37] transition group-hover:translate-x-0.5`}
                      />
                    </div>

                    {saved ? (
                      <div className={compact ? "mt-3" : "mt-4"}>
                        <div className="mb-1 flex justify-between text-[8px] font-medium uppercase tracking-[0.1em] text-[#8F897C]">
                          <span>
                            {saved.completado
                              ? "Completado"
                              : `Jornada ${saved.dia_actual}`}
                          </span>
                          <span>{saved.completado ? 100 : pct}%</span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-[#D4AF37]"
                            style={{ width: `${saved.completado ? 100 : pct}%` }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}

            {!visible.length ? (
              <div className="col-span-6 rounded-2xl border border-[#D4AF37]/15 bg-[#0B0B0B] p-8 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-[#D4AF37]" />
                <p className="mt-3 text-sm text-[#AAA396]">
                  Aún no hay planes publicados en esta categoría.
                </p>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </BibliaLayout>
  );
}
