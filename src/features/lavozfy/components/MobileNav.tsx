import { NavLink } from "react-router-dom";
import { Home, Search, Compass, Library, User2 } from "lucide-react";

const items = [
  { to: "/musica", end: true, icon: Home, label: "Inicio" },
  { to: "/musica/buscar", icon: Search, label: "Buscar" },
  { to: "/musica/explorar", icon: Compass, label: "Explorar" },
  { to: "/musica/biblioteca", icon: Library, label: "Biblioteca" },
  { to: "/musica/perfil", icon: User2, label: "Perfil" },
];

export const MobileNav = () => (
  <nav className="fixed bottom-0 inset-x-0 z-40 bg-[hsl(var(--lv-sidebar))]/95 backdrop-blur border-t border-[color:var(--lv-border)]">
    <div className="grid grid-cols-5 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end as boolean | undefined}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] ${isActive ? "text-[hsl(var(--lv-green))]" : "text-[hsl(var(--lv-text-muted))]"}`
          }>
          <it.icon className="h-5 w-5" strokeWidth={1.6} />
          {it.label}
        </NavLink>
      ))}
    </div>
  </nav>
);