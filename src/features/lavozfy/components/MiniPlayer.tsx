import { usePlayer, currentTrack } from "../state/playerStore";
import { getArtist } from "../data/artists";
import { getAlbum } from "../data/albums";
import { Play, Pause } from "lucide-react";

export const MiniPlayer = () => {
  const s = usePlayer();
  const t = currentTrack(s);
  if (!t) return null;
  const artist = getArtist(t.artistId);
  const album = getAlbum(t.albumId);
  const pct = ((s.position || 0) / (s.duration || t.duration)) * 100;
  return (
    <div
      className="md:hidden fixed left-2 right-2 bottom-16 z-30 rounded-lg bg-[hsl(var(--lv-panel))] border border-[color:var(--lv-border)] overflow-hidden active:scale-[0.99] transition"
      onClick={() => s.toggleFullscreen()}
    >
      <div className="flex items-center gap-3 p-2">
        {album && <img src={album.cover} alt="" className="h-10 w-10 rounded" />}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{t.title}</div>
          <div className="text-xs text-[hsl(var(--lv-text-muted))] truncate">{artist?.name}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); s.togglePlay(); }}
          className="h-9 w-9 grid place-items-center rounded-full bg-[hsl(var(--lv-green))] text-black"
          aria-label={s.isPlaying ? "Pausar" : "Reproducir"}
        >
          {s.isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
      </div>
      <div className="h-0.5 bg-white/5">
        <div className="h-full bg-[hsl(var(--lv-green))]" style={{ width: `${Math.min(100, pct || 0)}%` }} />
      </div>
    </div>
  );
};