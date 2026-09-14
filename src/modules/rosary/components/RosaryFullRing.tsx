import { useId, useMemo } from "react";
import type { RosaryBead, RosaryDefinition } from "../types";

interface Props {
  definition: RosaryDefinition;
  currentOrder: number;
  centerImage: string;
  onSelectOrder: (order: number) => void;
}

type Point = { x: number; y: number };
type Curve = { p0: Point; p1: Point; p2: Point; p3: Point };

const beadRadius = (bead: RosaryBead) => (bead.type === "large" ? 14.5 : 9.4);

const cubicPoint = (curve: Curve, t: number): Point => {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x:
      curve.p0.x * mt2 * mt +
      3 * curve.p1.x * mt2 * t +
      3 * curve.p2.x * mt * t2 +
      curve.p3.x * t2 * t,
    y:
      curve.p0.y * mt2 * mt +
      3 * curve.p1.y * mt2 * t +
      3 * curve.p2.y * mt * t2 +
      curve.p3.y * t2 * t,
  };
};

/**
 * Cinco trayectorias independientes, una por decena. La forma se inspira en una
 * camándula real apoyada sobre una superficie: pliegues, curvas y cruces visuales,
 * sin convertir la corona en un círculo u óvalo geométrico.
 */
const DECADE_CURVES: Curve[] = [
  {
    p0: { x: 300, y: 405 },
    p1: { x: 360, y: 350 },
    p2: { x: 346, y: 270 },
    p3: { x: 278, y: 246 },
  },
  {
    p0: { x: 266, y: 240 },
    p1: { x: 200, y: 215 },
    p2: { x: 115, y: 252 },
    p3: { x: 78, y: 205 },
  },
  {
    p0: { x: 76, y: 194 },
    p1: { x: 48, y: 142 },
    p2: { x: 112, y: 92 },
    p3: { x: 176, y: 122 },
  },
  {
    p0: { x: 187, y: 124 },
    p1: { x: 245, y: 154 },
    p2: { x: 330, y: 118 },
    p3: { x: 336, y: 72 },
  },
  {
    p0: { x: 324, y: 70 },
    p1: { x: 274, y: 36 },
    p2: { x: 170, y: 46 },
    p3: { x: 108, y: 88 },
  },
];

