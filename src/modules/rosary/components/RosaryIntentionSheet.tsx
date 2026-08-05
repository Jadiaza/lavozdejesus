import { useState } from "react";
import type { RosaryIntention, RosaryIntentionKind } from "../types";

const OPTIONS: Array<{ kind: RosaryIntentionKind; label: string }> = [
  { kind: "personal", label: "Intención personal" },
  { kind: "familia", label: "Por mi familia" },
  { kind: "enfermo", label: "Por un enfermo" },
  { kind: "difunto", label: "Por un difunto" },
  { kind: "iglesia", label: "Por la Iglesia" },
  { kind: "sacerdotes", label: "Por los sacerdotes" },
  { kind: "paz", label: "Por la paz" },
  { kind: "virgen", label: "Por las intenciones de la Virgen" },
  { kind: "otra", label: "Otra intención" },
  { kind: "ninguna", label: "Sin intención específica" },
];

interface Props {
  onConfirm: (intention: RosaryIntention | null) => void;
  onSkip: () => void;
}

/** Selección de intención. El texto libre es privado y opcional de guardar. */
export const RosaryIntentionSheet = ({ onConfirm, onSkip }: Props) => {
  const [kind, setKind] = useState<RosaryIntentionKind | null>(null);
  const [text, setText] = useState("");
  const [allowStore, setAllowStore] = useState(false);

  const confirm = () => {
    if (!kind || kind === "ninguna") return onConfirm(null);
    const label = OPTIONS.find((o) => o.kind === kind)?.label ?? "Intención";
    onConfirm({ kind, label, text: text.trim() || undefined, allowStore });
  };

  return (
    <section className="glass gold-border rounded-3xl p-5 space-y-4">
      <div>
        <h2 className="font-display text-2xl">¿Por quién quieres rezar?</h2>
        <p className="text-sm text-muted-foreground">Este paso es opcional.</p>
      </div>

      <ul className="grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <li key={o.kind}>
            <button
              type="button"
              onClick={() => setKind(o.kind)}
              aria-pressed={kind === o.kind}
              className={`w-full min-h-11 rounded-2xl px-3 py-2 text-left text-sm transition ${
                kind === o.kind ? "bg-gradient-gold text-navy-deep font-medium" : "bg-secondary text-foreground/85"
              }`}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>

      {kind && kind !== "ninguna" && (
        <div className="space-y-2">
          <label htmlFor="rosary-intention-text" className="text-xs text-muted-foreground">
            Detalle (opcional, máximo 300 caracteres)
          </label>
          <textarea
            id="rosary-intention-text"
            value={text}
            maxLength={300}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full rounded-2xl bg-input border border-border p-3 text-sm placeholder:text-muted-foreground"
            placeholder="Escribe tu intención…"
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={confirm}
          className="flex-1 min-h-11 rounded-full bg-gradient-gold text-navy-deep font-medium"
        >
          Continuar
        </button>
        <button type="button" onClick={onSkip} className="min-h-11 rounded-full px-4 text-sm text-muted-foreground">
          Omitir
        </button>
      </div>
    </section>
  );
};