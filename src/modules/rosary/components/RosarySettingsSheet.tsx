import type { RosaryPreferences, TextSize } from "../types";

interface Props {
  prefs: RosaryPreferences;
  update: (patch: Partial<RosaryPreferences>) => void;
  onClose: () => void;
}

const SIZES: Array<{ id: TextSize; label: string }> = [
  { id: "sm", label: "A" },
  { id: "md", label: "A+" },
  { id: "lg", label: "A++" },
];

const Toggle = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex items-center justify-between gap-3 min-h-11">
    <span className="text-sm">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 accent-[hsl(var(--gold))]"
    />
  </label>
);

export const RosarySettingsSheet = ({ prefs, update, onClose }: Props) => (
  <section className="glass gold-border rounded-3xl p-5 space-y-3" aria-label="Ajustes del rosario">
    <div className="flex items-center justify-between">
      <h2 className="font-display text-xl">Ajustes</h2>
      <button type="button" onClick={onClose} className="min-h-11 px-3 text-sm text-gold">
        Cerrar
      </button>
    </div>

    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">Tamaño de texto</span>
      <div className="flex gap-2">
        {SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => update({ textSize: s.id })}
            aria-pressed={prefs.textSize === s.id}
            className={`min-h-11 min-w-11 rounded-full text-sm ${
              prefs.textSize === s.id ? "bg-gradient-gold text-navy-deep" : "bg-secondary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>

    <Toggle label="Alto contraste" checked={prefs.highContrast} onChange={(v) => update({ highContrast: v })} />
    <Toggle label="Vibración al avanzar" checked={prefs.haptics} onChange={(v) => update({ haptics: v })} />
    <Toggle label="Mantener pantalla encendida" checked={prefs.keepAwake} onChange={(v) => update({ keepAwake: v })} />
    <Toggle label="Avance automático (audio)" checked={prefs.autoAdvance} onChange={(v) => update({ autoAdvance: v })} />
    <Toggle label="Música de fondo" checked={prefs.backgroundMusic} onChange={(v) => update({ backgroundMusic: v })} />

    <div className="space-y-1">
      <label htmlFor="rosary-voice-volume" className="text-sm">
        Volumen de voz
      </label>
      <input
        id="rosary-voice-volume"
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={prefs.voiceVolume}
        onChange={(e) => update({ voiceVolume: Number(e.target.value) })}
        className="w-full accent-[hsl(var(--gold))]"
      />
    </div>
  </section>
);