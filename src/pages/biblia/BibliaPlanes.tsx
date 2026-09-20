import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  Loader2,
  Shield,
  Sparkles,
} from "lucide-react";
import { BibliaLayout } from "./BibliaLayout";
import {
  getLocalPlanProgress,
  listBiblePlans,
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
          rows.map(async (plan) => [plan.id, await getLocalPlanProgress(plan.id)] as const),
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
          setError(reason instanceof Error ? reason.message : "No fue posible cargar los planes.");
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
    () => ["Todos", ...Array.from(new Set(plans.map((plan) => plan.categoria).filter(Boolean)))],
    [plans],
  );
  const visible = category === "Todos" ? plans : plans.filter((plan) => plan.categoria === category);
  const current = plans.find((plan) => progress[plan.id] && !progress[plan.id].completado);

  return (
    <BibliaLayout title="Planes">
      <section className="pb-3 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
          La Voz de Jesús
        </p>
        <h1 className="mt-1 font-display text-3xl text-[#F8F5EA]">Planes</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#BEB7A7]">
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
        <section className="mb-5 overflow-hidden rounded-[1.75rem] border border-[#D4AF37]/30 bg-[radial-gradient(circle_at_90%_0%,rgba(212,175,55,0.2),transparent_36%),#0B0B0B] p-5 shadow-[0_22px_65px_rgba(0,0,0,0.42)]">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-black">
              <BookOpenCheck className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                Continúa tu camino
              </p>
              <h2 className="mt-1 font-display text-xl leading-tight text-[#F8F5EA]">
                {current.titulo}
              </h2>
              <p className="mt-2 text-xs text-[#BEB7A7]">
                Jornada {progress[current.id].dia_actual} de {current.duracion_dias}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#D4AF37]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (progress[current.id].dia_actual / current.duracion_dias) * 100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <Link
            to={`/biblia/planes/${current.id}/jornada/${progress[current.id].dia_actual}`}
            className="mt-4 flex min-h-12 items-center justify-center rounded-xl bg-[#D4AF37] px-4 text-sm font-bold text-black"
          >
            CONTINUAR
          </Link>
        </section>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                  category === item
                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                    : "border-[#D4AF37]/20 bg-[#0C0C0C] text-[#C9C3B3]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <section className="space-y-3">
            {visible.map((plan) => {
              const saved = progress[plan.id];
              const pct = saved
                ? Math.min(
                    100,
                    Math.round((saved.dia_actual / Math.max(1, plan.duracion_dias)) * 100),
                  )
                : 0;

              return (
                <Link
                  key={plan.id}
                  to={`/biblia/planes/${plan.id}`}
                  className="group block overflow-hidden rounded-[1.5rem] border border-[#D4AF37]/20 bg-[#0B0B0B] shadow-[0_18px_48px_rgba(0,0,0,0.3)] transition hover:border-[#D4AF37]/45"
                >
                  {plan.imagen_url ? (
                    <img src={plan.imagen_url} alt="" className="h-36 w-full object-cover" />
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2),transparent_58%),linear-gradient(135deg,#16120A,#050505)]">
                      <Shield className="h-10 w-10 text-[#D4AF37]" strokeWidth={1.4} />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
                          <span>{plan.categoria || "Plan"}</span>
                          <span className="text-[#777166]">•</span>
                          <span>{plan.duracion_dias} jornadas</span>
                        </div>
                        <h2 className="mt-1 font-display text-xl leading-tight text-[#F8F5EA]">
                          {plan.titulo}
                        </h2>
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#AAA396]">
                          {plan.descripcion}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#D4AF37] transition group-hover:translate-x-0.5" />
                    </div>

                    {saved ? (
                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-[#8F897C]">
                          <span>{saved.completado ? "Completado" : `Jornada ${saved.dia_actual}`}</span>
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
              <div className="rounded-2xl border border-[#D4AF37]/15 bg-[#0B0B0B] p-8 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-[#D4AF37]" />
                <p className="mt-3 text-sm text-[#AAA396]">
                  Aún no hay planes publicados en esta categoría.
                </p>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#D4AF37]/15 bg-[#0B0B0B] p-4 text-xs leading-relaxed text-[#918A7E]">
        <CalendarDays className="h-4 w-4 shrink-0 text-[#D4AF37]" />
        Tu avance se conserva en este dispositivo. Cuando inicies sesión también podrá sincronizarse con tu cuenta LVJPRAYER.
      </div>
    </BibliaLayout>
  );
}
