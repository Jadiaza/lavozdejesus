import type { ReactNode } from "react";
import { ArrowLeft, Headphones, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/lvdj/BottomNav";

interface PodcastLayoutProps {
  children: ReactNode;
  backTo?: string;
}

export default function PodcastLayout({ children, backTo }: PodcastLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] pb-[calc(6rem+env(safe-area-inset-bottom))] text-[#F8F5EA]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(212,175,55,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(212,175,55,0.06),transparent_36%),linear-gradient(180deg,#050505_0%,#090909_52%,#050505_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />

      <header className="sticky top-0 z-40 border-b border-[#D4AF37]/12 bg-[#050505]/94 shadow-[0_12px_34px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="mx-auto flex h-[4.35rem] w-full max-w-[430px] items-center justify-between px-4 md:max-w-4xl">
          <div className="w-10">
            {backTo ? (
              <Link
                to={backTo}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#111111]/80 text-[#F2D27A] transition hover:border-[#D4AF37]/60"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/25 bg-[#111111]/70 text-[#D4AF37]">
                <Headphones className="h-5 w-5" strokeWidth={1.6} />
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[0.38em] text-[#D4AF37]/80">
              La Voz de Jesús
            </div>
            <div className="mt-0.5 font-display text-[1.35rem] font-semibold tracking-[0.16em] text-[#F8F5EA]">
              LVJPRAYER
            </div>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#111111]/75 text-[#F2D27A]"
            aria-label="Perfil"
          >
            <UserRound className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[430px] px-4 pb-8 md:max-w-4xl">
        {children}
      </main>

      <BottomNav activeLabel="Podcast" />
    </div>
  );
}
