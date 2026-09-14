import { useId, useMemo } from "react";
import type { RosaryBead, RosaryDefinition } from "../types";

interface Props {
  definition: RosaryDefinition;
  currentOrder: number;
  centerImage: string;
  onSelectOrder: (order: number) => void;
}

type Point = { x: number; y: number };

const organicRingPosition = (index: number, total: number): Point => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const horizontal = 142 + Math.sin(angle * 2) * 13 + Math.cos(angle * 5) * 4;
  const vertical = 178 + Math.cos(angle * 2) * 10 + Math.sin(angle * 3) * 5;
  const x = 200 + Math.cos(angle) * horizontal + Math.sin(angle * 3) * 5;
  const y = 220 + Math.sin(angle) * vertical + Math.cos(angle) * 9;
  return { x, y };
};

const beadRadius = (bead: RosaryBead) => (bead.type === "large" ? 12.5 : 8.7);

/** Camándula SVG funcional: cada cuenta visible corresponde a una cuenta real del Rosario. */
export const RosaryFullRing = ({ definition, currentOrder, centerImage, onSelectOrder }: Props) => {
  const uid = useId().replace(/:/g, "");

  const decadeSections = definition.sections.filter((section) => section.type === "decade");
  const ringBeads = decadeSections
    .flatMap((section) => section.beads)
    .filter((bead) => bead.type === "small" || bead.type === "large");

  const openingBeads =
    definition.sections
      .find((section) => section.type === "opening")
      ?.beads.filter((bead) => ["cross", "medal", "large", "small"].includes(bead.type)) ?? [];

  const openingCross = openingBeads.find((bead) => bead.type === "cross");
  const openingMedal = openingBeads.find((bead) => bead.type === "medal");
  const openingPrayerBeads = openingBeads.filter((bead) => bead.type === "small" || bead.type === "large");

  const ringPoints = useMemo(
    () => ringBeads.map((_, index) => organicRingPosition(index, ringBeads.length)),
    [ringBeads],
  );

  const activate = (bead: RosaryBead) => onSelectOrder(bead.order);
  const aveCount = ringBeads.filter((bead) => bead.type === "small").length;
  const paterCount = ringBeads.filter((bead) => bead.type === "large").length;

  return (
    <figure
      className="relative mx-auto flex h-full w-full max-w-[28rem] flex-col items-center justify-center"
      aria-label={`${definition.title}. Camándula interactiva con cuentas reales.`}
    >
      <div className="mb-1 shrink-0 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#cfa14a]/80">
          {decadeSections.length} decenas · {aveCount} Avemarías · {paterCount} Padrenuestros
        </p>
      </div>

      <svg
        viewBox="0 0 400 690"
        className="min-h-0 w-full flex-1 overflow-visible drop-shadow-[0_22px_32px_rgba(0,0,0,0.45)]"
        role="group"
        aria-label="Cuentas del Rosario completo"
      >
        <defs>
          <radialGradient id={`${uid}-wood`} cx="28%" cy="22%">
            <stop offset="0" stopColor="#d39b61" />
            <stop offset="0.18" stopColor="#9b5f31" />
            <stop offset="0.5" stopColor="#603418" />
            <stop offset="0.8" stopColor="#2d160b" />
            <stop offset="1" stopColor="#120805" />
          </radialGradient>
          <radialGradient id={`${uid}-gold`} cx="30%" cy="24%">
            <stop offset="0" stopColor="#fff6bc" />
            <stop offset="0.22" stopColor="#f6d66b" />
            <stop offset="0.56" stopColor="#c58b24" />
            <stop offset="0.82" stopColor="#74420b" />
            <stop offset="1" stopColor="#2f1904" />
          </radialGradient>
          <linearGradient id={`${uid}-cord`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6d3d16" />
            <stop offset="0.5" stopColor="#d39b3d" />
            <stop offset="1" stopColor="#4a260d" />
          </linearGradient>
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0a6" />
            <stop offset="0.3" stopColor="#d69c31" />
            <stop offset="0.7" stopColor="#7a470e" />
            <stop offset="1" stopColor="#2f1804" />
          </linearGradient>
          <filter id={`${uid}-shadow`} x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.2" floodColor="#000" floodOpacity=".72" />
          </filter>
          <filter id={`${uid}-glow`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id={`${uid}-medal-image`}>
            <ellipse cx="200" cy="478" rx="27" ry="35" />
          </clipPath>
        </defs>

        <g stroke={`url(#${uid}-cord)`} strokeWidth="4" strokeLinecap="round" opacity=".88">
          {ringPoints.map((point, index) => {
            const next = ringPoints[(index + 1) % ringPoints.length];
            return <line key={`cord-${index}`} x1={point.x} y1={point.y} x2={next.x} y2={next.y} />;
          })}
        </g>

        {ringBeads.map((bead, index) => {
          const point = ringPoints[index];
          const completed = bead.order < currentOrder;
          const active = bead.order === currentOrder;
          const radius = beadRadius(bead);
          const fill = completed || active ? `url(#${uid}-gold)` : `url(#${uid}-wood)`;

          return (
            <g
              key={bead.id}
              role="button"
              tabIndex={0}
              aria-label={bead.label}
              aria-current={active ? "step" : undefined}
              onClick={() => activate(bead)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  activate(bead);
                }
              }}
              className="cursor-pointer outline-none"
              filter={`url(#${uid}-shadow)`}
            >
              {active ? (
                <circle cx={point.x} cy={point.y} r={radius + 8} fill="#f5b82f" opacity=".26" filter={`url(#${uid}-glow)`} />
              ) : null}
              <circle
                cx={point.x}
                cy={point.y}
                r={radius}
                fill={fill}
                stroke={active ? "#ffe48a" : completed ? "#d8a23a" : "#74421f"}
                strokeWidth={active ? 2.8 : 1.25}
              />
              <ellipse
                cx={point.x - radius * 0.28}
                cy={point.y - radius * 0.32}
                rx={Math.max(1.8, radius * 0.23)}
                ry={Math.max(1.3, radius * 0.17)}
                fill="#fff5d2"
                opacity={completed || active ? ".58" : ".32"}
              />
              <path
                d={`M ${point.x - radius * 0.52} ${point.y + radius * 0.2} Q ${point.x} ${point.y + radius * 0.5} ${point.x + radius * 0.55} ${point.y + radius * 0.12}`}
                fill="none"
                stroke="#2a1107"
                strokeWidth=".7"
                opacity=".38"
              />
            </g>
          );
        })}

        <path d="M200 398 C201 420 198 432 200 443" fill="none" stroke={`url(#${uid}-cord)`} strokeWidth="5" strokeLinecap="round" />

        <g
          role="button"
          tabIndex={0}
          aria-label={openingMedal?.label ?? "Medalla"}
          aria-current={openingMedal?.order === currentOrder ? "step" : undefined}
          onClick={() => openingMedal && activate(openingMedal)}
          onKeyDown={(event) => {
            if (openingMedal && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              activate(openingMedal);
            }
          }}
          className="cursor-pointer outline-none"
          filter={`url(#${uid}-shadow)`}
        >
          <ellipse cx="200" cy="478" rx="31" ry="40" fill={`url(#${uid}-metal)`} stroke="#e1ae4b" strokeWidth="2" />
          <image href={centerImage} x="173" y="443" width="54" height="70" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${uid}-medal-image)`} opacity=".9" />
          <ellipse cx="200" cy="478" rx="27" ry="35" fill="none" stroke="#f4cd72" strokeWidth="1.4" opacity=".9" />
        </g>

        {openingPrayerBeads.map((bead, index) => {
          const x = 200 + (index % 2 === 0 ? -2 : 2);
          const y = 535 + index * 29;
          const completed = bead.order < currentOrder;
          const active = bead.order === currentOrder;
          const radius = bead.type === "large" ? 12.5 : 8.7;
          return (
            <g key={bead.id}>
              <line x1="200" y1={y - 23} x2="200" y2={y + 22} stroke={`url(#${uid}-cord)`} strokeWidth="4" strokeLinecap="round" />
              <g
                role="button"
                tabIndex={0}
                aria-label={bead.label}
                aria-current={active ? "step" : undefined}
                onClick={() => activate(bead)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activate(bead);
                  }
                }}
                className="cursor-pointer outline-none"
                filter={`url(#${uid}-shadow)`}
              >
                {active ? <circle cx={x} cy={y} r={radius + 7} fill="#f5b82f" opacity=".25" filter={`url(#${uid}-glow)`} /> : null}
                <circle cx={x} cy={y} r={radius} fill={`url(#${uid}-${completed || active ? "gold" : "wood"})`} stroke={active ? "#ffe48a" : "#8e5725"} strokeWidth={active ? 2.8 : 1.2} />
                <ellipse cx={x - radius * .25} cy={y - radius * .3} rx={Math.max(1.5, radius * .2)} ry={Math.max(1.1, radius * .15)} fill="#fff1c2" opacity=".45" />
              </g>
            </g>
          );
        })}

        <path d="M200 622 V630" stroke={`url(#${uid}-cord)`} strokeWidth="4" strokeLinecap="round" />
        <g
          transform="translate(200 640)"
          role="button"
          tabIndex={0}
          aria-label={openingCross?.label ?? "Crucifijo"}
          aria-current={openingCross?.order === currentOrder ? "step" : undefined}
          onClick={() => openingCross && activate(openingCross)}
          onKeyDown={(event) => {
            if (openingCross && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              activate(openingCross);
            }
          }}
          className="cursor-pointer outline-none"
          filter={`url(#${uid}-shadow)`}
        >
          <path d="M-12 -34 H12 V-19 H29 V3 H12 V34 H-12 V3 H-29 V-19 H-12 Z" fill={`url(#${uid}-metal)`} stroke="#f0c35c" strokeWidth="2" />
          <path d="M0 -24 V24 M-8 -8 Q0 -1 8 -8 M-7 12 Q0 18 7 12" fill="none" stroke="#321805" strokeWidth="2" strokeLinecap="round" opacity=".9" />
        </g>
      </svg>

      <figcaption className="sr-only">
        La corona muestra cinco decenas con cincuenta Avemarías y cinco Padrenuestros. El ramal inicial conserva el Padrenuestro y las tres Avemarías. Cada cuenta es interactiva y corresponde a un paso real de la oración.
      </figcaption>
    </figure>
  );
};
