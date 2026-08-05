import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { RosaryPrayerScene } from "../components/RosaryPrayerScene";
import { RosaryCompletion } from "../components/RosaryCompletion";
import { RosarySettingsSheet } from "../components/RosarySettingsSheet";
import { useRosarySession } from "../hooks/useRosarySession";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import { rosaryTodayService } from "../services/rosaryTodayService";
import type { MysteryGroupId } from "../types";

const isGroup = (v: string | null): v is MysteryGroupId =>
  !!v && ["gozosos", "luminosos", "dolorosos", "gloriosos"].includes(v);

/** Pantalla 9: modo manual, con el rosario físico en la mano. */
export const RosarioFisico = () => {
  const [params] = useSearchParams();
  const group = isGroup(params.get("grupo")) ? (params.get("grupo") as MysteryGroupId) : rosaryTodayService.groupForDate();
  const { prefs, update } = useRosaryPreferences();
  const { flow } = useRosaryFlow();
  const [showSettings, setShowSettings] = useState(false);

  const s = useRosarySession({
    group,
    mode: "physical",
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
      subtitle="Con mi rosario"
      focus
      actions={
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          aria-label="Ajustes del rosario"
          className="h-11 w-11 rounded-full glass gold-border flex items-center justify-center"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
        </button>
      }
    >
      {showSettings && (
        <div className="mb-4">
          <RosarySettingsSheet prefs={prefs} update={update} onClose={() => setShowSettings(false)} />
        </div>
      )}

      {s.completed ? (
        <RosaryCompletion onRestart={s.restart} intentionLabel={flow.intention?.label ?? null} group={group} />
      ) : !s.definition || !s.section ? (
        <RosaryLoading label="Preparando el rosario" />
      ) : (
        <div className="space-y-4">
          <RosaryPrayerScene
            title={decade ? `${decade}º misterio` : s.section.title}
            subtitle={mystery?.title}
            image={mysteryArt[group]}
            mystery={mystery}
          />
          <section className="glass gold-border rounded-3xl p-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-gold/90">Oraciones de esta decena</h3>
            <ul className="mt-2 space-y-1">
              {s.section.beads.map((b, i) => (
                <li
                  key={b.id}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    b.id === s.bead?.id ? "bg-[hsl(var(--gold)/0.15)] text-gold" : "text-foreground/80"
                  }`}
                >
                  {i === 0 || b.prayerKey !== s.section?.beads[i - 1]?.prayerKey ? b.label : b.label}
                </li>
              ))}
            </ul>
          </section>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={s.prev}
              className="min-h-12 flex-1 rounded-xl gold-border flex items-center justify-center gap-2 text-sm"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </button>
            <button
              type="button"
              onClick={s.next}
              className="min-h-12 flex-1 rounded-xl bg-gradient-gold text-navy-deep font-medium flex items-center justify-center gap-2"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </RosaryLayout>
  );
};

export default RosarioFisico;