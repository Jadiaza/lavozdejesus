import type { ReactNode } from "react";
import { ArrowLeft, Headphones, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/lvdj/BottomNav";
import bibleHero from "@/assets/lvj_biblia_home_hero_cruz_amanecer.png";

interface PodcastLayoutProps {
  children: ReactNode;
  backTo?: string;
}

export default function PodcastLayout({ children, backTo }: PodcastLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050505] pb-[calc(6rem+env(safe-area-inset-bottom))] text-[#F8F5EA]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(212,175,55,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(212,175,55,0.06),transparent_36%),linear-gradient(180deg,#050505_0%,#090909_52%,#050505_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />

      <header className="relative z-40 overflow-hidden border-b border-[#D4AF37]/12 bg-[#050505] shadow-[0_12px_34px_rgba(0,0,0,0.5)]">
        <img
          src={bibleHero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.32)_22%,rgba(0,0,0,0.08)_50%,rgba(0,0,0,0)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0)_100%)]" />

        <div className="relative mx-auto flex min-h-[7.4rem] w-full max-w-[430px] items-start justify-between gap-3 px-4 pb-5 pt-5 md:max-w-4xl">
          <div className="flex min-w-0 items-center gap-3">
            {backTo ? (
              <Link
                to={backTo}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] via-[#D4AF37] to-[#9B7417] text-[#050505] shadow-[0_0_26px_rgba(212,175,55,0.3)]"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.8} />
              </Link>
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] via-[#D4AF37] to-[#9B7417] shadow-[0_0_26px_rgba(212,175,55,0.3)]">
                <Headphones className="h-5 w-5 text-[#050505]" strokeWidth={1.8} />
              </span>
            )}

            <div className="min-w-0">
              <div className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                La Voz de Jesús
              </div>
              <h1 className="font-display text-[clamp(1.82rem,8.5vw,2.35rem)] leading-none text-[#F8F5EA] drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)]">
                LVJPRAYER
              </h1>
            </div>
          </div>

          <button
            type="button"
            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/70 bg-[#050505]/35 text-[#F2D27A] shadow-[0_0_18px_rgba(212,175,55,0.14)] backdrop-blur-sm"
            aria-label="Perfil"
          >
            <UserRound className="h-5 w-5" strokeWidth={1.7} />
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
