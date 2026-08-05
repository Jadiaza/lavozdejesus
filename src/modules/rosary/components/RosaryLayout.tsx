import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  back?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** Modo rezo: sin distracciones, layout centrado y ancho reducido. */
  focus?: boolean;
}

export const RosaryLayout = ({ title, subtitle, back = "/rosario", actions, children, focus }: Props) => (
  <div className="min-h-dvh bg-navy-deep text-foreground">
    <header className="sticky top-0 z-40 glass border-b border-[hsl(var(--gold)/0.15)]">
      <div className={`mx-auto flex items-center gap-3 px-4 py-3 ${focus ? "max-w-2xl" : "max-w-4xl"}`}>
        <Link
          to={back}
          aria-label="Volver"
          className="h-11 w-11 shrink-0 rounded-full glass gold-border flex items-center justify-center hover:text-gold transition"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.28em] text-gold/80">Santo Rosario</div>
          <h1 className="font-display text-lg leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </div>
    </header>
    <main className={`mx-auto px-4 pb-28 pt-4 ${focus ? "max-w-2xl" : "max-w-4xl"}`}>{children}</main>
  </div>
);