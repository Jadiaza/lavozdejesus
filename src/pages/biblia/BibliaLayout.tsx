import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, CalendarCheck2, GraduationCap, Home, House } from "lucide-react";
import "./biblia-layout.css";

interface Props {
  title?: string;
  children: ReactNode;
  back?: string;
  headerAction?: ReactNode;
  hideHeader?: boolean;
  hideBottomNav?: boolean;
  hideBack?: boolean;
}

const BibliaBottomNav = () => {
  const loc = useLocation();
  const items = [
    { icon: House, label: "Inicio", to: "/", active: loc.pathname === "/" },
    { icon: Home, label: "Biblia", to: "/biblia", active: loc.pathname === "/biblia" || loc.pathname === "/Biblia" },
    { icon: BookOpen, label: "Leer", to: "/biblia/libros", active: loc.pathname.startsWith("/biblia/libros") || loc.pathname.startsWith("/biblia/leer") },
    { icon: GraduationCap, label: "Estudio", to: "/biblia/estudio", active: loc.pathname.startsWith("/biblia/estudio") },
    { icon: CalendarCheck2, label: "Planes", to: "/biblia/planes", active: loc.pathname.startsWith("/biblia/planes") },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[9998] w-full xl:hidden" aria-label="Navegación del módulo Biblia">
      <div className="mx-auto w-full max-w-[430px] border-t border-[#D4AF37]/25 bg-[#0B0E0C]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-end justify-around">
          {items.map((item) => (
            <Link key={item.label} to={item.to} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1">
              <item.icon className={`h-5 w-5 ${item.active ? "text-[#D4AF37]" : "text-[#A6A59F]"}`} strokeWidth={item.active ? 2 : 1.6} />
              <span className={`text-[10px] ${item.active ? "font-medium text-[#D4AF37]" : "text-[#A6A59F]"}`}>{item.label}</span>
              {item.active && <span className="h-0.5 w-5 rounded-full bg-[#D4AF37]" />}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export const BibliaLayout = ({ title, children, headerAction, hideHeader = false, hideBottomNav = false }: Props) => {
  const loc = useLocation();
  const isHome = loc.pathname === "/biblia" || loc.pathname === "/Biblia";

  return (
    <div className="biblia-layout-shell relative min-h-screen overflow-x-hidden bg-[#050505] pb-[calc(6rem+env(safe-area-inset-bottom))] text-[#F8F5EA]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(212,175,55,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(212,175,55,0.08),transparent_36%),linear-gradient(180deg,#050505_0%,#090909_52%,#050505_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />

      {!isHome && !hideHeader && (
        <header className="sticky top-0 z-40 border-b border-[#D4AF37]/15 bg-[#050505]/92 shadow-[0_14px_38px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mx-auto flex w-full items-center gap-3 px-4 py-3 sm:max-w-[640px] md:max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] via-[#D4AF37] to-[#9B7417] shadow-[0_0_22px_rgba(212,175,55,0.28)]">
                <BookOpen className="h-4 w-4 text-[#050505]" />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]/85">La Voz de Jesús</div>
                <div className="font-display text-lg leading-none text-[#F8F5EA]">{title ?? "Biblia"}</div>
              </div>
            </div>
            {headerAction && <div className="ml-auto flex items-center">{headerAction}</div>}
          </div>
        </header>
      )}

      <main className={`biblia-layout-content relative z-10 mx-auto w-full px-3 pb-8 sm:max-w-[640px] sm:px-4 md:max-w-4xl md:px-6 ${isHome ? "pt-0" : "pt-3"}`}>{children}</main>
      {!hideBottomNav && <BibliaBottomNav />}
    </div>
  );
};
