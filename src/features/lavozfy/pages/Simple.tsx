import { useParams, useSearchParams, Link } from "react-router-dom";
import { AlbumCard } from "../components/AlbumCard";
import { ArtistCard } from "../components/ArtistCard";
import { TrackRow } from "../components/TrackRow";
import { SectionHeader } from "../components/SectionHeader";
import { PlayButton } from "../components/PlayButton";
import { albums, getAlbum, albumsByArtist } from "../data/albums";
import { artists, getArtist } from "../data/artists";
import { tracks, tracksByAlbum, tracksByArtist } from "../data/tracks";
import { genres } from "../data/genres";
import { playlists, getPlaylist } from "../data/playlists";
import { usePlayer } from "../state/playerStore";
import { BadgeCheck } from "lucide-react";

const Grid = ({ children }: any) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">{children}</div>
);

export const Albumes = () => (
  <div className="p-4 md:p-6"><SectionHeader title="Álbumes" /><Grid>{albums.map(a => <AlbumCard key={a.id} album={a} />)}</Grid></div>
);

export const Artistas = () => (
  <div className="p-4 md:p-6">
    <SectionHeader title="Artistas" />
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">{artists.map(a => <ArtistCard key={a.id} artist={a} />)}</div>
  </div>
);

export const Canciones = () => (
  <div className="p-4 md:p-6">
    <SectionHeader title="Canciones populares" />
    <div className="rounded-md bg-white/[0.02] p-2">
      {tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={tracks} />)}
    </div>
  </div>
);

export const Nuevos = () => (
  <div className="p-4 md:p-6">
    <SectionHeader title="Nuevos lanzamientos" />
    <Grid>{[...albums].sort((a, b) => b.year - a.year).map(a => <AlbumCard key={a.id} album={a} />)}</Grid>
  </div>
);

export const Generos = () => (
  <div className="p-4 md:p-6">
    <SectionHeader title="Géneros" />
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
      {genres.map(g => (
        <Link key={g.slug} to={`/musica/genero/${g.slug}`}
          className={`aspect-[2/1] rounded-md p-4 font-semibold bg-gradient-to-br ${g.color}`}>{g.name}</Link>
      ))}
    </div>
  </div>
);

export const Genero = () => {
  const { slug } = useParams();
  const g = genres.find(x => x.slug === slug);
  const list = albums.filter(a => a.genre.toLowerCase() === (g?.name.toLowerCase() ?? ""));
  return (
    <div className="p-4 md:p-6">
      <SectionHeader title={g?.name ?? "Género"} />
      {list.length ? <Grid>{list.map(a => <AlbumCard key={a.id} album={a} />)}</Grid>
        : <div className="text-sm text-[hsl(var(--lv-text-muted))]">Todavía no hay contenido en este género.</div>}
    </div>
  );
};

export const Album = () => {
  const { id } = useParams();
  const album = getAlbum(id!);
  const artist = album && getArtist(album.artistId);
  const list = album ? tracksByAlbum(album.id) : [];
  const play = usePlayer(s => s.playQueue);
  if (!album) return <div className="p-6">Álbum no encontrado.</div>;
  const total = list.reduce((s, t) => s + t.duration, 0);
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
        <img src={album.cover} alt={album.title} className="w-48 h-48 md:w-56 md:h-56 rounded-md shadow-2xl" />
        <div>
          <div className="text-xs uppercase tracking-widest text-[hsl(var(--lv-text-muted))]">Álbum</div>
          <h1 className="text-3xl md:text-5xl font-bold mt-1">{album.title}</h1>
          <div className="mt-3 text-sm text-[hsl(var(--lv-text-muted))]">
            <Link to={`/musica/artista/${album.artistId}`} className="text-[hsl(var(--lv-text))] hover:underline">{artist?.name}</Link>
            {" · "}{album.year} · {album.genre} · {list.length} canciones · {Math.floor(total/60)} min
          </div>
          <div className="mt-4 flex items-center gap-3">
            <PlayButton size="md" onClick={() => list.length && play(list)} />
            <button className="text-xs uppercase tracking-wider px-3 py-2 rounded border border-[color:var(--lv-border)] hover:bg-white/5">Guardar</button>
          </div>
        </div>
      </div>
      <div className="mt-8 rounded-md bg-white/[0.02] p-2">
        {list.map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={list} />)}
      </div>
    </div>
  );
};

