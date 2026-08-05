import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RosaryLayout } from "../components/RosaryLayout";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt, mysteryDays } from "../mocks/mysteryArt";
import { rosaryTodayService } from "../services/rosaryTodayService";
import { routeForMode } from "../utils/routes";
import type { MysteryGroupId } from "../types";

const GROUPS: MysteryGroupId[] = ["gozosos", "luminosos", "dolorosos", "gloriosos"];

/** Pantalla 11: lectura de los misterios sin rezar el Rosario completo. */
export const RosarioMisterios = () => {
  const navigate = useNavigate();
  const { flow, update } = useRosaryFlow();
  const [group, setGroup] = useState<MysteryGroupId>(flow.group ?? rosaryTodayService.groupForDate());
  const [selected, setSelected] = useState<number | null>(null);
  const data = mysteryGroups[group];

  const startFrom = (order: number) => {
    update({ group, startDecade: order, scope: "completo" });
    navigate(`${routeForMode(flow.mode ?? "digital")}?grupo=${group}&decena=${order}`);
  };

  return (
    <RosaryLayout title={data.name} subtitle={mysteryDays[group]} back="/rosario">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => {
              setGroup(g);
              setSelected(null);
            }}
            aria-pressed={group === g}
            className={`shrink-0 min-h-10 rounded-full px-4 text-xs uppercase tracking-[0.12em] ${
              group === g ? "bg-gradient-gold text-navy-deep" : "gold-border text-foreground/80"
            }`}
          >
            {mysteryGroups[g].name.replace("Misterios ", "")}
          </button>
        ))}
      </div>

      <ol className="mt-4 space-y-2">
        {data.mysteries.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => setSelected(selected === m.order ? null : m.order)}
              aria-expanded={selected === m.order}
              className={`w-full flex items-center gap-3 rounded-2xl p-2 pr-4 text-left border transition ${
                selected === m.order
                  ? "border-[hsl(var(--gold)/0.7)] bg-[hsl(var(--gold)/0.1)]"
                  : "border-[hsl(var(--gold)/0.15)] bg-secondary/40"
              }`}
            >
              <span className="w-6 shrink-0 text-center font-display text-lg text-gold">{m.order}</span>
              <img
                src={mysteryArt[group]}
                alt=""
                loading="lazy"
                width={1024}
                height={640}
                className="h-11 w-11 rounded-lg object-cover shrink-0"
              />
              <span className="min-w-0 flex-1 text-sm">{m.title}</span>
            </button>
            {selected === m.order && (
              <div className="mt-2 glass gold-border rounded-2xl p-4 space-y-2">
                <p className="text-xs text-gold/90">{m.scriptureRef}</p>
                <p className="text-sm text-muted-foreground">
                  {m.meditation ?? "Meditación pendiente de publicación. Contempla este misterio en silencio."}
                </p>
                <p className="text-xs text-muted-foreground">Fruto: {m.fruit}</p>
              </div>
            )}
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => startFrom(selected ?? 1)}
        className="mt-5 w-full min-h-12 rounded-xl bg-gradient-gold text-navy-deep font-medium uppercase tracking-[0.12em]"
      >
        {selected ? `Comenzar desde este misterio` : "Comenzar desde el primer misterio"}
      </button>
    </RosaryLayout>
  );
};

export default RosarioMisterios;