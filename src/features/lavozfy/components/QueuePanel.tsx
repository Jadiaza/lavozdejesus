import { usePlayer, currentTrack } from "../state/playerStore";
import { getArtist } from "../data/artists";
import { X } from "lucide-react";

export const QueuePanel = () => {
  const s = usePlayer();
  const t = currentTrack(s);
  if (!s.showQueue) return null;
  return (
    <div className="fixed top-14 right-0 bottom-20 md:bottom-24 w-80 bg-[hsl(var(--lv-panel))] border-l border-[color:var(--lv-border)] z-40 flex flex-col shadow-2xl">
      <div className="p-4 flex items-center justify-between border-b border-[color:var(--lv-border)]">
        <div className="font-semibold">Cola de reproducción</div>
        <button onClick={s.toggleQueue} className="p-1 rounded hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto lv-scroll p-2">
        {s.queue.map((track, idx) => {
          const artist = getArtist(track.artistId);
          const active = t?.id === track.id;
          return (
            <button key={track.id + idx}
              onClick={() => usePlayer.setState({ currentIndex: idx, position: 0, isPlaying: true })}
              className={`w-full flex items-center gap-3 p-2 rounded hover:bg-white/5 text-left ${active ? "text-[hsl(var(--lv-green))]" : ""}`}>
              <div className="text-xs w-5 text-right text-[hsl(var(--lv-text-muted))]">{idx + 1}</div>
              <div className="min-w-0">
                <div className="text-sm truncate">{track.title}</div>
                <div className="text-xs text-[hsl(var(--lv-text-muted))] truncate">{artist?.name}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};