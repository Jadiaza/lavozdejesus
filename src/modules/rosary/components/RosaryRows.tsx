import { ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";

/** Fila de lista con icono, título, descripción y chevron. */
export const RosaryNavRow = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full glass gold-border rounded-2xl p-4 flex items-center gap-4 text-left hover:border-gold transition"
  >
    {icon && <span className="text-gold shrink-0">{icon}</span>}
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-medium uppercase tracking-[0.14em] text-gold/90">{title}</span>
      {description && <span className="block text-xs text-muted-foreground mt-1">{description}</span>}
    </span>
    <ChevronRight className="h-4 w-4 text-gold/70 shrink-0" aria-hidden="true" />
  </button>
);

/** Fila seleccionable tipo radio. */
export const RosaryRadioRow = ({
  icon,
  label,
  hint,
  selected,
  onSelect,
}: {
  icon?: ReactNode;
  label: string;
  hint?: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={`w-full rounded-2xl px-4 py-3 flex items-center gap-3 text-left transition border ${
      selected
        ? "border-[hsl(var(--gold)/0.7)] bg-[hsl(var(--gold)/0.1)]"
        : "border-[hsl(var(--gold)/0.15)] bg-secondary/40 hover:border-[hsl(var(--gold)/0.4)]"
    }`}
  >
    {icon && <span className="text-gold/90 shrink-0">{icon}</span>}
    <span className="min-w-0 flex-1">
      <span className="block text-sm">{label}</span>
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </span>
    <span
      className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${
        selected ? "border-gold bg-gradient-gold" : "border-[hsl(var(--gold)/0.4)]"
      }`}
    >
      {selected && <Check className="h-3 w-3 text-navy-deep" aria-hidden="true" />}
    </span>
  </button>
);

/** Interruptor con estética dorada. */
export const RosarySwitchRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between gap-3 min-h-12 border-b border-[hsl(var(--gold)/0.1)] last:border-0">
    <span className="text-sm">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 shrink-0 rounded-full transition relative ${
        checked ? "bg-gradient-gold" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-navy-deep transition-all ${
          checked ? "left-[1.4rem]" : "left-0.5"
        }`}
      />
    </button>
  </div>
);

/** Fila de valor con opciones cíclicas (Voz, Texto…). */
export const RosaryValueRow = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (v: T) => void;
}) => {
  const current = options.find((o) => o.id === value) ?? options[0];
  const cycle = () => {
    const i = options.findIndex((o) => o.id === current.id);
    onChange(options[(i + 1) % options.length].id);
  };
  return (
    <button
      type="button"
      onClick={cycle}
      className="w-full flex items-center justify-between gap-3 min-h-12 border-b border-[hsl(var(--gold)/0.1)] last:border-0 text-left"
    >
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-1 text-sm text-muted-foreground">
        {current.label}
        <ChevronRight className="h-4 w-4 text-gold/70" aria-hidden="true" />
      </span>
    </button>
  );
};

/** Deslizador dorado con porcentaje. */
export const RosarySliderRow = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="py-2">
    <div className="flex items-center justify-between text-sm">
      <label htmlFor={id}>{label}</label>
      <span className="text-gold text-xs">{Math.round(value * 100)}%</span>
    </div>
    <input
      id={id}
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="mt-2 w-full accent-[hsl(var(--gold))]"
    />
  </div>
);