export const Artista = () => {
  const { id } = useParams();
  const artist = getArtist(id!);
  const play = usePlayer(s => s.playQueue);
  if (!artist) return <div className="p-6">Artista no encontrado.</div>;
  const top = tracksByArtist(artist.id);
  const disc = albumsByArtist(artist.id);
  return (
    <div>
      <div className="relative h-56 md:h-72 bg-gradient-to-b from-[hsl(var(--lv-panel-2))] to-[hsl(var(--lv-bg))] overflow-hidden">
        <img src={artist.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 flex items-end p-6 gap-4">
          <img src={artist.image} alt={artist.name} className="h-28 w-28 rounded-full object-cover shadow-2xl" />
          <div>
            <div className="text-xs uppercase tracking-widest text-[hsl(var(--lv-text-muted))]">Artista</div>
            <h1 className="text-3xl md:text-5xl font-bold flex items-center gap-2">
              {artist.name} {artist.verified && <BadgeCheck className="h-6 w-6 text-[hsl(var(--lv-green))]" />}
            </h1>
            <div className="text-sm text-[hsl(var(--lv-text-muted))] mt-1">{artist.country} · {artist.genre}</div>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 space-y-8">
        <div className="flex items-center gap-3">
          <PlayButton onClick={() => top.length && play(top)} />
          <button className="text-xs uppercase tracking-wider px-3 py-2 rounded border border-[color:var(--lv-border)] hover:bg-white/5">Seguir</button>
        </div>
        <p className="text-sm text-[hsl(var(--lv-text-muted))] max-w-2xl">{artist.bio}</p>
        <section>
          <SectionHeader title="Canciones populares" />
          <div className="rounded-md bg-white/[0.02] p-2">
            {top.map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={top} />)}
          </div>
        </section>
        <section>
          <SectionHeader title="Álbumes" />
          <Grid>{disc.map(a => <AlbumCard key={a.id} album={a} />)}</Grid>
        </section>
      </div>
    </div>
  );
};

export const Buscar = () => {
  const [sp, setSp] = useSearchParams();
  const q = (sp.get("q") ?? "").toLowerCase();
  const fArt = artists.filter(a => a.name.toLowerCase().includes(q));
  const fAlb = albums.filter(a => a.title.toLowerCase().includes(q));
  const fTrk = tracks.filter(t => t.title.toLowerCase().includes(q));
  return (
    <div className="p-4 md:p-6">
      <input
        autoFocus
        placeholder="¿Qué quieres escuchar?"
        value={q}
        onChange={(e) => setSp({ q: e.target.value })}
        className="w-full md:w-96 px-3 py-2 rounded bg-white/[0.04] border border-[color:var(--lv-border)] text-sm focus:outline-none focus:border-[hsl(var(--lv-green))]"
      />
      {q && (
        <div className="mt-6 space-y-8">
          {fArt.length > 0 && <section><SectionHeader title="Artistas" /><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">{fArt.map(a => <ArtistCard key={a.id} artist={a} />)}</div></section>}
          {fAlb.length > 0 && <section><SectionHeader title="Álbumes" /><Grid>{fAlb.map(a => <AlbumCard key={a.id} album={a} />)}</Grid></section>}
          {fTrk.length > 0 && <section><SectionHeader title="Canciones" /><div className="rounded-md bg-white/[0.02] p-2">{fTrk.map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={fTrk} />)}</div></section>}
          {!fArt.length && !fAlb.length && !fTrk.length && (
            <div className="text-sm text-[hsl(var(--lv-text-muted))]">Sin resultados para "{q}".</div>
          )}
        </div>
      )}
    </div>
  );
};

export const Explorar = () => <Generos />;

export const Biblioteca = () => {
  const favs = usePlayer(s => s.favorites);
  const hist = usePlayer(s => s.history);
  const favTracks = tracks.filter(t => favs.includes(t.id));
  const histTracks = hist.map(id => tracks.find(t => t.id === id)!).filter(Boolean);
  return (
    <div className="p-4 md:p-6 space-y-8">
      <SectionHeader title="Mi biblioteca" />
      <section>
        <h3 className="text-sm font-semibold mb-2">Favoritos</h3>
        {favTracks.length ? (
          <div className="rounded-md bg-white/[0.02] p-2">
            {favTracks.map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={favTracks} />)}
          </div>
        ) : <div className="text-sm text-[hsl(var(--lv-text-muted))]">Todavía no marcaste favoritos.</div>}
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">Playlists</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {playlists.map(p => (
            <Link key={p.id} to={`/musica/playlist/${p.id}`} className="group">
              <div className="aspect-square rounded-md overflow-hidden"><img src={p.cover} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" /></div>
              <div className="mt-2 text-sm font-medium">{p.name}</div>
              <div className="text-xs text-[hsl(var(--lv-text-muted))]">{p.trackIds.length} canciones</div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-sm font-semibold mb-2">Historial</h3>
        {histTracks.length ? (
          <div className="rounded-md bg-white/[0.02] p-2">
            {histTracks.map((t, i) => <TrackRow key={t.id + i} track={t} index={i} queue={histTracks} />)}
          </div>
        ) : <div className="text-sm text-[hsl(var(--lv-text-muted))]">Todavía no escuchaste nada.</div>}
      </section>
    </div>
  );
};

export const PlaylistPage = () => {
  const { id } = useParams();
  const p = getPlaylist(id!);
  const play = usePlayer(s => s.playQueue);
  if (!p) return <div className="p-6">Playlist no encontrada.</div>;
  const list = p.trackIds.map(tid => tracks.find(t => t.id === tid)!).filter(Boolean);
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
        <img src={p.cover} alt={p.name} className="w-48 h-48 rounded-md shadow-2xl" />
        <div>
          <div className="text-xs uppercase tracking-widest text-[hsl(var(--lv-text-muted))]">Playlist</div>
          <h1 className="text-3xl md:text-5xl font-bold mt-1">{p.name}</h1>
          <div className="text-sm text-[hsl(var(--lv-text-muted))] mt-2">{p.description}</div>
          <div className="mt-4"><PlayButton onClick={() => list.length && play(list)} /></div>
        </div>
      </div>
      <div className="mt-8 rounded-md bg-white/[0.02] p-2">
        {list.map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={list} />)}
      </div>
    </div>
  );
};