import { useId } from "react";
import type { RosaryBead, RosaryDefinition } from "../types";

interface Props {
  definition: RosaryDefinition;
  currentOrder: number;
  centerImage: string;
  onSelectOrder: (order: number) => void;
}

const ringPosition = (index: number, total: number) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: 200 + Math.cos(angle) * 154, y: 192 + Math.sin(angle) * 154 };
};

const beadRadius = (bead: RosaryBead) => bead.type === "large" ? 10 : 7;

/** Camándula SVG funcional: cada cuenta representa y controla un paso real. */
export const RosaryFullRing = ({ definition, currentOrder, centerImage, onSelectOrder }: Props) => {
  const uid = useId().replace(/:/g, "");
  const ringBeads = definition.sections
    .filter((section) => section.type === "decade")
    .flatMap((section) => section.beads)
    .filter((bead) => bead.type === "small" || bead.type === "large");
  const openingBeads = definition.sections
    .find((section) => section.type === "opening")?.beads
    .filter((bead) => ["cross", "medal", "large", "small"].includes(bead.type)) ?? [];
  const openingCross = openingBeads.find((bead) => bead.type === "cross");
  const openingMedal = openingBeads.find((bead) => bead.type === "medal");

  const activate = (bead: RosaryBead) => onSelectOrder(bead.order);

  return (
    <figure className="relative mx-auto w-full max-w-[25rem]" aria-label={`${definition.title}. Camándula interactiva.`}>
      <svg viewBox="0 0 400 570" className="h-auto w-full overflow-visible" role="group" aria-label="Cuentas del Rosario completo">
        <defs>
          <radialGradient id={`${uid}-gold`} cx="30%" cy="25%">
            <stop offset="0" stopColor="#fff4ae" />
            <stop offset="0.28" stopColor="#f2c14f" />
            <stop offset="0.72" stopColor="#9a5c0a" />
            <stop offset="1" stopColor="#3c2103" />
          </radialGradient>
          <radialGradient id={`${uid}-dark`} cx="30%" cy="25%">
            <stop offset="0" stopColor="#71808b" />
            <stop offset="0.3" stopColor="#2b3943" />
            <stop offset="0.78" stopColor="#090f14" />
            <stop offset="1" stopColor="#020507" />
          </radialGradient>
          <filter id={`${uid}-glow`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id={`${uid}-portrait`}><circle cx="200" cy="192" r="78" /></clipPath>
        </defs>

        <ellipse cx="200" cy="192" rx="154" ry="154" fill="none" stroke="#9c6724" strokeWidth="3" strokeDasharray="2 5" opacity=".75" />

        {ringBeads.map((bead, index) => {
          const point = ringPosition(index, ringBeads.length);
          const completed = bead.order < currentOrder;
          const active = bead.order === currentOrder;
          const radius = beadRadius(bead);
          return (
            <g
              key={bead.id}
              role="button"
              tabIndex={0}
              aria-label={bead.label}
              aria-current={active ? "step" : undefined}
              onClick={() => activate(bead)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(bead); } }}
              className="cursor-pointer outline-none"
            >
              {active && <circle cx={point.x} cy={point.y} r={radius + 7} fill="none" stroke="#ffd762" strokeWidth="2" opacity=".9" filter={`url(#${uid}-glow)`} />}
              <circle cx={point.x} cy={point.y} r={radius} fill={`url(#${uid}-${completed || active ? "gold" : "dark"})`} stroke={completed || active ? "#f7ce68" : "#52616c"} strokeWidth="1.2" />
              <circle cx={point.x - radius * .28} cy={point.y - radius * .32} r={Math.max(1.3, radius * .2)} fill="#fff" opacity={completed || active ? ".62" : ".28"} />
            </g>
          );
        })}

        <circle cx="200" cy="192" r="84" fill="#07131e" stroke="#b77b25" strokeWidth="3" />
        <image href={centerImage} x="116" y="108" width="168" height="168" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${uid}-portrait)`} />
        <circle cx="200" cy="192" r="78" fill="none" stroke="#e4b64d" strokeWidth="2" />

        <path d="M200 346 V370" stroke="#c88b2b" strokeWidth="3" />
        <g role="button" tabIndex={0} aria-label={openingMedal?.label ?? "Medalla"} aria-current={openingMedal?.order === currentOrder ? "step" : undefined} onClick={() => openingMedal && activate(openingMedal)} onKeyDown={(event) => { if (openingMedal && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); activate(openingMedal); } }} className="cursor-pointer outline-none">
          <ellipse cx="200" cy="391" rx="22" ry="29" fill={`url(#${uid}-gold)`} stroke={openingMedal?.order === currentOrder ? "#fff4ae" : "#ffe080"} strokeWidth={openingMedal?.order === currentOrder ? 5 : 2} />
          <text x="200" y="399" textAnchor="middle" fontFamily="serif" fontSize="24" fill="#ffe99b">M</text>
        </g>

        {openingBeads.filter((bead) => bead.type === "small" || bead.type === "large").slice(0, 4).map((bead, index) => {
          const y = 435 + index * 27;
          const completed = bead.order < currentOrder;
          const active = bead.order === currentOrder;
          return <g key={bead.id} role="button" tabIndex={0} aria-label={bead.label} aria-current={active ? "step" : undefined} onClick={() => activate(bead)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(bead); } }} className="cursor-pointer outline-none"><line x1="200" y1={y - 18} x2="200" y2={y + 18} stroke="#c88b2b" strokeWidth="3" /><circle cx="200" cy={y} r={bead.type === "large" ? 10 : 8} fill={`url(#${uid}-${completed || active ? "gold" : "dark"})`} stroke={active ? "#fff0a0" : "#b77b25"} strokeWidth={active ? 3 : 1.2} /></g>;
        })}

        <g transform="translate(200 550)" role="button" tabIndex={0} aria-label={openingCross?.label ?? "Crucifijo"} aria-current={openingCross?.order === currentOrder ? "step" : undefined} onClick={() => openingCross && activate(openingCross)} onKeyDown={(event) => { if (openingCross && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); activate(openingCross); } }} className="cursor-pointer outline-none" stroke={openingCross?.order === currentOrder ? "#fff4ae" : "#e5ad3a"} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-10 -32 H10 V-17 H27 V2 H10 V30 H-10 V2 H-27 V-17 H-10 Z" strokeWidth="4" />
          <path d="M0 -25 V22 M-7 -7 Q0 -1 7 -7 M-6 11 Q0 17 6 11" strokeWidth="2" opacity=".85" />
        </g>
      </svg>
      <figcaption className="sr-only">Las cuentas doradas están completadas, las oscuras están pendientes y la cuenta iluminada es la actual. Selecciona cualquier cuenta para ir a esa oración.</figcaption>
    </figure>
  );
};
