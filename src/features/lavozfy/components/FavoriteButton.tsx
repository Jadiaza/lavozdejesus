import { Heart } from "lucide-react";
import { usePlayer } from "../state/playerStore";
import { cn } from "../lib/cn";

export const FavoriteButton = ({ trackId, size = 16, className }: { trackId: string; size?: number; className?: string }) => {
  const fav = usePlayer((s) => s.favorites.includes(trackId));
  const toggle = usePlayer((s) => s.toggleFavorite);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle(trackId); }}
      className={cn("p-1.5 rounded hover:bg-white/10 transition", className)}
      aria-label="Favorito"
    >
      <Heart width={size} height={size} className={fav ? "fill-[hsl(var(--lv-green))] text-[hsl(var(--lv-green))]" : "text-[hsl(var(--lv-text-muted))]"} />
    </button>
  );
};