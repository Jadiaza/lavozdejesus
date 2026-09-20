import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader2,
  MessageCircleQuestion,
  ShieldCheck,
} from "lucide-react";
import { BibliaLayout } from "./BibliaLayout";
import {
  getBiblePlanDay,
  resolvePlanProgress,
  savePlanProgress,
  type BiblePlanJourney,
} from "@/services/biblePlansService";

const sectionLabels = new Set([
  "REFLEXIÓN",
  "PREGUNTAS PARA MEDITAR",
  "COMPROMISO DEL DÍA",
]);

function SpiritualText({ text }: { text: string }) {
  const blocks = text
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) =>
        sectionLabels.has(block) ? (
          <h3
            key={`${block}-${index}`}
            className="pt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]"
          >
            {block}
          </h3>
        ) : (
          <p
            key={index}
            className="whitespace-pre-line text-[15px] leading-7 text-[#DDD7C9]"
          >
            {block}
          </p>
        ),
      )}
    </div>
  );
}

export default function BibliaPlanJornada() {
  const { planId, dia } = useParams();
  const id = Number(planId);
  const dayNumber = Number(dia);
  const navigate = useNavigate();
  const [data, setData] = useState<BiblePlanJourney | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (
      !Number.isInteger(id) ||
      id < 1 ||
      !Number.isInteger(dayNumber) ||
      dayNumber < 1
    ) {
      setError("La jornada solicitada no es válida.");
      setLoading(false);
      return;
    }

    void Promise.all([getBiblePlanDay(id, dayNumber), resolvePlanProgress(id)])
      .then(([journey]) => {
        if (active) setData(journey);
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "No fue posible cargar la jornada.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, dayNumber]);

  const complete = async () => {
    if (!data || saving) return;
    setSaving(true);
    const last = dayNumber >= data.plan.duracion_dias;
    const next = last ? data.plan.duracion_dias : dayNumber + 1;
    await savePlanProgress(data.plan.id, next, last);
    setSaving(false);

    if (last) {
      navigate(`/biblia/planes/${data.plan.id}?completado=1`);
    } else {
      navigate(`/biblia/planes/${data.plan.id}/jornada/${next}`);
    }
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

  if (error || !data) {
    return (
      <BibliaLayout title="Planes">
        <div className="rounded-2xl border border-red-500/25 bg-red-950/20 p-4 text-sm text-red-200">
          {error || "Jornada no disponible."}
        </div>
      </BibliaLayout>
    );
  }

  const { plan, jornada } = data;
  const percentage = Math.min(
    100,
    Math.round((jornada.dia / Math.max(1, plan.duracion_dias)) * 100),
  );

  return (
    <BibliaLayout title="Planes">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          to={`/biblia/planes/${plan.id}`}
          className="flex min-h-10 items-center gap-1 text-sm text-[#C9C3B3]"
        >
          <ChevronLeft className="h-4 w-4" />
          Plan
        </Link>
        <span className="text-xs font-semibold text-[#D4AF37]">
          {jornada.dia} / {plan.duracion_dias}
        </span>
      </div>

      <header className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
          Jornada {jornada.dia} de {plan.duracion_dias}
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-[#F8F5EA]">
          {jornada.titulo}
        </h1>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#D4AF37]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </header>

      {jornada.oracion_inicial ? (
        <section className="mb-4 rounded-[1.5rem] border border-[#D4AF37]/18 bg-[#0B0B0B] p-5">
          <div className="mb-3 flex items-center gap-2 text-[#D4AF37]">
            <Flame className="h-4 w-4" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Dispón tu corazón
            </h2>
          </div>
          <SpiritualText text={jornada.oracion_inicial} />
        </section>
      ) : null}

      {jornada.lectura ? (
        <section className="mb-4 rounded-[1.5rem] border border-[#D4AF37]/28 bg-[linear-gradient(145deg,rgba(212,175,55,0.11),rgba(11,11,11,0.95))] p-5">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <BookOpen className="h-4 w-4" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Palabra de Dios
            </h2>
          </div>
          <p className="mt-3 font-display text-xl text-[#F8F5EA]">
            {jornada.lectura}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#9D9688]">
            La cita se consulta desde la Biblia oficial de LVJPRAYER; el plan conserva únicamente la referencia.
          </p>
        </section>
      ) : null}

      {jornada.descripcion ? (
        <section className="mb-4 rounded-[1.5rem] border border-[#D4AF37]/15 bg-[#0B0B0B] p-5">
          <SpiritualText text={jornada.descripcion} />
        </section>
      ) : null}

      {jornada.motivacion ? (
        <section className="mb-4 rounded-[1.5rem] border border-[#D4AF37]/15 bg-[#0B0B0B] p-5">
          <div className="mb-3 flex items-center gap-2 text-[#D4AF37]">
            <MessageCircleQuestion className="h-4 w-4" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Camina con la Palabra
            </h2>
          </div>
          <SpiritualText text={jornada.motivacion} />
        </section>
      ) : null}

      {jornada.oracion_final ? (
        <section className="mb-5 rounded-[1.5rem] border border-[#D4AF37]/25 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.12),transparent_38%),#0B0B0B] p-5">
          <div className="mb-3 flex items-center gap-2 text-[#D4AF37]">
            <ShieldCheck className="h-4 w-4" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em]">
              Oremos
            </h2>
          </div>
          <SpiritualText text={jornada.oracion_final} />
        </section>
      ) : null}

      <button
        type="button"
        disabled={saving}
        onClick={complete}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3.5 text-sm font-bold text-black disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {jornada.dia >= plan.duracion_dias
          ? "COMPLETAR PLAN"
          : "COMPLETAR Y CONTINUAR"}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {jornada.dia > 1 ? (
          <Link
            to={`/biblia/planes/${plan.id}/jornada/${jornada.dia - 1}`}
            className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-sm text-[#C9C3B3]"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Link>
        ) : (
          <span />
        )}

        {jornada.dia < plan.duracion_dias ? (
          <Link
            to={`/biblia/planes/${plan.id}/jornada/${jornada.dia + 1}`}
            className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-[#D4AF37]/20 bg-[#0B0B0B] text-sm text-[#C9C3B3]"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </BibliaLayout>
  );
}
