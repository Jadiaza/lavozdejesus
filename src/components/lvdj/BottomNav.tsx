import { Home, Radio, HandHeart, CalendarRange, MoreHorizontal } from "lucide-react";

const items = [
  { icon: Home, label: "Inicio", active: true },
  { icon: Radio, label: "Radio" },
  { icon: HandHeart, label: "Oración" },
  { icon: CalendarRange, label: "Programas" },
  { icon: MoreHorizontal, label: "Más" },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 inset-x-0 z-50">
    <div className="mx-auto max-w-md">
      <div className="glass border-t border-[hsl(var(--gold)/0.2)] px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end justify-around">
          {items.map((it) => (
            <button
              key={it.label}
              className="flex flex-col items-center gap-1 px-2 py-1 min-w-[56px]"
            >
              <it.icon
                className={`h-5 w-5 ${
                  it.active ? "text-gold" : "text-foreground/55"
                }`}
                strokeWidth={it.active ? 2 : 1.6}
              />
              <span
                className={`text-[10px] ${
                  it.active ? "text-gold font-medium" : "text-foreground/55"
                }`}
              >
                {it.label}
              </span>
              {it.active && (
                <span className="h-0.5 w-5 rounded-full bg-gradient-gold -mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  </nav>
);