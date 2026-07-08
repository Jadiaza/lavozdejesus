import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { BottomNav } from "@/components/lvdj/BottomNav";

interface Props {
  title?: string;
  children: ReactNode;
  back?: string;
}

export const BibliaLayout = ({ title, children, back }: Props) => {
  const loc = useLocation();
  const isHome = loc.pathname === "/biblia" || loc.pathname === "/Biblia";

  return (
    <div className="min-h-screen bg-navy-deep pb-24 text-foreground">
      <header className="sticky top-0 z-40 glass border-b border-[hsl(var(--gold)/0.15)]">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          {!isHome && (
            <Link
              to={back ?? "/biblia"}
              className="glass gold-border flex h-9 w-9 items-center justify-center rounded-full transition hover:text-gold"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold">
              <BookOpen className="h-4 w-4 text-navy-deep" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-gold/80">
                La Voz de Jesús
              </div>
              <div className="font-display text-lg leading-none">
                {title ?? "Biblia"}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 pb-8 pt-4">{children}</main>
      <BottomNav activeLabel="Biblia" />
    </div>
  );
};
