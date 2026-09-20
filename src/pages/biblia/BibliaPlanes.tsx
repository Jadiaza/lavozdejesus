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

  const current = plans.find(
    (plan) => progress[plan.id] && !progress[plan.id].completado,
  );

  const featured = current ?? plans[0] ?? null;

  const otherPlans = useMemo(
    () => (featured ? plans.filter((plan) => plan.id !== featured.id) : plans),
    [featured, plans],
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
    <BibliaLayout title="Planes" hideHeader>
      <section className="relative overflow-hidden pb-4 pt-3">
        <div className="pointer-events-none absolute -right-8 top-1 opacity-[0.12]">
          <BookOpen className="h-32 w-32 text-[#D4AF37]" strokeWidth={0.8} />
        </div>

        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#F5D86B,#D4AF37)] text-black shadow-[0_10px_30px_rgba(212,175,55,0.24)]">
            <BookOpen className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              La Voz de Jesús
            </p>
            <h1 className="mt-0.5 font-display text-[32px] leading-none text-[#F8F5EA]">
              Planes
            </h1>
          </div>
        </div>

        <p className="relative mt-3 max-w-[92%] text-[14px] leading-6 text-[#C7C0B1]">
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
        <section className="mb-5 rounded-[1.35rem] border border-[#D4AF37]/45 bg-[#0A0A09] p-3.5 shadow-[0_14px_38px_rgba(0,0,0,0.34)]">
          <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF37] text-black">
              <BookOpenCheck className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.23em] text-[#D4AF37]">
                Continúa tu camino
              </p>
              <h2 className="mt-1 line-clamp-2 font-display text-[18px] leading-[1.08] text-[#F8F5EA]">
                {current.titulo}
              </h2>
              <p className="mt-1 text-[11px] text-[#B9B1A2]">
                Jornada {progress[current.id].dia_actual} de {current.duracion_dias}
              </p>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-[1fr_auto] items-center gap-3">
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

          <Link
            to={`/biblia/planes/${current.id}/jornada/${progress[current.id].dia_actual}`}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-1 rounded-xl bg-[#D4AF37] px-4 text-sm font-extrabold text-black"
          >
            CONTINUAR
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      ) : null}

      {!loading && !error && featured ? (
        <>
          <section className="mb-6">
            <h2 className="mb-3 font-display text-[24px] leading-none text-[#F8F5EA]">
              Plan destacado
            </h2>

            <Link
              to={`/biblia/planes/${featured.id}`}
              className="group block overflow-hidden rounded-[1.35rem] border border-[#D4AF37]/20 bg-[#0B0B0B] shadow-[0_14px_36px_rgba(0,0,0,0.28)]"
            >
              <BiblePlanCover
                src={featured.imagen_url}
                alt={featured.titulo}
                className="aspect-[16/7] w-full"
                fallbackClassName="aspect-[16/7] w-full"
                iconClassName="h-11 w-11"
                fit="stretch"
              />

              <div className="p-3.5">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#D4AF37]">
                  {featured.categoria || "Plan"} · {featured.duracion_dias} jornadas
                </div>

                <div className="mt-2 flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[20px] leading-[1.08] text-[#F8F5EA]">
                      {featured.titulo}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-5 text-[#AAA396]">
                      {featured.descripcion}
                    </p>
                  </div>

                  <span className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-[#D4AF37]/65 px-3 text-[11px] font-semibold text-[#EBC95C]">
                    Ver plan
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </section>

          <section>
            <div className="mb-3">
              <h2 className="font-display text-[24px] leading-none text-[#F8F5EA]">
                Explora otros planes
              </h2>
              <p className="mt-1.5 max-w-[92%] text-[12px] leading-5 text-[#AAA396]">
                Encuentra un camino más corto o enfocado en una necesidad espiritual concreta.
              </p>
            </div>

            <div className="space-y-2.5">
              {otherPlans.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/biblia/planes/${plan.id}`}
                  className="group grid min-h-[78px] grid-cols-[76px_minmax(0,1fr)_22px] items-center gap-3 rounded-[1.15rem] border border-[#D4AF37]/14 bg-[#11110F] p-2 shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition hover:border-[#D4AF37]/35"
                >
                  <BiblePlanCover
                    src={plan.imagen_url}
                    alt={plan.titulo}
                    className="h-[62px] w-[76px] rounded-xl"
                    fallbackClassName="h-[62px] w-[76px] rounded-xl"
                    iconClassName="h-7 w-7"
                    fit="stretch"
                  />

                  <div className="min-w-0">
                    <p className="text-[10.5px] text-[#A8A094]">
                      {plan.duracion_dias} jornadas
                    </p>
                    <h3 className="mt-0.5 font-display text-[18px] leading-[1.06] text-[#F8F5EA]">
                      {plan.titulo}
                    </h3>
                    <p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.12em] text-[#B69539]">
                      {plan.categoria || "Plan"}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 shrink-0 text-[#D4AF37] transition group-hover:translate-x-0.5" />
                </Link>
              ))}

              {!otherPlans.length ? (
                <div className="rounded-[1.25rem] border border-[#D4AF37]/15 bg-[#0B0B0B] p-7 text-center">
                  <Sparkles className="mx-auto h-7 w-7 text-[#D4AF37]" />
                  <p className="mt-3 text-sm text-[#AAA396]">
                    Próximamente encontrarás nuevos planes en esta sección.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </BibliaLayout>
  );
}
