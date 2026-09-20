import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BookOpen, Check, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { BiblePlanCover } from "@/features/biblia/components/BiblePlanCover";
import { BibliaLayout } from "./BibliaLayout";
import {
  getBiblePlan,
  resolvePlanProgress,
  savePlanProgress,
  type BiblePlanDetail,
  type BiblePlanProgress,
} from "@/services/biblePlansService";

export default function BibliaPlanDetalle() {
  const { planId } = useParams();
  const id = Number(planId);
  const navigate = useNavigate();
  const [detail, setDetail] = useState<BiblePlanDetail | null>(null);
  const [progress, setProgress] = useState<BiblePlanProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!Number.isInteger(id) || id < 1) {
      setError("El plan solicitado no es válido.");
      setLoading(false);
      return;
    }

    void Promise.all([getBiblePlan(id), resolvePlanProgress(id)])
      .then(([data, saved]) => {
        if (active) {
          setDetail(data);
          setProgress(saved);
        }
      })
      .catch((reason) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "No fue posible cargar el plan.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const begin = async () => {
    if (!detail) return;
    const day = progress?.dia_actual ?? 1;
    if (!progress) await savePlanProgress(detail.plan.id, 1, false);
    navigate(`/biblia/planes/${detail.plan.id}/jornada/${day}`);
  };

  if (loading) {
    return (
      <BibliaLayout title="Planes">
        <div className="flex min-h-72 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" />
        </div>
      </BibliaLayout>
    );
  }

  if (error || !detail) {
    return (
      <BibliaLayout title="Planes">
        <div className="rounded-2xl border border-red-500/25 bg-red-950/20 p-4 text-sm text-red-200">
          {error || "Plan no disponible."}
        </div>
      </BibliaLayout>
    );
  }

  const { plan, dias } = detail;
  const percentage = progress?.completado
    ? 100
    : progress
      ? Math.min(
          100,
          Math.round((Math.max(0, progress.dia_actual - 1) / Math.max(1, plan.duracion_dias)) * 100),
        )
      : 0;

  return (
    <BibliaLayout title="Planes">
      <section className="overflow-hidden rounded-[1.75rem] border border-[#D4AF37]/25 bg-[#0B0B0B] shadow-[0_22px_70px_rgba(0,0,0,0.42)]">
        <BiblePlanCover
          src={plan.imagen_url}
          alt={plan.titulo}
          className="h-56 w-full"
          fallbackClassName="h-44 w-full"
          iconClassName="h-16 w-16"
        />

        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
            {plan.categoria || "Plan"} · {plan.duracion_dias} jornadas
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-[#F8F5EA]">
            {plan.titulo}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#BEB7A7]">{plan.descripcion}</p>

          {progress ? (
            <div className="mt-5 rounded-2xl border border-[#D4AF37]/15 bg-black/25 p-4">
              <div className="flex justify-between text-xs text-[#C9C3B3]">
                <span>
                  {progress.completado
                    ? "Camino completado"
                    : `Jornada ${progress.dia_actual} de ${plan.duracion_dias}`}
                </span>
                <strong className="text-[#D4AF37]">{percentage}%</strong>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#D4AF37]"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={begin}
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-[#D4AF37] px-4 text-sm font-bold text-black"
          >
            {progress?.completado
              ? "VOLVER AL PLAN"
              : progress
                ? "CONTINUAR CAMINO"
                : "COMENZAR PLAN"}
          </button>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#D4AF37]" />
          <h2 className="font-display text-xl text-[#F8F5EA]">Jornadas</h2>
        </div>

        <div className="space-y-2">
          {dias.map((day) => {
            const reached = Boolean(
              progress && (progress.completado || day.dia < progress.dia_actual),
            );
            const current = Boolean(
              progress && !progress.completado && day.dia === progress.dia_actual,
            );

            return (
              <Link
                key={day.id}
                to={`/biblia/planes/${plan.id}/jornada/${day.dia}`}
                className={`flex min-h-16 items-center gap-3 rounded-2xl border p-3.5 transition ${
                  current
                    ? "border-[#D4AF37]/55 bg-[#D4AF37]/10"
                    : "border-[#D4AF37]/15 bg-[#0B0B0B]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    reached
                      ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                      : "border-[#D4AF37]/25 text-[#D4AF37]"
                  }`}
                >
                  {reached ? <Check className="h-4 w-4" /> : day.dia}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#8F897C]">
                    Jornada {day.dia}
                  </p>
                  <h3 className="truncate text-sm font-semibold text-[#F8F5EA]">
                    {day.titulo}
                  </h3>
                  {day.lectura ? (
                    <p className="mt-0.5 truncate text-xs text-[#D4AF37]/80">
                      {day.lectura}
                    </p>
                  ) : null}
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#8F897C]" />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#D4AF37]/15 bg-[#0B0B0B] p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
        <p className="text-xs leading-relaxed text-[#918A7E]">
          Puedes volver a cualquier jornada. El avance general siempre conservará el punto más adelantado alcanzado.
        </p>
      </div>
    </BibliaLayout>
  );
}
