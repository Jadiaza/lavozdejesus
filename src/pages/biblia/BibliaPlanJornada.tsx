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
import { BibliaReferenciaContenido } from "@/features/biblia/components/BibliaReferenciaModal";
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

function journeyTitle(title: string) {
  return title.replace(/^D[ií]a\s+\d+\s*[—–-]\s*/i, "").trim() || title;
}

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
  const [readingProgress, setReadingProgress] = useState({ completed: 0, total: 0 });

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
  const annualPercentage = Math.min(
    100,
    Math.round((jornada.dia / Math.max(1, plan.duracion_dias)) * 100),
  );
  const readingPercentage = readingProgress.total
    ? Math.round((readingProgress.completed / readingProgress.total) * 100)
    : 0;

  return (
    <BibliaLayout title="Planes">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          to={`/biblia/planes/${plan.id}`}
          className="min-w-0 truncate text-xs font-semibold uppercase tracking-[0.14em] text-[#A9A294]"
        >
          {plan.titulo}
        </Link>
        <span className="shrink-0 text-xs font-semibold text-[#D4AF37]">
          {jornada.dia} / {plan.duracion_dias}
        </span>
      </div>

      <header className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">
          Jornada {jornada.dia} de {plan.duracion_dias}
        </p>
        <h1 className="mt-2 font-display text-[2.05rem] leading-[1.08] text-[#F8F5EA] sm:text-4xl">
          {journeyTitle(jornada.titulo)}
        </h1>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/[0.06] p-[1px]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#D4AF37,#F2D27A)] transition-[width]"
              style={{
                width: `${readingProgress.total ? readingPercentage : annualPercentage}%`,
              }}
            />
          </div>
          <span className="shrink-0 text-[11px] text-[#AAA397]">
            {readingProgress.total
              ? `${readingProgress.completed} de ${readingProgress.total} lecturas · ${readingPercentage}%`
              : `${annualPercentage}% del plan`}
          </span>
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
        <section className="mb-5">
          <div className="mb-4 flex items-center gap-2 border-b border-[#D4AF37]/18 pb-3 text-[#D4AF37]">
            <BookOpen className="h-4 w-4" />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.24em]">
              Palabra de Dios
            </h2>
          </div>
          <BibliaReferenciaContenido
            referencia={jornada.lectura}
            storageKey={`planReading:${plan.id}:${jornada.dia}`}
            onProgressChange={(completed, total) =>
              setReadingProgress({ completed, total })
            }
          />
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

      <div className="mt-6 rounded-[1.35rem] border border-[#D4AF37]/30 bg-[linear-gradient(145deg,rgba(212,175,55,0.07),rgba(8,8,8,0.98))] p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 px-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/65 text-[#E7C35D]">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <p className="text-[12px] leading-5 text-[#B7B0A2]">
              Has completado{" "}
              <strong className="font-semibold text-[#F8F5EA]">
                {readingProgress.completed} de {readingProgress.total || "—"} lecturas
              </strong>
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={complete}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#F2D27A,#D4AF37)] px-6 text-sm font-bold text-[#0A0906] shadow-[0_8px_24px_rgba(212,175,55,0.2)] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {jornada.dia >= plan.duracion_dias
              ? "Completar plan"
              : "Completar jornada"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

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
