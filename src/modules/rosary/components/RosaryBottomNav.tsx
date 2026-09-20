import { BookOpen, Home, PlayCircle, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const ITEMS = [
  { label: "Inicio", to: "/", icon: Home, match: (path: string) => path === "/" },
  {
    label: "Rosario",
    to: "/rosario",
    match: (path: string) => path === "/rosario",
  },
  {
    label: "Misterios",
    to: "/rosario/misterios",
    icon: BookOpen,
    match: (path: string) =>
      path === "/rosario/misterios" || path === "/rosario/seleccionar-misterios",
  },
  {
    label: "Rezar",
    to: "/rosario/modalidad",
    icon: PlayCircle,
    match: (path: string) =>
      [
        "/rosario/modalidad",
        "/rosario/intencion",
        "/rosario/digital",
        "/rosario/fisico",
        "/rosario/audio",
      ].includes(path),
  },
  {
    label: "Ajustes",
    to: "/rosario/configuracion",
    icon: Settings,
    match: (path: string) =>
      [
        "/rosario/configuracion",
        "/rosario/descargas",
        "/rosario/diario",
        "/rosario/informacion",
      ].includes(path),
  },
];

/** Navegación inferior propia del módulo Santo Rosario. */
export const RosaryBottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Navegación del Santo Rosario"
      className="fixed inset-x-3 bottom-[max(0.45rem,env(safe-area-inset-bottom))] z-50 mx-auto w-auto max-w-[406px] rounded-[1.4rem] border border-gold/20 bg-navy-deep/95 px-1 pb-2 pt-2.5 shadow-[0_18px_45px_rgba(0,0,0,0.5)] backdrop-blur-xl"
    >
      <div className="flex items-end justify-around px-1">
        {ITEMS.map((item) => {
          const active = item.match(pathname);

          return (
            <Link
              key={item.label}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-1 font-display transition ${
                active ? "text-gold-bright" : "text-foreground/55 hover:text-gold/85"
              }`}
            >
              {active ? (
                <span className="absolute -bottom-[0.7rem] h-0.5 w-12 rounded-full bg-gold-bright shadow-[0_0_16px_hsl(var(--gold)/0.8)]" />
              ) : null}

              {item.label === "Rosario" ? (
                <img
                  src="/icons/rosario.png"
                  alt=""
                  className={`h-7 w-7 object-contain ${active ? "" : "opacity-55"}`}
                  aria-hidden="true"
                />
              ) : item.icon ? (
                <item.icon className="h-7 w-7" strokeWidth={1.45} aria-hidden="true" />
              ) : null}

              <span className="text-[11px] min-[390px]:text-[12px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default RosaryBottomNav;
