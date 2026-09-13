import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Play, RotateCcw, RotateCw, SkipForward, WifiOff } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { RosaryPrayerScene } from "../components/RosaryPrayerScene";
import { RosaryCompletion } from "../components/RosaryCompletion";
import { useRosarySession } from "../hooks/useRosarySession";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import { rosaryTodayService } from "../services/rosaryTodayService";
import type { MysteryGroupId } from "../types";

const isGroup = (v: string | null): v is MysteryGroupId =>
  !!v && ["gozosos", "luminosos", "dolorosos", "gloriosos"].includes(v);

/** Pantallas 10, 13 y 15: rosario por audio y aviso sin conexión. */
export const RosarioAudio = () => {
  const [params] = useSearchParams();
  const group = isGroup(params.get("grupo")) ? (params.get("grupo") as MysteryGroupId) : rosaryTodayService.groupForDate();
  const { prefs } = useRosaryPreferences();
  const { flow } = useRosaryFlow();

  const s = useRosarySession({
    group,
    mode: "audio",
    intention: flow.intention,
    haptics: prefs.haptics,
    decades: flow.scope === "decena" ? 1 : 5,
  });

  const mystery = useMemo(() => {
    if (!s.section?.mysteryId) return null;
    return mysteryGroups[group].mysteries.find((m) => m.id === s.section?.mysteryId) ?? null;
  }, [s.section, group]);

  const decade = s.section?.type === "decade" ? Number(s.section.id.split("-")[1]) : null;

  return (
    <RosaryLayout
      title={mysteryGroups[group].name}
      subtitle="Rosario por audio"
      focus
    >
      {s.completed ? (
        <RosaryCompletion onRestart={s.restart} intentionLabel={flow.intention?.label ?? null} group={group} />
      ) : !s.definition || !s.section || !s.bead ? (
        <RosaryLoading label="Preparando el audio" />
      ) : (
        <div className="space-y-5">
          <RosaryPrayerScene
            title={decade ? `${decade}º misterio` : s.section.title}
            subtitle={mystery?.title}
            image={mysteryArt[group]}
            mystery={mystery}
          />

          <div className="glass gold-border rounded-3xl p-5 space-y-4">
            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              Audio guía aún no publicado: puedes seguir el rezo con los textos.
            </p>
            <div className="flex items-center justify-center gap-6">
              <button type="button" onClick={s.prev} aria-label="Retroceder oración" className="h-12 w-12 rounded-full gold-border flex items-center justify-center">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled
                aria-label="Audio no disponible"
                className="flex h-16 w-16 cursor-not-allowed items-center justify-center rounded-full bg-gradient-gold text-navy-deep opacity-45"
              >
                <Play className="h-6 w-6" aria-hidden="true" />
              </button>
              <button type="button" onClick={s.next} aria-label="Avanzar oración" className="h-12 w-12 rounded-full gold-border flex items-center justify-center">
                <RotateCw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{s.bead.label}</span>
              <button
                type="button"
                onClick={s.next}
                className="flex items-center gap-1 text-gold min-h-11"
              >
                Siguiente
                <SkipForward className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </RosaryLayout>
  );
};

export default RosarioAudio;