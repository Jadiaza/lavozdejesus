import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Info, NotebookPen, WifiOff } from "lucide-react";
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

/** Pantalla 2: portada del Rosario con los misterios del día. */
export const RosarioHome = () => {
  const today = useRosaryToday();
  const navigate = useNavigate();
  const { flow, update } = useRosaryFlow();
  const [resume, setResume] = useState<RosarySession | null>(null);

  useEffect(() => {
    setResume(rosarySessionService.load());
  }, []);

  const suggested: MysteryGroupId =
    today.status === "ready" ? today.data.recommendedGroup : rosaryTodayService.groupForDate();
  const group = flow.group ?? suggested;
  const groupData = mysteryGroups[group];
  const longDate = useMemo(() => rosaryTodayService.longDate(), []);
  const season = today.status === "ready" ? today.data.season?.nombre ?? "Tiempo Ordinario" : "";

  const startFlow = () => {
    update({ group });
    navigate("/rosario/modalidad");
  };

  return (
    <RosaryLayout title="Santo Rosario" subtitle={longDate} back="/">
      {today.status === "loading" ? (
        <RosaryLoading label="Cargando los misterios de hoy" />
      ) : (
        <section className="glass gold-border rounded-3xl overflow-hidden">
          <div className="px-5 pt-5 text-center">
            <p className="text-xs text-muted-foreground">{longDate}</p>
            <p className="text-xs text-gold/90 mt-0.5">{season}</p>
            <h2 className="font-display text-3xl mt-2 gold-text uppercase tracking-wide">{groupData.name}</h2>
            <p className="text-sm text-muted-foreground mt-2">{groupData.description}</p>
          </div>
          <img
            src={mysteryArt[group]}
            alt={`Arte sacro de los ${groupData.name}`}
            width={1024}
            height={640}
            className="mt-4 h-44 w-full object-cover border-y border-[hsl(var(--gold)/0.2)]"
          />
          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={startFlow}
              className="w-full min-h-12 rounded-xl bg-gradient-gold text-navy-deep font-medium uppercase tracking-[0.12em]"
            >
              Rezar el Rosario
            </button>
            <Link
              to="/rosario/seleccionar-misterios"
              className="flex items-center justify-center gap-1 text-sm text-gold min-h-11"
            >
              Cambiar misterios
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {today.status === "ready" && today.data.offlineFallback && (
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
                Calculado en tu dispositivo.
              </p>
            )}
          </div>
        </section>
      )}

      {resume && resume.status !== "terminado" && (
        <section className="mt-4 glass gold-border rounded-3xl p-5 text-center space-y-3">
          <h3 className="font-display text-2xl">Continúa tu Rosario</h3>
          <p className="text-sm text-gold/90">{mysteryGroups[resume.group].name}</p>
          <p className="text-xs text-muted-foreground">
            Modalidad {resume.mode === "audio" ? "por audio" : resume.mode === "physical" ? "con mi rosario" : "cuentas digitales"}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              to={`${routeForMode(resume.mode)}?grupo=${resume.group}`}
              className="min-h-11 flex items-center justify-center rounded-xl bg-gradient-gold text-navy-deep text-sm font-medium uppercase tracking-[0.12em]"
            >
              Continuar
            </Link>
            <button
              type="button"
              onClick={() => {
                rosarySessionService.clear();
                setResume(null);
                startFlow();
              }}
              className="min-h-11 rounded-xl gold-border text-sm"
            >
              Comenzar el Rosario de hoy
            </button>
            <button
              type="button"
              onClick={() => {
                rosarySessionService.clear();
                setResume(null);
              }}
              className="min-h-11 rounded-xl border border-[hsl(0_60%_45%/0.5)] text-sm text-[hsl(0_70%_70%)]"
            >
              Descartar sesión
            </button>
          </div>
        </section>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link to="/rosario/misterios" className="glass gold-border rounded-2xl p-4 text-sm flex items-center justify-between">
          Ver solamente los misterios
          <ChevronRight className="h-4 w-4 text-gold" aria-hidden="true" />
        </Link>
        <Link to="/rosario/diario" className="glass gold-border rounded-2xl p-4 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-gold" aria-hidden="true" />
            Diario espiritual
          </span>
          <ChevronRight className="h-4 w-4 text-gold" aria-hidden="true" />
        </Link>
        <Link to="/rosario/informacion" className="glass gold-border rounded-2xl p-4 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gold" aria-hidden="true" />
            Información del módulo
          </span>
          <ChevronRight className="h-4 w-4 text-gold" aria-hidden="true" />
        </Link>
      </div>
    </RosaryLayout>
  );
};

export default RosarioHome;