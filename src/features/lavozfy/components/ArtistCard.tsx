import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import type { Artist } from "../data/artists";

export const ArtistCard = ({ artist, circular = true }: { artist: Artist; circular?: boolean }) => (
  <Link to={`/musica/artista/${artist.id}`} className="group text-center">
    <div className={`relative aspect-square overflow-hidden bg-white/5 shadow-md ${circular ? "rounded-full" : "rounded-md"}`}>
      <img src={artist.image} alt={artist.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
    </div>
    <div className="mt-2 text-sm font-medium truncate flex items-center justify-center gap-1">
      {artist.name}
      {artist.verified && <BadgeCheck className="h-3.5 w-3.5 text-[hsl(var(--lv-green))]" />}
    </div>
    <div className="text-xs text-[hsl(var(--lv-text-muted))]">{artist.country}</div>
  </Link>
);