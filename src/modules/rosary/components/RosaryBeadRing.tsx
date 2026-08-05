import type { RosaryBead, RosarySection } from "../types";

interface Props {
  section: RosarySection;
  currentBeadId: string | null;
  onSelect: (beadIndex: number) => void;
}

const sizeFor = (t: RosaryBead["type"]) =>
  t === "large" || t === "medal" || t === "cross" ? "h-4 w-4" : t === "small" ? "h-3 w-3" : "h-2.5 w-2.5";

/** Cuentas de la sección actual. Colores derivados de la paleta del misterio. */
export const RosaryBeadRing = ({ section, currentBeadId, onSelect }: Props) => {
  const currentIndex = section.beads.findIndex((b) => b.id === currentBeadId);
  return (
    <ul className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Cuentas del rosario">
      {section.beads.map((b, i) => {
        const done = currentIndex > i;
        const active = currentIndex === i;
        const color = active ? b.activeColor : done ? b.completedColor : b.baseColor;
        return (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={b.label}
              aria-current={active ? "step" : undefined}
              className={`rounded-full transition-transform ${sizeFor(b.type)} ${
                active ? "scale-150 ring-2 ring-[hsl(var(--gold)/0.6)]" : done ? "opacity-90" : "opacity-40"
              }`}
              style={{ backgroundColor: `hsl(${color})` }}
            />
          </li>
        );
      })}
    </ul>
  );
};