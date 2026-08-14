import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  back?: string;
  actions?: ReactNode;
  children: ReactNode;
  focus?: boolean;
  /** La página ocupa la altura disponible y evita el desplazamiento. */
  fullScreen?: boolean;
}

export const RosaryLayout = ({
  title,
  subtitle,
  back = "/rosario",
  actions,
  children,
  focus = false,
  fullScreen = false,
}: Props) => {
  const maxWidth = fullScreen
    ? "max-w-[430px]"
    : focus
      ? "max-w-2xl"
      : "max-w-4xl";

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-navy-deep text-foreground">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-radial-gold opacity-20"
        aria-hidden="true"
      />

      <header className={`sticky top-0 z-40 shrink-0 backdrop-blur-xl ${fullScreen ? "bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep/80" : "border-b border-gold/15 bg-navy-deep/95"}`}>
        <div
          className={`mx-auto flex w-full items-center gap-3 px-5 ${fullScreen ? "min-h-[104px] pb-3 pt-5" : "min-h-[88px] py-3"} ${maxWidth}`}
        >
          <Link
            to={back}
            aria-label="Volver"
            className={`flex shrink-0 items-center justify-center rounded-full text-gold transition hover:bg-gold/10 hover:text-gold-bright active:scale-95 ${fullScreen ? "h-11 w-11 border border-transparent bg-transparent" : "h-14 w-14 border border-gold bg-navy-deep"}`}
          >
            <ArrowLeft
              className="h-6 w-6"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <p className={`truncate font-semibold uppercase text-gold ${fullScreen ? "text-[10px] tracking-[0.34em]" : "text-[11px] tracking-[0.25em]"}`}>
              Santo Rosario
            </p>

            <h1 className={`mt-1 truncate font-display font-semibold leading-none text-foreground ${fullScreen ? "text-[1.7rem] tracking-[-0.02em]" : "text-2xl"}`}>
              {title}
            </h1>

            {subtitle ? (
              <p className={`mt-1 truncate font-medium text-gold/80 ${fullScreen ? "text-[11px] tracking-wide" : "text-xs"}`}>
                {subtitle}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {actions}
            </div>
          ) : fullScreen ? (
            <span className="h-11 w-11 shrink-0" aria-hidden="true" />
          ) : null}
        </div>
      </header>

      <main
        className={`
          relative z-10 mx-auto w-full
          ${maxWidth}
          ${
            fullScreen
              ? "min-h-0 flex-1 overflow-hidden px-0 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-0"
              : "px-4 pb-32 pt-4"
          }
        `}
      >
        {children}
      </main>
    </div>
  );
};

export default RosaryLayout;