import { useId, useMemo } from "react";
import type { RosaryBead, RosaryDefinition } from "../types";

interface Props {
  definition: RosaryDefinition;
  currentOrder: number;
  centerImage: string;
  onSelectOrder: (order: number) => void;
}

type Point = { x: number; y: number };

const beadRadius = (bead: RosaryBead) => (bead.type === "large" ? 13.6 : 8.5);

/**
 * Distribuye las cuentas con separación física visible.
 * Los espacios alrededor de cada Padrenuestro son mayores para que las cinco
 * decenas se lean como grupos reales de 10 Avemarías, no como un collar uniforme.
 */
const buildOrganicRingPoints = (beads: RosaryBead[]): Point[] => {
  if (!beads.length) return [];

  const gapWeights = beads.map((bead, index) => {
    const next = beads[(index + 1) % beads.length];
    const touchesLarge = bead.type === "large" || next.type === "large";
    return touchesLarge ? 1.82 : 1;
  });
  const totalWeight = gapWeights.reduce((sum, weight) => sum + weight, 0);

  let accumulated = 0;
  return beads.map((_, index) => {
    const angle = -Math.PI / 2 + (accumulated / totalWeight) * Math.PI * 2;
    accumulated += gapWeights[index];

    // Óvalo orgánico ligeramente asimétrico, con caída natural hacia la medalla.
    const sideWobble = Math.sin(angle * 3) * 5 + Math.cos(angle * 5) * 2.5;
    const verticalWobble = Math.cos(angle * 2) * 6 + Math.sin(angle * 4) * 3;
    const xRadius = 158 + sideWobble;
    const yRadius = 202 + verticalWobble;
    const bottomDrop = Math.max(0, Math.sin(angle)) * 9;

    return {
      x: 200 + Math.cos(angle) * xRadius,
      y: 222 + Math.sin(angle) * yRadius + bottomDrop,
    };
  });
};

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

  const ringPoints = useMemo(() => buildOrganicRingPoints(ringBeads), [ringBeads]);

  const activate = (bead: RosaryBead) => onSelectOrder(bead.order);

  return (
    <figure
      className="relative mx-auto flex h-full w-full max-w-[29rem] flex-col items-center justify-center"
      aria-label={`${definition.title}. Camándula interactiva con cuentas reales.`}
    >
      <svg
        viewBox="0 0 400 700"
        className="min-h-0 w-full flex-1 overflow-visible drop-shadow-[0_22px_34px_rgba(0,0,0,0.5)]"
        role="group"
        aria-label="Cuentas del Rosario completo"
      >
        <defs>
          <radialGradient id={`${uid}-wood`} cx="28%" cy="20%">
            <stop offset="0" stopColor="#dba36a" />
            <stop offset="0.16" stopColor="#a26535" />
            <stop offset="0.46" stopColor="#6b3a1b" />
            <stop offset="0.78" stopColor="#33180b" />
            <stop offset="1" stopColor="#140906" />
          </radialGradient>
          <radialGradient id={`${uid}-gold`} cx="30%" cy="22%">
            <stop offset="0" stopColor="#fff6bd" />
            <stop offset="0.2" stopColor="#f8d96f" />
            <stop offset="0.54" stopColor="#c99028" />
            <stop offset="0.82" stopColor="#75430c" />
            <stop offset="1" stopColor="#2e1804" />
          </radialGradient>
          <linearGradient id={`${uid}-cord`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5c3012" />
            <stop offset="0.44" stopColor="#c78a34" />
            <stop offset="0.72" stopColor="#7f4919" />
            <stop offset="1" stopColor="#3b1d0a" />
          </linearGradient>
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0a6" />
            <stop offset="0.3" stopColor="#d69c31" />
            <stop offset="0.7" stopColor="#7a470e" />
            <stop offset="1" stopColor="#2f1804" />
          </linearGradient>
          <filter id={`${uid}-shadow`} x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="3.5" stdDeviation="3.4" floodColor="#000" floodOpacity=".76" />
          </filter>
          <filter id={`${uid}-glow`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id={`${uid}-medal-image`}>
            <ellipse cx="200" cy="500" rx="27" ry="35" />
          </clipPath>
        </defs>

        {/* Cordón real visible entre cada una de las 55 cuentas de la corona. */}
        <g stroke={`url(#${uid}-cord)`} strokeWidth="4.2" strokeLinecap="round" opacity=".94">
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
                <circle cx={point.x} cy={point.y} r={radius + 8.5} fill="#f5b82f" opacity=".27" filter={`url(#${uid}-glow)`} />
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
                cx={point.x - radius * 0.29}
                cy={point.y - radius * 0.33}
                rx={Math.max(1.8, radius * 0.23)}
                ry={Math.max(1.3, radius * 0.17)}
                fill="#fff5d2"
                opacity={completed || active ? ".6" : ".34"}
              />
              <path
                d={`M ${point.x - radius * 0.5} ${point.y + radius * 0.18} Q ${point.x} ${point.y + radius * 0.48} ${point.x + radius * 0.54} ${point.y + radius * 0.1}`}
                fill="none"
                stroke="#281006"
                strokeWidth=".75"
                opacity=".42"
              />
            </g>
          );
        })}

        {/* Caída desde la corona hacia la medalla. */}
        <path d="M200 433 C198 450 202 462 200 470" fill="none" stroke={`url(#${uid}-cord)`} strokeWidth="5" strokeLinecap="round" />

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
          <ellipse cx="200" cy="500" rx="31" ry="40" fill={`url(#${uid}-metal)`} stroke="#e1ae4b" strokeWidth="2" />
          <image href={centerImage} x="173" y="465" width="54" height="70" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${uid}-medal-image)`} opacity=".92" />
          <ellipse cx="200" cy="500" rx="27" ry="35" fill="none" stroke="#f4cd72" strokeWidth="1.4" opacity=".9" />
        </g>

        {/* Ramal inicial: 1 Padrenuestro + 3 Avemarías reales. */}
        {openingPrayerBeads.map((bead, index) => {
          const y = 558 + index * 31;
          const x = 200 + (index === 1 ? -2 : index === 2 ? 2 : 0);
          const completed = bead.order < currentOrder;
          const active = bead.order === currentOrder;
          const radius = bead.type === "large" ? 13.2 : 8.8;
          return (
            <g key={bead.id}>
              <line x1="200" y1={y - 25} x2="200" y2={y + 24} stroke={`url(#${uid}-cord)`} strokeWidth="4" strokeLinecap="round" />
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
                {active ? <circle cx={x} cy={y} r={radius + 7.5} fill="#f5b82f" opacity=".25" filter={`url(#${uid}-glow)`} /> : null}
                <circle cx={x} cy={y} r={radius} fill={`url(#${uid}-${completed || active ? "gold" : "wood"})`} stroke={active ? "#ffe48a" : "#8e5725"} strokeWidth={active ? 2.8 : 1.2} />
                <ellipse cx={x - radius * .25} cy={y - radius * .3} rx={Math.max(1.5, radius * .2)} ry={Math.max(1.1, radius * .15)} fill="#fff1c2" opacity=".46" />
              </g>
            </g>
          );
        })}

        <path d="M200 654 V663" stroke={`url(#${uid}-cord)`} strokeWidth="4" strokeLinecap="round" />
        <g
          transform="translate(200 676)"
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
          <path d="M-12 -32 H12 V-18 H29 V3 H12 V31 H-12 V3 H-29 V-18 H-12 Z" fill={`url(#${uid}-metal)`} stroke="#f0c35c" strokeWidth="2" />
          <path d="M0 -23 V22 M-8 -8 Q0 -1 8 -8 M-7 11 Q0 17 7 11" fill="none" stroke="#321805" strokeWidth="2" strokeLinecap="round" opacity=".9" />
        </g>
      </svg>

      <figcaption className="sr-only">
        La corona muestra cinco decenas con cincuenta Avemarías y cinco Padrenuestros. Los Padrenuestros están visualmente separados para distinguir cada decena. El ramal inicial conserva un Padrenuestro y tres Avemarías, seguido por el crucifijo. Cada cuenta es interactiva y corresponde a un paso real de la oración.
      </figcaption>
    </figure>
  );
};
