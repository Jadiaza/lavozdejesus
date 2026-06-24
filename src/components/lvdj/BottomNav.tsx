/*
==============================================================================
PROYECTO: LA VOZ DE JESUS - PWA RADIO CATOLICA
COMPONENTE: BottomNav.tsx
VERSION: 1.2.0

DESCRIPCION:
Menu inferior fijo para la navegacion principal en dispositivos moviles.
==============================================================================
*/

import {
  CalendarRange,
  HandHeart,
  Home,
  MoreHorizontal,
  Radio,
} from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  { icon: Home, label: "Inicio", to: "/" },
  { icon: Radio, label: "Radio", to: "/radio" },
  { icon: HandHeart, label: "Oración", to: "/" },
  { icon: CalendarRange, label: "Programas", to: "/programacion" },
  { icon: MoreHorizontal, label: "Más", to: "/" },
];

export const BottomNav = ({
  activeLabel = "Inicio",
}: {
  activeLabel?: string;
}) => (
  <nav className="fixed inset-x-0 bottom-0 z-50 w-full max-w-full overflow-x-hidden xl:hidden">
    <div className="mx-auto w-full max-w-[430px]">
      <div className="glass border-t border-[hsl(var(--gold)/0.2)] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end justify-around">
          {items.map((item) => {
            const active = item.label === activeLabel;

            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => {
                  if (item.to === "/" || item.to === "/radio") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1"
              >
                <item.icon
                  className={`h-5 w-5 ${
                    active ? "text-gold" : "text-foreground/55"
                  }`}
                  strokeWidth={active ? 2 : 1.6}
                />
                <span
                  className={`text-[10px] ${
                    active ? "font-medium text-gold" : "text-foreground/55"
                  }`}
                >
                  {item.label}
                </span>
                {active && (
                  <span className="h-0.5 w-5 rounded-full bg-gradient-gold" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  </nav>
);
