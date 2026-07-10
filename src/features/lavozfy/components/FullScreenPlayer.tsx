import { usePlayer, currentTrack } from "../state/playerStore";
import { getArtist } from "../data/artists";
import { getAlbum } from "../data/albums";
import { formatDuration } from "../data/tracks";
import { PlayButton } from "./PlayButton";
import { SourceBadge } from "./SourceBadge";
import { X, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, ListMusic } from "lucide-react";

export const FullScreenPlayer = () => {
  const s = usePlayer();
  const t = currentTrack(s);
  if (!s.fullscreen || !t) return null;
  const artist = getArtist(t.artistId);
  const album = getAlbum(t.albumId);
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {album && <img src={album.cover} alt="" className="w-full h-full object-cover blur-3xl scale-125 opacity-40" />}
        <div className="absolute inset-0 bg-[hsl(var(--lv-bg))]/80" />
      </div>
      <div className="p-4 flex items-center justify-between">
        <button onClick={s.toggleFullscreen} className="p-2 rounded-full hover:bg-white/10" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        <div className="text-xs uppercase tracking-widest text-[hsl(var(--lv-text-muted))]">Reproduciendo</div>
        <button onClick={s.toggleQueue} className="p-2 rounded-full hover:bg-white/10" aria-label="Cola"><ListMusic className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 pb-8 max-w-md mx-auto w-full">
        {album && <img src={album.cover} alt="" className="w-full max-w-xs aspect-square rounded-xl shadow-2xl" />}
        <div className="text-center">
          <div className="text-2xl font-semibold">{t.title}</div>
          <div className="text-sm text-[hsl(var(--lv-text-muted))] mt-1">{artist?.name} · {album?.title}</div>
          <div className="mt-2 flex justify-center"><SourceBadge source={t.source} /></div>
        </div>
        <div className="w-full">
          <input type="range" min={0} max={s.duration || t.duration} step={1} value={s.position}
            onChange={(e) => s.seek(Number(e.target.value))}
            className="w-full accent-[hsl(var(--lv-green))]" />
          <div className="flex justify-between text-[10px] text-[hsl(var(--lv-text-muted))] tabular-nums">
            <span>{formatDuration(s.position)}</span><span>{formatDuration(s.duration || t.duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={s.toggleShuffle} className={s.shuffle ? "text-[hsl(var(--lv-green))]" : "text-[hsl(var(--lv-text-muted))]"} aria-label="Aleatorio"><Shuffle className="h-5 w-5" /></button>
          <button onClick={s.prev} aria-label="Anterior"><SkipBack className="h-6 w-6 fill-current" /></button>
          <PlayButton size="lg" playing={s.isPlaying} onClick={s.togglePlay} />
          <button onClick={s.next} aria-label="Siguiente"><SkipForward className="h-6 w-6 fill-current" /></button>
          <button onClick={s.cycleRepeat} className={s.repeat !== "off" ? "text-[hsl(var(--lv-green))]" : "text-[hsl(var(--lv-text-muted))]"} aria-label="Repetir">
            {s.repeat === "one" ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};