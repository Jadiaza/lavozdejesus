import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight } from "lucide-react";

import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { useRosaryToday } from "../hooks/useRosaryToday";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import { rosarySessionService } from "../services/rosarySessionService";
import { rosaryTodayService } from "../services/rosaryTodayService";
import { routeForMode } from "../utils/routes";

import type {
  MysteryGroupId,
  RosarySession,
} from "../types";

/**
 * Portada del Santo Rosario.
 *
 * Muestra únicamente:
 * - Misterios recomendados del día.
 * - Imagen contemplativa.
 * - Inicio o continuación del Rosario.
 * - Cambio manual de misterios.
 *
 * La selección de modalidad se realiza en la pantalla siguiente.
 */
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

  /*
   * La portada siempre presenta los misterios recomendados del día.
   * Una selección diferente se realiza desde “Elegir otros misterios”.
   */
  const group = suggested;
  const groupData = mysteryGroups[group];

  const longDate = useMemo(
    () => rosaryTodayService.longDate(),
    [],
  );

  const season =
    today.status === "ready"
      ? today.data.season?.nombre ?? "Tiempo Ordinario"
      : undefined;

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
      subtitle={season}
      back="/"
      fullScreen
    >
      {today.status === "loading" ? (
        <div className="flex h-full items-center justify-center">
          <RosaryLoading label="Preparando los misterios de hoy" />
        </div>
      ) : (
        <section
          className="
            relative flex h-full min-h-0 flex-col overflow-hidden
            bg-[linear-gradient(180deg,hsl(var(--navy-deep))_0%,hsl(var(--navy))_54%,hsl(var(--navy-deep))_100%)]
          "
          aria-labelledby="rosary-today-title"
        >
          {/* Información del día */}
          <div className="relative z-20 shrink-0 px-6 pb-4 pt-3 text-center">
            <p className="flex items-center justify-center gap-2 text-[11px] font-medium tracking-[0.06em] text-foreground/60">
              <CalendarDays
                className="h-4 w-4 text-gold/80"
                strokeWidth={1.7}
                aria-hidden="true"
              />

              <span>{longDate}</span>
            </p>

            <h2
              id="rosary-today-title"
              className="
                mt-3 font-display text-[2.35rem] font-semibold
                leading-[0.92] tracking-[-0.035em]
                text-gold-bright
                drop-shadow-[0_4px_18px_rgba(212,175,55,0.18)]
                sm:text-[2.75rem]
              "
            >
              {groupData.name}
            </h2>

            <div
              className="mx-auto mt-4 flex max-w-[14rem] items-center gap-3"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/70" />
              <span className="text-[9px] text-gold-bright">✦</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
            </div>

            <p className="mx-auto mt-3 max-w-[21rem] font-display text-[1.05rem] leading-6 text-foreground/80">
              {groupData.description}
            </p>
          </div>

          {/* Imagen que ocupa el espacio disponible */}
          <div className="relative min-h-[14rem] flex-1 overflow-hidden">
            <img
              src={mysteryArt[group]}
              alt={`Representación artística de los ${groupData.name}`}
              width={1024}
              height={800}
              className="h-full min-h-[14rem] w-full scale-[1.02] object-cover object-center opacity-95"
            />

            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-navy-deep via-navy-deep/50 to-transparent"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-navy-deep via-navy-deep/65 to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_20%,hsl(var(--navy-deep)/0.12)_58%,hsl(var(--navy-deep)/0.72)_100%)]"
              aria-hidden="true"
            />
          </div>

          {/* Acciones */}
          <div className="relative z-20 shrink-0 bg-gradient-to-b from-transparent via-navy-deep/85 to-navy-deep px-6 pb-5 pt-2">
            {hasPendingSession && resume ? (
              <>
                <Link
                  to={`${routeForMode(resume.mode)}?grupo=${resume.group}`}
                  className="
                    relative flex min-h-14 w-full
                    items-center justify-center
                    overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold
                    px-12 text-sm font-semibold uppercase
                    tracking-[0.09em] text-navy-deep
                    shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)]
                    transition duration-300
                    hover:-translate-y-0.5 hover:brightness-105
                    active:translate-y-0 active:scale-[0.99]
                  "
                >
                  Continuar Rosario

                  <ChevronRight
                    className="absolute right-5 h-5 w-5"
                    aria-hidden="true"
                  />
                </Link>

                <button
                  type="button"
                  onClick={startTodayRosary}
                  className="
                    mx-auto mt-2.5 flex min-h-9
                    items-center justify-center
                    rounded-xl px-3
                    text-[11px] font-medium tracking-wide text-gold/85
                    transition
                    hover:bg-gold/5
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
                  relative flex min-h-14 w-full
                  items-center justify-center
                  overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold
                  px-12 text-sm font-semibold uppercase
                  tracking-[0.09em] text-navy-deep
                  shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)]
                  transition duration-300
                  hover:-translate-y-0.5 hover:brightness-105
                  active:translate-y-0 active:scale-[0.99]
                "
              >
                Comenzar el Rosario

                <ChevronRight
                  className="absolute right-5 h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            )}

            <Link
              to="/rosario/seleccionar-misterios"
              className="
                mx-auto mt-2.5 flex min-h-9 w-fit
                items-center justify-center gap-1
                rounded-xl px-3
                text-[11px] font-medium tracking-[0.04em] text-gold/90
                transition
                hover:bg-gold/5
              "
            >
              Elegir otros misterios

              <ChevronRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      )}
    </RosaryLayout>
  );
};

export default RosarioHome;