const pointsForDecade = (beads: RosaryBead[], curve: Curve): Point[] => {
  const weights = beads.map((bead, index) => {
    const previous = beads[index - 1];
    const next = beads[index + 1];
    return bead.type === "large" || previous?.type === "large" || next?.type === "large" ? 1.55 : 1;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let accumulated = 0;

  return beads.map((_, index) => {
    const t = total <= 1 ? 0 : Math.min(1, accumulated / (total - weights[weights.length - 1]));
    accumulated += weights[index];
    const point = cubicPoint(curve, t);
    const wobble = Math.sin((index + 1) * 1.73) * 2.3;
    return { x: point.x + wobble, y: point.y + Math.cos((index + 2) * 1.37) * 1.8 };
  });
};

/** Camándula SVG funcional: cada esfera visible corresponde a una cuenta real del Rosario. */
export const RosaryFullRing = ({ definition, currentOrder, centerImage, onSelectOrder }: Props) => {
  const uid = useId().replace(/:/g, "");

  const decadeSections = definition.sections.filter((section) => section.type === "decade");
  const decades = decadeSections.map((section) =>
    section.beads.filter((bead) => bead.type === "small" || bead.type === "large"),
  );

  const openingBeads =
    definition.sections
      .find((section) => section.type === "opening")
      ?.beads.filter((bead) => ["cross", "medal", "large", "small"].includes(bead.type)) ?? [];

  const openingCross = openingBeads.find((bead) => bead.type === "cross");
  const openingMedal = openingBeads.find((bead) => bead.type === "medal");
  const openingPrayerBeads = openingBeads.filter((bead) => bead.type === "small" || bead.type === "large");

  const decadePoints = useMemo(
    () => decades.map((beads, index) => pointsForDecade(beads, DECADE_CURVES[index] ?? DECADE_CURVES[0])),
    [decades],
  );

  const activate = (bead: RosaryBead) => onSelectOrder(bead.order);

  const renderBead = (bead: RosaryBead, point: Point, key: string) => {
    const completed = bead.order < currentOrder;
    const active = bead.order === currentOrder;
    const radius = beadRadius(bead);
    const fill = completed || active ? `url(#${uid}-gold)` : `url(#${uid}-wood)`;
    const hitRadius = bead.type === "large" ? 24 : 19;

    return (
      <g
        key={key}
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
      >
        <circle cx={point.x} cy={point.y} r={hitRadius} fill="transparent" />
        {active ? (
          <circle cx={point.x} cy={point.y} r={radius + 9} fill="#f5b82f" opacity=".28" filter={`url(#${uid}-glow)`} />
        ) : null}
        <g filter={`url(#${uid}-shadow)`}>
          <circle
            cx={point.x}
            cy={point.y}
            r={radius}
            fill={fill}
            stroke={active ? "#ffe48a" : completed ? "#d8a23a" : "#74421f"}
            strokeWidth={active ? 2.9 : 1.25}
          />
          <ellipse
            cx={point.x - radius * 0.28}
            cy={point.y - radius * 0.34}
            rx={Math.max(1.9, radius * 0.24)}
            ry={Math.max(1.35, radius * 0.17)}
            fill="#fff5d2"
            opacity={completed || active ? ".62" : ".36"}
          />
          <path
            d={`M ${point.x - radius * 0.52} ${point.y + radius * 0.18} Q ${point.x} ${point.y + radius * 0.5} ${point.x + radius * 0.55} ${point.y + radius * 0.08}`}
            fill="none"
            stroke="#281006"
            strokeWidth=".8"
            opacity=".42"
          />
        </g>
      </g>
    );
  };

  return (
    <figure
      className="relative mx-auto flex h-full w-full max-w-[31rem] flex-col items-center justify-center"
      aria-label={`${definition.title}. Camándula interactiva con cuentas reales.`}
    >
      <svg
        viewBox="0 0 400 720"
        className="min-h-0 w-full flex-1 overflow-visible drop-shadow-[0_24px_38px_rgba(0,0,0,0.54)]"
        role="group"
        aria-label="Rosario completo dispuesto de forma natural"
      >
        <defs>
          <radialGradient id={`${uid}-wood`} cx="28%" cy="20%">
            <stop offset="0" stopColor="#dda56b" />
            <stop offset="0.16" stopColor="#a56837" />
            <stop offset="0.46" stopColor="#6d3b1c" />
            <stop offset="0.78" stopColor="#34190c" />
            <stop offset="1" stopColor="#130805" />
          </radialGradient>
          <radialGradient id={`${uid}-gold`} cx="30%" cy="22%">
            <stop offset="0" stopColor="#fff6bd" />
            <stop offset="0.2" stopColor="#f8d96f" />
            <stop offset="0.54" stopColor="#c99028" />
            <stop offset="0.82" stopColor="#75430c" />
            <stop offset="1" stopColor="#2e1804" />
          </radialGradient>
          <linearGradient id={`${uid}-cord`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5b2f12" />
            <stop offset="0.44" stopColor="#c98d36" />
            <stop offset="0.72" stopColor="#7f4919" />
            <stop offset="1" stopColor="#3a1c09" />
          </linearGradient>
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0a6" />
            <stop offset="0.3" stopColor="#d69c31" />
            <stop offset="0.7" stopColor="#7a470e" />
            <stop offset="1" stopColor="#2f1804" />
          </linearGradient>
          <filter id={`${uid}-shadow`} x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="3.6" stdDeviation="3.5" floodColor="#000" floodOpacity=".78" />
          </filter>
          <filter id={`${uid}-glow`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="6.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id={`${uid}-medal-image`}>
            <ellipse cx="216" cy="520" rx="30" ry="39" />
          </clipPath>
        </defs>

        {/* Cada decena conserva su propio tramo de cordón y un espacio claro junto al Padrenuestro. */}
        {decades.map((beads, decadeIndex) => {
          const points = decadePoints[decadeIndex] ?? [];
          return (
            <g key={`decade-${decadeIndex}`}>
              <g stroke={`url(#${uid}-cord)`} strokeWidth="4.4" strokeLinecap="round" opacity=".96">
                {points.slice(0, -1).map((point, index) => {
                  const next = points[index + 1];
                  return <line key={`cord-${decadeIndex}-${index}`} x1={point.x} y1={point.y} x2={next.x} y2={next.y} />;
                })}
              </g>
              {beads.map((bead, index) => renderBead(bead, points[index], `${decadeIndex}-${bead.id}`))}
            </g>
          );
        })}

        {/* Enlaces visibles entre decenas para mantener una sola camándula física. */}
        <g stroke={`url(#${uid}-cord)`} strokeWidth="4.4" strokeLinecap="round" opacity=".92">
          {decadePoints.slice(0, -1).map((points, index) => {
            const nextPoints = decadePoints[index + 1];
            if (!points?.length || !nextPoints?.length) return null;
            const from = points[points.length - 1];
            const to = nextPoints[0];
            return <line key={`join-${index}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
          {decadePoints[4]?.length ? (
            <path d={`M ${decadePoints[4][decadePoints[4].length - 1].x} ${decadePoints[4][decadePoints[4].length - 1].y} C 96 140, 88 270, 146 394 C 168 432, 194 447, 216 463`} fill="none" />
          ) : null}
        </g>

        {/* Medalla y caída inferior, separadas de la zona táctil de las decenas. */}
        <path d="M216 463 C214 478 216 489 216 494" fill="none" stroke={`url(#${uid}-cord)`} strokeWidth="5" strokeLinecap="round" />
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
        >
          <ellipse cx="216" cy="520" rx="39" ry="49" fill="transparent" />
          <g filter={`url(#${uid}-shadow)`}>
            <ellipse cx="216" cy="520" rx="34" ry="43" fill={`url(#${uid}-metal)`} stroke="#e1ae4b" strokeWidth="2" />
            <image href={centerImage} x="186" y="481" width="60" height="78" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${uid}-medal-image)`} opacity=".93" />
            <ellipse cx="216" cy="520" rx="30" ry="39" fill="none" stroke="#f4cd72" strokeWidth="1.5" opacity=".92" />
          </g>
        </g>

        {/* Ramal inicial real: 1 Padrenuestro y 3 Avemarías. */}
        {openingPrayerBeads.map((bead, index) => {
          const y = 586 + index * 34;
          const x = 216 + (index === 1 ? -3 : index === 2 ? 3 : 0);
          const completed = bead.order < currentOrder;
          const active = bead.order === currentOrder;
          const radius = bead.type === "large" ? 14.5 : 9.4;
          const hitRadius = bead.type === "large" ? 24 : 19;
          return (
            <g key={bead.id}>
              <line x1="216" y1={y - 28} x2="216" y2={y + 27} stroke={`url(#${uid}-cord)`} strokeWidth="4.2" strokeLinecap="round" />
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
              >
                <circle cx={x} cy={y} r={hitRadius} fill="transparent" />
                {active ? <circle cx={x} cy={y} r={radius + 8} fill="#f5b82f" opacity=".27" filter={`url(#${uid}-glow)`} /> : null}
                <g filter={`url(#${uid}-shadow)`}>
                  <circle cx={x} cy={y} r={radius} fill={`url(#${uid}-${completed || active ? "gold" : "wood"})`} stroke={active ? "#ffe48a" : "#8e5725"} strokeWidth={active ? 2.8 : 1.2} />
                  <ellipse cx={x - radius * .25} cy={y - radius * .3} rx={Math.max(1.5, radius * .2)} ry={Math.max(1.1, radius * .15)} fill="#fff1c2" opacity=".46" />
                </g>
              </g>
            </g>
          );
        })}

        <path d="M216 681 V690" stroke={`url(#${uid}-cord)`} strokeWidth="4.2" strokeLinecap="round" />
        <g
          transform="translate(216 704)"
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
        >
          <rect x="-38" y="-45" width="76" height="90" fill="transparent" />
          <g filter={`url(#${uid}-shadow)`}>
            <path d="M-14 -35 H14 V-19 H32 V5 H14 V36 H-14 V5 H-32 V-19 H-14 Z" fill={`url(#${uid}-metal)`} stroke="#f0c35c" strokeWidth="2" />
            <path d="M0 -25 V26 M-9 -8 Q0 -1 9 -8 M-8 13 Q0 19 8 13" fill="none" stroke="#321805" strokeWidth="2" strokeLinecap="round" opacity=".9" />
          </g>
        </g>
      </svg>

      <figcaption className="sr-only">
        El Rosario completo conserva cinco decenas reales con cincuenta Avemarías y cinco Padrenuestros. Las decenas están dispuestas sobre curvas naturales, con áreas táctiles ampliadas para seleccionar cómodamente cada cuenta. El ramal inicial conserva un Padrenuestro, tres Avemarías, medalla y crucifijo.
      </figcaption>
    </figure>
  );
};
