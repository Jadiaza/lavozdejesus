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
          className="flex h-11 w-11 items-center justify-center text-gold transition hover:text-gold-bright active:scale-95"
        >
          <Settings className="h-7 w-7" strokeWidth={1.55} aria-hidden="true" />
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
          <div className="absolute inset-x-0 top-0 z-20 px-5 pb-5 pt-3 text-center min-[390px]:px-6 min-[390px]:pt-4">
            <h2
              id="rosary-today-title"
              className="
                mx-auto max-w-[22rem] text-balance font-display
                text-[clamp(1.9rem,8.5vw,2.75rem)] font-semibold
                leading-[0.95] tracking-[-0.04em]
                text-gold-bright
                drop-shadow-[0_4px_18px_rgba(212,175,55,0.18)]
              "
            >
              {groupData.name}
            </h2>

            <div
              className="mx-auto mt-3 flex max-w-[13rem] items-center gap-3"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/70" />
              <span className="text-[9px] text-gold-bright">✦</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
            </div>

          </div>

          <div className="absolute inset-0 overflow-hidden">
            <img
              src={mysteryArt[group]}
              alt={`Representación artística de los ${groupData.name}`}
              width={1024}
              height={800}
              className="h-full w-full scale-[1.02] object-cover object-center opacity-95"
            />

            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-navy-deep via-navy-deep/70 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_20%,hsl(var(--navy-deep)/0.12)_58%,hsl(var(--navy-deep)/0.72)_100%)]"
              aria-hidden="true"
            />

            <blockquote className="absolute inset-x-6 bottom-[9.6rem] z-10 mx-auto max-w-[24rem] text-center font-display min-[390px]:inset-x-8">
              <p className="text-balance text-[clamp(0.9rem,4vw,1.12rem)] italic leading-[1.35] text-foreground drop-shadow-[0_2px_9px_rgba(0,0,0,0.95)]">
                <span className="mr-1.5 text-2xl not-italic leading-none text-gold/75">“</span>
                {representativeVerse.text}
                <span className="ml-0.5">”</span>
              </p>
              <cite className="mt-2 block text-[12px] not-italic tracking-wide text-gold-bright min-[390px]:text-[13px]">
                {representativeVerse.reference}
              </cite>
            </blockquote>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-b from-transparent via-navy-deep/85 to-navy-deep px-5 pb-3 pt-9 min-[390px]:px-6">
            {hasPendingSession && resume ? (
              <>
                <Link
                  to={`${routeForMode(resume.mode)}?grupo=${resume.group}`}
                  className="
                    relative flex min-h-16 w-full
                    items-center justify-center
                    overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold
                    whitespace-nowrap px-9 font-display
                    text-[clamp(0.78rem,3.7vw,1.05rem)] font-semibold uppercase
                    tracking-[0.045em] text-navy-deep min-[390px]:tracking-[0.09em]
                    shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)]
                    transition duration-300
                    hover:-translate-y-0.5 hover:brightness-105
                    active:translate-y-0 active:scale-[0.99]
                  "
                >
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
                  relative flex min-h-16 w-full
                  items-center justify-center
                  overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold
                  whitespace-nowrap px-9 font-display
                  text-[clamp(0.78rem,3.7vw,1.05rem)] font-semibold uppercase
                  tracking-[0.045em] text-navy-deep min-[390px]:tracking-[0.09em]
                  shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)]
                  transition duration-300
                  hover:-translate-y-0.5 hover:brightness-105
                  active:translate-y-0 active:scale-[0.99]
                "
              >
                Comenzar el Rosario
                <ChevronRight className="absolute right-5 h-5 w-5" aria-hidden="true" />
              </button>
            )}

            <Link
              to="/rosario/seleccionar-misterios"
              className="
                mx-auto mt-2 flex min-h-9 w-fit items-center justify-center gap-1.5
                rounded-xl px-3 text-[11px] font-medium tracking-[0.04em] min-[390px]:text-xs
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
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] border-t border-gold/25 bg-navy-deep/95 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl"
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
                <span className="absolute -top-2 h-1 w-10 rounded-full bg-gold-bright shadow-[0_0_16px_hsl(var(--gold)/0.6)]" />
              ) : null}
              <item.icon className="h-6 w-6" strokeWidth={item.active ? 2 : 1.55} aria-hidden="true" />
              <span className="text-[11px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </RosaryLayout>
  );
};

export default RosarioHome;
