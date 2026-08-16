import { BookOpen, Home, Radio, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

const ITEMS = [
  { label: "Inicio", to: "/", icon: Home },
  { label: "Radio", to: "/radio", icon: Radio },
  { label: "Biblia", to: "/biblia", icon: BookOpen },
  { label: "Rosario", to: "/rosario", active: true },
  { label: "Perfil", to: "/acceso", icon: UserRound },
];

/** Navegación inferior compartida por las portadas del Rosario. */
export const RosaryBottomNav = () => (
  <nav
    aria-label="Navegación principal"
    className="fixed inset-x-3 bottom-[max(0.45rem,env(safe-area-inset-bottom))] z-50 mx-auto w-auto max-w-[406px] rounded-[1.4rem] border border-gold/20 bg-navy-deep/90 px-1 pb-2 pt-2.5 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl"
  >
    <div className="flex items-end justify-around px-1">
      {ITEMS.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 font-display ${item.active ? "text-gold-bright" : "text-foreground/55"}`}
        >
          {item.active ? <span className="absolute -bottom-[0.7rem] h-0.5 w-12 rounded-full bg-gold-bright shadow-[0_0_16px_hsl(var(--gold)/0.8)]" /> : null}
          {item.active ? (
            <img src="/icons/rosario.png" alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
          ) : item.icon ? (
            <item.icon className="h-7 w-7" strokeWidth={1.45} aria-hidden="true" />
          ) : null}
          <span className="text-[12px]">{item.label}</span>
        </Link>
      ))}
    </div>
  </nav>
);

export default RosaryBottomNav;
