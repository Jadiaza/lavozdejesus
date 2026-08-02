import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { BottomNav } from "@/components/lvdj/BottomNav";

interface Props {
  title?: string;
  children: ReactNode;
  back?: string;
  headerAction?: ReactNode;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
}

export const BibliaLayout = ({ title, children, back, headerAction, hideHeader = false, hideBottomNav = false }: Props) => {
  const loc = useLocation();
  const isHome = loc.pathname === "/biblia" || loc.pathname === "/Biblia";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] pb-[calc(6rem+env(safe-area-inset-bottom))] text-[#F8F5EA]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(212,175,55,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(212,175,55,0.08),transparent_36%),linear-gradient(180deg,#050505_0%,#090909_52%,#050505_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />

      {!isHome && !hideHeader && (
        <header className="sticky top-0 z-40 border-b border-[#D4AF37]/15 bg-[#050505]/92 shadow-[0_14px_38px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[430px] items-center gap-3 px-4 py-3 md:max-w-4xl">
            <Link
              to={back ?? "/biblia"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#111111]/80 text-[#F2D27A] shadow-[0_0_20px_rgba(212,175,55,0.12)] transition hover:border-[#D4AF37]/60 hover:bg-[#171717]"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] via-[#D4AF37] to-[#9B7417] shadow-[0_0_22px_rgba(212,175,55,0.28)]">
                <BookOpen className="h-4 w-4 text-[#050505]" />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]/85">
                  La Voz de Jesús
                </div>
                <div className="font-display text-lg leading-none text-[#F8F5EA]">
                  {title ?? "Biblia"}
                </div>
              </div>
            </div>
            {headerAction && <div className="ml-auto flex items-center">{headerAction}</div>}
          </div>
        </header>
      )}

      <main
        className={`relative z-10 mx-auto w-full max-w-[430px] px-4 pb-8 md:max-w-4xl ${
          isHome ? "pt-0" : "pt-3"
        }`}
      >
        {children}
      </main>
      {!hideBottomNav && <BottomNav activeLabel="Biblia" />}
    </div>
  );
};
