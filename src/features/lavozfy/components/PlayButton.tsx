import { Play, Pause } from "lucide-react";
import { cn } from "../lib/cn";

export const PlayButton = ({
  playing, onClick, size = "md", className,
}: { playing?: boolean; onClick?: (e: React.MouseEvent) => void; size?: "sm" | "md" | "lg"; className?: string }) => {
  const dim = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const icon = size === "lg" ? 22 : size === "sm" ? 14 : 18;
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full grid place-items-center bg-[hsl(var(--lv-green))] hover:bg-[hsl(var(--lv-green-hover))] text-black shadow-lg transition active:scale-95",
        dim, className,
      )}
      aria-label={playing ? "Pausar" : "Reproducir"}
    >
      {playing ? <Pause width={icon} height={icon} className="fill-current" /> : <Play width={icon} height={icon} className="fill-current ml-0.5" />}
    </button>
  );
};