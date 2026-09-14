import type { ReactNode } from "react";
import { RosaryBottomNav } from "./RosaryBottomNav";

interface Props {
  title: string;
  subtitle?: string;
  /** Se conserva por compatibilidad con las pantallas existentes; la navegación inferior sustituye el retroceso. */
  back?: string;
  actions?: ReactNode;
  children: ReactNode;
  focus?: boolean;
  /** La página ocupa la altura disponible y evita el desplazamiento. */
  fullScreen?: boolean;
  /** Reduce el encabezado para experiencias inmersivas que deben caber completas en una sola pantalla. */
  compactHeader?: boolean;
}

export const RosaryLayout = ({
  title,
  subtitle,
  actions,
  children,
  focus = false,
  fullScreen = false,
  compactHeader = false,
}: Props) => {
  const maxWidth = fullScreen
    ? "max-w-[430px]"
    : focus
      ? "max-w-2xl"
      : "max-w-4xl";

  return (
    <div
      className={`relative flex w-full flex-col overflow-x-hidden bg-navy-deep text-foreground ${
        fullScreen ? "h-dvh overflow-y-hidden" : "min-h-dvh"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-radial-gold opacity-20"
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 z-40 shrink-0 backdrop-blur-xl ${
          fullScreen
            ? "bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep/80"
            : "border-b border-gold/15 bg-navy-deep/95"
        }`}
      >
        <div
          className={`mx-auto flex w-full items-center gap-3 px-4 ${
            compactHeader
              ? "min-h-[62px] py-2"
              : fullScreen
                ? "min-h-[108px] pb-3 pt-4"
                : "min-h-[88px] py-3"
          } ${maxWidth}`}
        >
          <div className="min-w-0 flex-1">
            <p
              className={`truncate font-semibold uppercase text-gold ${
                compactHeader
                  ? "text-[8px] tracking-[0.28em]"
                  : fullScreen
                    ? "text-[10px] tracking-[0.34em]"
                    : "text-[11px] tracking-[0.25em]"
              }`}
            >
              La Voz de Jesús
            </p>

            <h1
              className={`mt-1 truncate font-display font-semibold leading-none text-foreground ${
                compactHeader
                  ? "text-[1.35rem] tracking-[-0.02em]"
                  : fullScreen
                    ? "text-[clamp(1.8rem,7.8vw,2.35rem)] tracking-[-0.025em]"
                    : "text-2xl"
              }`}
            >
              {title}
            </h1>

            {subtitle ? (
              <p
                className={`mt-1.5 truncate font-display text-gold/70 ${
                  compactHeader
                    ? "text-[0.7rem] tracking-wide"
                    : fullScreen
                      ? "text-[clamp(0.78rem,3.4vw,0.9rem)] tracking-wide"
                      : "text-xs"
                }`}
              >
                {subtitle}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </header>

      <main
        className={`
          relative z-10 mx-auto w-full
          ${maxWidth}
          ${
            fullScreen
              ? "h-0 min-h-0 flex-1 overflow-hidden px-0 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-0"
              : "px-4 pb-32 pt-4"
          }
        `}
      >
        {children}
      </main>

      <RosaryBottomNav />
    </div>
  );
};

export default RosaryLayout;
