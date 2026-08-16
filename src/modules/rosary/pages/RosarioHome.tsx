import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, CircleDotDashed, Home, Radio, Settings, UserRound } from "lucide-react";

import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { useRosaryToday } from "../hooks/useRosaryToday";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { mysteryGroups, mysteryRepresentativeVerses } from "../mocks/mysteries";
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
  const representativeVerse = mysteryRepresentativeVerses[group];

  const longDate = useMemo(
    () => rosaryTodayService.longDate(),
    [],
  );

  const hasPendingSession =
    resume !== null && resume.status !== "terminado";

  const startFlow = () => {
    update({ group });
    navigate("/rosario/modalidad");
  };

  const startTodayRosary = () => {
    if (hasPendingSession) {
      const confirmed = window.confirm(
        "Se descartará el progreso del Rosario pendiente. ¿Deseas comenzar el Rosario de hoy?",
      );

      if (!confirmed) {
        return;
      }

      rosarySessionService.clear();
      setResume(null);
    }

    update({ group });
    navigate("/rosario/modalidad");
  };

  return (
    <RosaryLayout
      title="Oración Mariana"
      subtitle={longDate}
      back="/"
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
          className="
            relative h-full min-h-0 overflow-hidden bg-navy-deep
          "
          aria-labelledby="rosary-today-title"
        >
          <div className="absolute inset-x-0 top-0 z-20 px-4 pb-5 pt-5 text-center min-[390px]:pt-6 min-h-[760px]:pt-8">
            <h2
              id="rosary-today-title"
              className="
                mx-auto max-w-[25rem] text-balance font-display
                text-[clamp(2.15rem,10.5vw,3.15rem)] font-semibold
                leading-[0.95] tracking-[-0.025em]
                text-gold-bright
                drop-shadow-[0_4px_18px_rgba(212,175,55,0.18)]
              "
            >
              {groupData.name}
            </h2>

            <div
              className="mx-auto mt-4 flex max-w-[12.5rem] items-center gap-2.5"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/45 to-gold-bright" />
              <span className="h-2.5 w-2.5 rotate-45 bg-gold-bright shadow-[0_0_12px_hsl(var(--gold)/0.35)]" />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/45 to-gold-bright" />
            </div>

          </div>

          <div className="absolute inset-0 overflow-hidden">
            <img
              src={mysteryArt[group]}
              alt={`Representación artística de los ${groupData.name}`}
              width={1024}
              height={800}
              className="h-full w-full scale-[1.015] object-cover object-center opacity-100"
            />

            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-navy-deep via-navy-deep/55 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-navy-deep via-navy-deep/58 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_20%,hsl(var(--navy-deep)/0.12)_58%,hsl(var(--navy-deep)/0.72)_100%)]"
              aria-hidden="true"
            />

            <blockquote className="absolute inset-x-5 bottom-[9.9rem] z-10 mx-auto max-w-[25rem] text-center font-display min-[390px]:inset-x-7 min-h-[720px]:bottom-[10.5rem]">
              <p className="text-balance text-[clamp(1.05rem,4.7vw,1.38rem)] italic leading-[1.32] text-foreground drop-shadow-[0_2px_9px_rgba(0,0,0,0.95)]">
                <span className="mr-1 text-[1.35em] not-italic leading-none text-foreground">«</span>
                {representativeVerse.text}
                <span className="ml-0.5">»</span>
              </p>
              <cite className="mt-2 block text-[13px] not-italic tracking-wide text-gold-bright min-[390px]:text-sm">
                {representativeVerse.reference}
              </cite>
            </blockquote>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-b from-transparent via-navy-deep/90 to-navy-deep px-5 pb-3 pt-8 min-[390px]:px-6 min-h-[720px]:pt-10">
            {hasPendingSession && resume ? (
              <>
                <Link
                  to={`${routeForMode(resume.mode)}?grupo=${resume.group}`}
                  className="
                    relative flex min-h-[64px] w-full
                    items-center justify-center
                    overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold
                    whitespace-nowrap px-12 font-sans
                    text-[clamp(0.9rem,4.2vw,1.12rem)] font-bold uppercase
                    tracking-[0.045em] text-navy-deep min-[390px]:tracking-[0.09em]
                    shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)]
                    transition duration-300
                    hover:-translate-y-0.5 hover:brightness-105
                    active:translate-y-0 active:scale-[0.99]
                  "
                >
                  <img src="/icons/rosario.png" alt="" className="absolute left-5 h-9 w-9 object-contain brightness-0" aria-hidden="true" />
                  Continuar Rosario
                  <ChevronRight className="absolute right-5 h-5 w-5" aria-hidden="true" />
                </Link>

                <button
                  type="button"
                  onClick={startTodayRosary}
                  className="
                    mx-auto mt-2.5 flex min-h-9 items-center justify-center
                    rounded-xl px-3 text-[11px] font-medium tracking-wide
                    text-gold/85 transition hover:bg-gold/5
                  "
                >
                  Comenzar el Rosario de hoy
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startFlow}
                className="
                  relative flex min-h-[64px] w-full
                  items-center justify-center
                  overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold
                  whitespace-nowrap px-12 font-sans
                  text-[clamp(0.9rem,4.2vw,1.12rem)] font-bold uppercase
                  tracking-[0.045em] text-navy-deep min-[390px]:tracking-[0.09em]
                  shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)]
                  transition duration-300
                  hover:-translate-y-0.5 hover:brightness-105
                  active:translate-y-0 active:scale-[0.99]
                "
              >
                <img src="/icons/rosario.png" alt="" className="absolute left-5 h-9 w-9 object-contain brightness-0" aria-hidden="true" />
                Comenzar el Rosario
                <ChevronRight className="absolute right-5 h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <Link
              to="/rosario/seleccionar-misterios"
              className="
                mx-auto mt-2 flex min-h-9 w-fit items-center justify-center gap-1.5
                border-b border-gold/35 px-1 font-display text-[13px] tracking-[0.02em] min-[390px]:text-sm
                text-gold/90 transition hover:bg-gold/5
              "
            >
              Elegir otros misterios
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-3 bottom-[max(0.45rem,env(safe-area-inset-bottom))] z-50 mx-auto w-auto max-w-[406px] rounded-[1.4rem] border border-gold/20 bg-navy-deep/90 px-1 pb-2 pt-2.5 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <div className="flex items-end justify-around px-2">
          {[
            { label: "Inicio", to: "/", icon: Home },
            { label: "Radio", to: "/radio", icon: Radio },
            { label: "Biblia", to: "/biblia", icon: BookOpen },
            { label: "Rosario", to: "/rosario", icon: CircleDotDashed, active: true },
            { label: "Perfil", to: "/acceso", icon: UserRound },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 font-display ${item.active ? "text-gold-bright" : "text-foreground/55"}`}
            >
              {item.active ? (
                <span className="absolute -bottom-[0.7rem] h-0.5 w-12 rounded-full bg-gold-bright shadow-[0_0_16px_hsl(var(--gold)/0.8)]" />
              ) : null}
              {item.active ? (
                <img src="/icons/rosario.png" alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
              ) : (
                <item.icon className="h-7 w-7" strokeWidth={1.45} aria-hidden="true" />
              )}
              <span className="text-[12px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </RosaryLayout>
  );
};

export default RosarioHome;
