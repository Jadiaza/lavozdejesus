import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { PlayButton } from "./PlayButton";
import { getArtist } from "../data/artists";
import { tracksByAlbum } from "../data/tracks";
import { usePlayer } from "../state/playerStore";
import type { Album } from "../data/albums";

export const AlbumCard = ({ album }: { album: Album }) => {
  const artist = getArtist(album.artistId);
  const play = usePlayer((s) => s.playQueue);
  return (
    <div className="group">
      <div className="relative aspect-square rounded-md overflow-hidden bg-white/5 shadow-md">
        <Link to={`/musica/album/${album.id}`}>
          <img src={album.cover} alt={album.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition" />
        <PlayButton
          className="absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); play(tracksByAlbum(album.id)); }}
        />
        <button className="absolute top-2 right-2 h-8 w-8 grid place-items-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition hover:bg-black/70" aria-label="Más opciones">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <Link to={`/musica/album/${album.id}`} className="block mt-2">
        <div className="text-sm font-medium truncate">{album.title}</div>
        <div className="text-xs text-[hsl(var(--lv-text-muted))] truncate">{artist?.name}</div>
      </Link>
    </div>
  );
};