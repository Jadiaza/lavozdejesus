import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Settings } from "lucide-react";

import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { useRosaryToday } from "../hooks/useRosaryToday";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import { rosarySessionService } from "../services/rosarySessionService";
import { rosaryTodayService } from "../services/rosaryTodayService";
import { routeForMode } from "../utils/routes";

import type { MysteryGroupId, RosarySession } from "../types";

/** Portada del Santo Rosario. */
export const RosarioHome = () => {
  const today = useRosaryToday();
  const navigate = useNavigate();
  const { update } = useRosaryFlow();
  const [resume, setResume] = useState<RosarySession | null>(null);

  useEffect(() => {
    setResume(rosarySessionService.load());
  }, []);

  const suggested: MysteryGroupId =
    today.status === "ready"
      ? today.data.recommendedGroup
      : rosaryTodayService.groupForDate();

  const group = suggested;
  const groupData = mysteryGroups[group];
  const hasPendingSession = resume !== null && resume.status !== "terminado";

  const startFlow = () => {
    update({ group });
    navigate("/rosario/modalidad");
  };

  const startTodayRosary = () => {
    if (hasPendingSession) {
      const confirmed = window.confirm(
        "Se descartará el progreso del Rosario pendiente. ¿Deseas comenzar el Rosario de hoy?",
      );

      if (!confirmed) return;

      rosarySessionService.clear();
      setResume(null);
    }

    update({ group });
    navigate("/rosario/modalidad");
  };

  return (
    <RosaryLayout
      title="Oración Mariana"
      actions={
        <Link
          to="/rosario/configuracion"
          aria-label="Configuración del Rosario"
          className="flex h-11 w-11 items-center justify-center rounded-full text-gold transition hover:bg-gold/10 hover:text-gold-bright active:scale-95"
        >
          <Settings className="h-7 w-7" strokeWidth={1.7} aria-hidden="true" />
        </Link>
      }
      fullScreen
    >
      {today.status === "loading" ? (
        <div className="flex h-full items-center justify-center">
          <RosaryLoading label="Preparando los misterios de hoy" />
        </div>
      ) : (
        <section
          className="relative flex h-full min-h-0 flex-col overflow-hidden bg-navy-deep"
          aria-label={`Portada de ${groupData.name}`}
        >
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <img
              src={mysteryArt[group]}
              alt={`Representación artística de los ${groupData.name}`}
              width={1024}
              height={1200}
              className="absolute inset-0 h-full w-full scale-[1.01] object-cover object-center"
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-navy-deep/90 via-navy-deep/35 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-navy-deep via-navy-deep/58 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,transparent_32%,hsl(var(--navy-deep)/0.10)_64%,hsl(var(--navy-deep)/0.42)_100%)]" aria-hidden="true" />

            <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 text-center min-[390px]:px-6">
              <p className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-gold-bright/90">
                Misterio de hoy
              </p>
              <h2 className="mt-1.5 font-display text-[clamp(1.55rem,6.4vw,2rem)] font-semibold leading-tight text-foreground drop-shadow-lg">
                {groupData.name}
              </h2>
            </div>
          </div>

          <div className="relative z-20 shrink-0 bg-navy-deep px-5 pb-3 pt-3 min-[390px]:px-6">
            {hasPendingSession && resume ? (
              <>
                <Link
                  to={`${routeForMode(resume.mode)}?grupo=${resume.group}`}
                  className="relative flex min-h-[64px] w-full items-center justify-center overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold whitespace-nowrap px-12 font-sans text-[clamp(0.9rem,4.2vw,1.12rem)] font-bold uppercase tracking-[0.045em] text-navy-deep shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.99] min-[390px]:tracking-[0.09em]"
                >
                  <img src="/icons/rosario.png" alt="" className="absolute left-5 h-9 w-9 object-contain brightness-0" aria-hidden="true" />
                  Continuar Rosario
                  <ChevronRight className="absolute right-5 h-5 w-5" aria-hidden="true" />
                </Link>

                <button
                  type="button"
                  onClick={startTodayRosary}
                  className="mx-auto mt-2 flex min-h-8 items-center justify-center rounded-xl px-3 text-[11px] font-medium tracking-wide text-gold/75 transition hover:bg-gold/5 hover:text-gold"
                >
                  Comenzar el Rosario de hoy
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startFlow}
                className="relative flex min-h-[64px] w-full items-center justify-center overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold whitespace-nowrap px-12 font-sans text-[clamp(0.9rem,4.2vw,1.12rem)] font-bold uppercase tracking-[0.045em] text-navy-deep shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.99] min-[390px]:tracking-[0.09em]"
              >
                <img src="/icons/rosario.png" alt="" className="absolute left-5 h-9 w-9 object-contain brightness-0" aria-hidden="true" />
                Comenzar el Rosario
                <ChevronRight className="absolute right-5 h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <Link
              to="/rosario/seleccionar-misterios"
              className="mx-auto mt-2 flex min-h-9 w-fit items-center justify-center gap-1.5 border-b border-gold/30 px-1 font-display text-[13px] tracking-[0.02em] text-gold/85 transition hover:text-gold-bright min-[390px]:text-sm"
            >
              Elegir otros misterios
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}
    </RosaryLayout>
  );
};

export default RosarioHome;
