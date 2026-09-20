import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
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

  return (
    <BibliaLayout title="Planes">
      <section className="pb-4 pt-1">
        <p className="max-w-xl text-[15px] leading-7 text-[#BEB7A7]">
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
        <section className="mb-5 overflow-hidden rounded-[1.45rem] border border-[#D4AF37]/45 bg-[radial-gradient(circle_at_100%_0%,rgba(212,175,55,0.16),transparent_34%),linear-gradient(145deg,#0D0D0B,#080808)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-black shadow-[0_10px_28px_rgba(212,175,55,0.18)]">
              <BookOpenCheck className="h-6 w-6" />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                Continúa tu camino
              </p>

              <h2 className="mt-1 font-display text-[21px] leading-[1.08] text-[#F8F5EA]">
                {current.titulo}
              </h2>

              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-[#BEB7A7]">
                  Jornada {progress[current.id].dia_actual} de {current.duracion_dias}
                </p>
                <span className="text-xs font-semibold text-[#D4AF37]">
                  {Math.min(
                    100,
                    Math.round(
                      (Math.max(0, progress[current.id].dia_actual - 1) /
                        Math.max(1, current.duracion_dias)) *
                        100,
                    ),
                  )}
                  %
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#D4AF37]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (Math.max(0, progress[current.id].dia_actual - 1) /
                          Math.max(1, current.duracion_dias)) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Link
            to={`/biblia/planes/${current.id}/jornada/${progress[current.id].dia_actual}`}
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#D4AF37] px-4 text-sm font-bold text-black shadow-[0_10px_26px_rgba(212,175,55,0.16)]"
          >
            CONTINUAR
            <ChevronRight className="h-4 w-4" />
          </Link>
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
            <div className="h-px flex-1 bg-gradient-to-r from-[#D4AF37]/45 to-transparent" />
            <span className="shrink-0 text-[10px] font-medium text-[#A39C8F]">
              {visible.length} {visible.length === 1 ? "plan" : "planes"}
            </span>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              const featured = index === 0 && visible.length > 1;

              return (
                <Link
                  key={plan.id}
                  to={`/biblia/planes/${plan.id}`}
                  className={`group overflow-hidden rounded-[1.35rem] border border-[#D4AF37]/25 bg-[#0B0B0B] shadow-[0_18px_48px_rgba(0,0,0,0.3)] transition hover:border-[#D4AF37]/50 ${featured ? "sm:col-span-2" : ""}`}
                >
                  <BiblePlanCover
                    src={plan.imagen_url}
                    alt={plan.titulo}
                    className={featured ? "aspect-[4/3] w-full sm:aspect-[16/6]" : "aspect-[4/3] w-full"}
                    fallbackClassName={featured ? "aspect-[4/3] w-full sm:aspect-[16/6]" : "aspect-[4/3] w-full"}
                    iconClassName="h-10 w-10"
                  />

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-[#D4AF37]">
                          <span>{plan.categoria || "Plan"}</span>
                          <span className="text-[#777166]">•</span>
                          <span>{plan.duracion_dias} jornadas</span>
                        </div>

                        <h3 className="mt-2 font-display text-[21px] leading-[1.08] text-[#F8F5EA]">
                          {plan.titulo}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[#AAA396]">
                          {plan.descripcion}
                        </p>
                      </div>

                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#D4AF37] transition group-hover:translate-x-0.5" />
                    </div>

                    {saved ? (
                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-[9px] font-medium uppercase tracking-[0.12em] text-[#8F897C]">
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
              <div className="rounded-2xl border border-[#D4AF37]/15 bg-[#0B0B0B] p-8 text-center sm:col-span-2">
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
