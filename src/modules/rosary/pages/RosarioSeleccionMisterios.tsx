import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleDot, Sparkles } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryRadioRow } from "../components/RosaryRows";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt, mysteryDays } from "../mocks/mysteryArt";
import { rosaryTodayService } from "../services/rosaryTodayService";
import type { MysteryGroupId, RosaryScope } from "../types";

const GROUPS: MysteryGroupId[] = ["gozosos", "luminosos", "dolorosos", "gloriosos"];

/** Pantalla 5: elección de misterios y alcance del rezo. */
export const RosarioSeleccionMisterios = () => {
  const navigate = useNavigate();
  const { flow, update } = useRosaryFlow();
  const [group, setGroup] = useState<MysteryGroupId>(flow.group ?? rosaryTodayService.groupForDate());
  const [scope, setScope] = useState<RosaryScope>(flow.scope);

  const submit = () => {
    update({ group, scope });
    navigate("/rosario/configuracion");
  };

  return (
    <RosaryLayout
      title="Seleccionar misterios"
      subtitle="Puedes cambiar los misterios del día si lo deseas"
      back="/rosario/intencion"
    >
      <div role="radiogroup" aria-label="Grupo de misterios" className="space-y-2">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={group === g}
            onClick={() => setGroup(g)}
            className={`w-full flex items-center gap-3 rounded-2xl p-2 pr-4 text-left border transition ${
              group === g
                ? "border-[hsl(var(--gold)/0.7)] bg-[hsl(var(--gold)/0.1)]"
                : "border-[hsl(var(--gold)/0.15)] bg-secondary/40"
            }`}
          >
            <img
              src={mysteryArt[g]}
              alt=""
              loading="lazy"
              width={1024}
              height={640}
              className="h-12 w-12 rounded-xl object-cover shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm">{mysteryGroups[g].name}</span>
              <span className="block text-[11px] text-muted-foreground">{mysteryDays[g]}</span>
            </span>
            <span
              className={`h-5 w-5 rounded-full border shrink-0 ${
                group === g ? "border-gold bg-gradient-gold" : "border-[hsl(var(--gold)/0.4)]"
              }`}
            />
          </button>
        ))}
      </div>

      <div role="radiogroup" aria-label="Alcance del rezo" className="mt-4 space-y-2">
        <RosaryRadioRow
          icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
          label="Rosario completo (20 misterios)"
          hint="Recorre los cuatro grupos de misterios"
          selected={scope === "completo"}
          onSelect={() => setScope("completo")}
        />
        <RosaryRadioRow
          icon={<CircleDot className="h-4 w-4" aria-hidden="true" />}
          label="Una sola decena"
          hint="Ideal para rezar en poco tiempo"
          selected={scope === "decena"}
          onSelect={() => setScope("decena")}
        />
      </div>

      <button
        type="button"
        onClick={submit}
        className="mt-5 w-full min-h-12 rounded-xl bg-gradient-gold text-navy-deep font-medium uppercase tracking-[0.12em]"
      >
        Continuar
      </button>
    </RosaryLayout>
  );
};

export default RosarioSeleccionMisterios;