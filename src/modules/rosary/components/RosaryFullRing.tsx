import type { RosaryDefinition } from "../types";

interface Props {
  definition: RosaryDefinition;
  currentOrder: number;
  centerImage?: string | null;
  centerLabel?: string;
}

/**
 * Vista del rosario completo: las 59 cuentas dispuestas en círculo con la cruz
 * y la medalla, como una corona real. Indica cuentas pendientes, actual y
 * completadas.
 */
export const RosaryFullRing = ({ definition, currentOrder, centerImage, centerLabel }: Props) => {
  const beads = definition.sections
    .filter((s) => s.type !== "closing")
    .flatMap((s) => s.beads)
    .filter((b) => ["large", "small", "medal", "cross"].includes(b.type));

  const ringBeads = beads.filter((b) => b.type !== "cross" && b.type !== "medal");
  const total = ringBeads.length || 1;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,hsl(var(--gold)/0.12),transparent_65%)]" />
      {ringBeads.map((b, i) => {
        const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
        const radius = 45;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const done = b.order < currentOrder;
        const active = b.order === currentOrder;
        const big = b.type === "large";
        const color = active ? b.activeColor : done ? b.completedColor : b.baseColor;
        return (
          <span
            key={b.id}
            title={b.label}
            className={`absolute rounded-full transition-transform ${
              big ? "h-3.5 w-3.5" : "h-2.5 w-2.5"
            } ${active ? "scale-[1.9] ring-2 ring-[hsl(var(--gold)/0.7)]" : done ? "opacity-95" : "opacity-40"}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: `hsl(${color})`,
              boxShadow: active ? "0 0 14px hsl(var(--gold)/0.65)" : undefined,
            }}
          />
        );
      })}

      <div className="absolute inset-[22%] rounded-full overflow-hidden gold-border glass flex items-center justify-center">
        {centerImage ? (
          <img src={centerImage} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="px-3 text-center font-display text-sm text-gold">{centerLabel}</span>
        )}
      </div>

      <div className="absolute left-1/2 bottom-[-1.25rem] -translate-x-1/2 text-gold text-2xl leading-none" aria-hidden="true">
        ✝
      </div>
    </div>
  );
};

export const RosaryRingLegend = () => (
  <ul className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
    {[
      { label: "Pendiente", cls: "bg-muted" },
      { label: "Actual", cls: "bg-gradient-gold" },
      { label: "Completada", cls: "bg-[hsl(var(--gold)/0.55)]" },
    ].map((i) => (
      <li key={i.label} className="flex items-center gap-1.5">
        <span className={`h-2.5 w-2.5 rounded-full ${i.cls}`} />
        {i.label}
      </li>
    ))}
  </ul>
);