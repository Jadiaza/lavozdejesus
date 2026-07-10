import {
  Shuffle, SkipBack, SkipForward, Repeat, Repeat1,
  Volume2, VolumeX, ListMusic, Maximize2, Heart,
} from "lucide-react";
import { usePlayer, currentTrack } from "../state/playerStore";
import { getArtist } from "../data/artists";
import { getAlbum } from "../data/albums";
import { formatDuration } from "../data/tracks";
import { PlayButton } from "./PlayButton";
import { SourceBadge } from "./SourceBadge";

export const PlayerBar = () => {
  const s = usePlayer();
  const t = currentTrack(s);
  if (!t) return null;
  const artist = getArtist(t.artistId);
  const album = getAlbum(t.albumId);
  const fav = s.favorites.includes(t.id);

  return (
    <div className="hidden md:flex items-center gap-4 h-20 px-4 border-t border-[color:var(--lv-border)] bg-[hsl(var(--lv-panel))]">
      {/* left */}
      <div className="flex items-center gap-3 w-72 min-w-0">
        {album && <img src={album.cover} alt="" className="h-12 w-12 rounded" />}
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{t.title}</div>
          <div className="text-xs text-[hsl(var(--lv-text-muted))] truncate flex items-center gap-2">
            {artist?.name} · <SourceBadge source={t.source} />
          </div>
        </div>
        <button onClick={() => s.toggleFavorite(t.id)} className="p-2 hover:bg-white/10 rounded" aria-label="Favorito">
          <Heart className={`h-4 w-4 ${fav ? "fill-[hsl(var(--lv-green))] text-[hsl(var(--lv-green))]" : "text-[hsl(var(--lv-text-muted))]"}`} />
        </button>
      </div>

      {/* center */}
      <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <button onClick={s.toggleShuffle} className={`p-1.5 rounded hover:bg-white/10 ${s.shuffle ? "text-[hsl(var(--lv-green))]" : "text-[hsl(var(--lv-text-muted))]"}`} aria-label="Aleatorio">
            <Shuffle className="h-4 w-4" />
          </button>
          <button onClick={s.prev} className="p-1.5 rounded hover:bg-white/10" aria-label="Anterior"><SkipBack className="h-4 w-4 fill-current" /></button>
          <PlayButton size="sm" playing={s.isPlaying} onClick={s.togglePlay} />
          <button onClick={s.next} className="p-1.5 rounded hover:bg-white/10" aria-label="Siguiente"><SkipForward className="h-4 w-4 fill-current" /></button>
          <button onClick={s.cycleRepeat} className={`p-1.5 rounded hover:bg-white/10 ${s.repeat !== "off" ? "text-[hsl(var(--lv-green))]" : "text-[hsl(var(--lv-text-muted))]"}`} aria-label="Repetir">
            {s.repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-lg">
          <span className="text-[10px] text-[hsl(var(--lv-text-muted))] tabular-nums w-8 text-right">{formatDuration(s.position)}</span>
          <input
            type="range" min={0} max={s.duration || t.duration} step={1} value={s.position}
            onChange={(e) => s.seek(Number(e.target.value))}
            className="flex-1 lv-range accent-[hsl(var(--lv-green))]"
          />
          <span className="text-[10px] text-[hsl(var(--lv-text-muted))] tabular-nums w-8">{formatDuration(s.duration || t.duration)}</span>
        </div>
      </div>

      {/* right */}
      <div className="flex items-center gap-1 w-72 justify-end">
        <button onClick={s.toggleQueue} className="p-1.5 rounded hover:bg-white/10" aria-label="Cola"><ListMusic className="h-4 w-4" /></button>
        <button onClick={s.toggleMute} className="p-1.5 rounded hover:bg-white/10" aria-label="Silenciar">
          {s.muted || s.volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <input
          type="range" min={0} max={1} step={0.01} value={s.muted ? 0 : s.volume}
          onChange={(e) => s.setVolume(Number(e.target.value))}
          className="w-24 accent-[hsl(var(--lv-green))]"
        />
        <button onClick={s.toggleFullscreen} className="p-1.5 rounded hover:bg-white/10" aria-label="Vista ampliada"><Maximize2 className="h-4 w-4" /></button>
      </div>
    </div>
  );
};