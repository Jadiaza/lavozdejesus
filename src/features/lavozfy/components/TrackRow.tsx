import { MoreHorizontal, Play } from "lucide-react";
import { getArtist } from "../data/artists";
import { getAlbum } from "../data/albums";
import { formatDuration, type Track } from "../data/tracks";
import { usePlayer, currentTrack } from "../state/playerStore";
import { FavoriteButton } from "./FavoriteButton";
import { SourceBadge } from "./SourceBadge";

export const TrackRow = ({
  track, index, queue,
}: { track: Track; index?: number; queue?: Track[] }) => {
  const play = usePlayer((s) => s.playQueue);
  const cur = usePlayer(currentTrack);
  const playing = usePlayer((s) => s.isPlaying);
  const isCurrent = cur?.id === track.id;
  const artist = getArtist(track.artistId);
  const album = getAlbum(track.albumId);

  return (
    <div
      className={`grid grid-cols-[32px_1fr_1fr_auto_auto] md:grid-cols-[32px_2fr_1.4fr_1fr_auto_auto] items-center gap-3 px-3 py-2 rounded hover:bg-white/5 group cursor-pointer ${isCurrent ? "text-[hsl(var(--lv-green))]" : ""}`}
      onClick={() => play(queue ?? [track], (queue ?? [track]).findIndex((t) => t.id === track.id))}
    >
      <div className="text-xs text-[hsl(var(--lv-text-muted))] w-6 text-right">
        <span className="group-hover:hidden">{isCurrent && playing ? "♪" : (index != null ? index + 1 : "")}</span>
        <Play className="hidden group-hover:inline h-3 w-3 fill-current" />
      </div>
      <div className="flex items-center gap-3 min-w-0">
        {album && <img src={album.cover} alt="" className="h-9 w-9 rounded object-cover" loading="lazy" />}
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{track.title}</div>
          <div className="text-xs text-[hsl(var(--lv-text-muted))] truncate">{artist?.name}</div>
        </div>
      </div>
      <div className="text-xs text-[hsl(var(--lv-text-muted))] truncate hidden md:block">{album?.title}</div>
      <div className="hidden md:block"><SourceBadge source={track.source} /></div>
      <div className="text-xs text-[hsl(var(--lv-text-muted))] tabular-nums">{formatDuration(track.duration)}</div>
      <div className="flex items-center gap-0.5">
        <FavoriteButton trackId={track.id} />
        <button className="p-1.5 rounded hover:bg-white/10 opacity-0 group-hover:opacity-100" aria-label="Opciones" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};