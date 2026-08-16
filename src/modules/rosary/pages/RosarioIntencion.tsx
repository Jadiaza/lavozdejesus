import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bird, Church, Cross, HeartHandshake, PenLine, Stethoscope, User, Users } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { rosaryTodayService } from "../services/rosaryTodayService";
import { routeForMode } from "../utils/routes";
import type { RosaryIntentionKind } from "../types";

const OPTIONS: Array<{ kind: RosaryIntentionKind; label: string; icon: typeof User }> = [
  { kind: "personal", label: "Intención personal", icon: User },
  { kind: "familia", label: "Mi familia", icon: Users },
  { kind: "enfermo", label: "Una persona enferma", icon: Stethoscope },
  { kind: "difunto", label: "Un difunto", icon: Cross },
  { kind: "iglesia", label: "La Iglesia", icon: Church },
  { kind: "sacerdotes", label: "Los sacerdotes", icon: HeartHandshake },
  { kind: "paz", label: "La paz", icon: Bird },
  { kind: "virgen", label: "Las intenciones de la Virgen María", icon: HeartHandshake },
  { kind: "otra", label: "Escribir otra intención", icon: PenLine },
];

/** Pantalla 4: intención por la que se ofrece el Rosario. */
export const RosarioIntencion = () => {
  const navigate = useNavigate();
  const { flow, update } = useRosaryFlow();
  const [kind, setKind] = useState<RosaryIntentionKind | null>(flow.intention?.kind ?? null);
  const [text, setText] = useState(flow.intention?.text ?? "");
  const [allowStore, setAllowStore] = useState(flow.intention?.allowStore ?? false);

  const submit = () => {
    if (!kind) {
      update({ intention: null });
      const group = flow.group ?? rosaryTodayService.groupForDate();
      navigate(`${routeForMode(flow.mode)}?grupo=${group}`);
      return;
    }
    const label = OPTIONS.find((o) => o.kind === kind)?.label ?? "Intención personal";
    update({
      intention: { kind, label, text: text.trim() || undefined, allowStore },
    });
    const group = flow.group ?? rosaryTodayService.groupForDate();
    navigate(`${routeForMode(flow.mode)}?grupo=${group}`);
  };

  return (
    <RosaryLayout title="Intención" subtitle="¿Por quién deseas ofrecer este Santo Rosario?" back="/rosario/modalidad">
      <div role="radiogroup" aria-label="Intención del Rosario" className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.kind}
            type="button"
            role="radio"
            aria-checked={kind === o.kind}
            onClick={() => setKind(o.kind)}
            className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-center text-[11px] leading-tight transition ${o.kind === "otra" ? "col-span-3 min-h-14 flex-row" : ""} ${kind === o.kind ? "border-gold bg-gold/10 text-gold" : "border-gold/20 bg-navy/55 text-foreground/80"}`}
          >
            <o.icon className="h-5 w-5 text-gold" aria-hidden="true" />
            <span>{o.label}</span>
          </button>
        ))}
      </div>

      {kind === "otra" && (
        <div className="mt-4 space-y-2">
          <label htmlFor="rosary-intention" className="text-xs text-muted-foreground">
            Tu intención (máximo 300 caracteres)
          </label>
          <textarea
            id="rosary-intention"
            rows={3}
            maxLength={300}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe aquí…"
            className="w-full rounded-2xl bg-input border border-border p-3 text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={allowStore}
              onChange={(e) => setAllowStore(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--gold))]"
            />
            Guardar esta intención en mi dispositivo
          </label>
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        className="mt-5 w-full min-h-12 rounded-xl bg-gradient-gold text-navy-deep font-medium uppercase tracking-[0.12em]"
      >
        Continuar
      </button>
      <button type="button" onClick={() => { update({ intention: null }); const group = flow.group ?? rosaryTodayService.groupForDate(); navigate(`${routeForMode(flow.mode)}?grupo=${group}`); }} className="mt-2 min-h-11 w-full text-sm text-muted-foreground">
        Continuar sin intención específica
      </button>
    </RosaryLayout>
  );
};

export default RosarioIntencion;
