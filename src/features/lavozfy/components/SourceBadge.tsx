import { Youtube, Music2 } from "lucide-react";
import type { TrackSource } from "../data/tracks";

export const SourceBadge = ({ source }: { source: TrackSource }) => (
  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-[hsl(var(--lv-text-muted))]">
    {source === "youtube" ? <Youtube className="h-3 w-3" /> : <Music2 className="h-3 w-3" />}
    {source === "youtube" ? "YouTube" : "Audio"}
  </span>
);