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
            flex h-full min-h-0 flex-col overflow-hidden
            rounded-[1.75rem]
            border border-gold/70
            bg-navy-deep
            shadow-deep
          "
          aria-labelledby="rosary-today-title"
        >
          {/* Información del día */}
          <div className="shrink-0 px-5 pb-3 pt-4 text-center">
            <p className="flex items-center justify-center gap-2 text-xs text-foreground/65">
              <CalendarDays
                className="h-4 w-4 text-gold/75"
                strokeWidth={1.7}
                aria-hidden="true"
              />

              <span>{longDate}</span>
            </p>

            <h2
              id="rosary-today-title"
              className="
                mt-3 font-display text-[2rem] font-semibold
                leading-none tracking-[-0.02em]
                text-gold-bright
                sm:text-[2.5rem]
              "
            >
              {groupData.name}
            </h2>

            <div
              className="mx-auto mt-3 flex max-w-[12rem] items-center gap-2"
              aria-hidden="true"
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/70" />
              <span className="text-[10px] text-gold">✦</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/70" />
            </div>

            <p className="mx-auto mt-3 max-w-[20rem] text-[13px] leading-5 text-foreground/75">
              {groupData.description}
            </p>
          </div>

          {/* Imagen que ocupa el espacio disponible */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <img
              src={mysteryArt[group]}
              alt={`Representación artística de los ${groupData.name}`}
              width={1024}
              height={800}
              className="h-full min-h-[13rem] w-full object-cover object-center"
            />

            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-navy-deep/55 to-transparent"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-deep via-navy-deep/35 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Acciones */}
          <div className="shrink-0 px-5 pb-4 pt-3">
            {hasPendingSession && resume ? (
              <>
                <Link
                  to={`${routeForMode(resume.mode)}?grupo=${resume.group}`}
                  className="
                    relative flex min-h-14 w-full
                    items-center justify-center
                    rounded-2xl bg-gradient-gold
                    px-12 text-sm font-semibold uppercase
                    tracking-[0.07em] text-navy-deep
                    shadow-gold
                    transition
                    hover:brightness-105
                    active:scale-[0.99]
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
                    mx-auto mt-2 flex min-h-9
                    items-center justify-center
                    rounded-xl px-3
                    text-xs font-medium text-gold
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
                  rounded-2xl bg-gradient-gold
                  px-12 text-sm font-semibold uppercase
                  tracking-[0.07em] text-navy-deep
                  shadow-gold
                  transition
                  hover:brightness-105
                  active:scale-[0.99]
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
                mx-auto mt-2 flex min-h-9 w-fit
                items-center justify-center gap-1
                rounded-xl px-3
                text-xs font-medium text-gold
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