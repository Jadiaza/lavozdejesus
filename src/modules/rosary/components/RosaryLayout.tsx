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

      <header className="sticky top-0 z-40 shrink-0 border-b border-gold/15 bg-navy-deep/95 backdrop-blur-xl">
        <div
          className={`mx-auto flex min-h-[88px] w-full items-center gap-4 px-4 py-3 ${maxWidth}`}
        >
          <Link
            to={back}
            aria-label="Volver"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold bg-navy-deep text-foreground transition hover:bg-gold/10 hover:text-gold active:scale-95"
          >
            <ArrowLeft
              className="h-6 w-6"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
              Santo Rosario
            </p>

            <h1 className="mt-1 truncate font-display text-2xl font-semibold leading-none text-foreground">
              {title}
            </h1>

            {subtitle ? (
              <p className="mt-1 truncate text-xs font-medium text-gold/80">
                {subtitle}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      </header>

      <main
        className={`
          relative z-10 mx-auto w-full
          ${maxWidth}
          ${
            fullScreen
              ? "min-h-0 flex-1 overflow-hidden px-3.5 py-3"
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