import { SectionHeader } from "../components/SectionHeader";
import { AlbumCard } from "../components/AlbumCard";
import { ArtistCard } from "../components/ArtistCard";
import { TrackRow } from "../components/TrackRow";
import { albums } from "../data/albums";
import { artists } from "../data/artists";
import { tracks } from "../data/tracks";
import { genres } from "../data/genres";
import { Link } from "react-router-dom";

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">{children}</div>
);

export default function Home() {
  return (
    <div className="p-4 md:p-6 space-y-8">
      <section>
        <SectionHeader title="Álbumes populares" to="/musica/albumes" />
        <Row>{albums.slice(0, 6).map((a) => <AlbumCard key={a.id} album={a} />)}</Row>
      </section>
      <section>
        <SectionHeader title="Canciones destacadas" to="/musica/canciones" />
        <div className="rounded-md bg-white/[0.02] p-2">
          {tracks.slice(0, 5).map((t, i) => <TrackRow key={t.id} track={t} index={i} queue={tracks} />)}
        </div>
      </section>
      <section>
        <SectionHeader title="Artistas populares" to="/musica/artistas" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {artists.map((a) => <ArtistCard key={a.id} artist={a} />)}
        </div>
      </section>
      <section>
        <SectionHeader title="Nuevos lanzamientos" to="/musica/nuevos" />
        <Row>{[...albums].sort((a, b) => b.year - a.year).slice(0, 6).map((a) => <AlbumCard key={a.id} album={a} />)}</Row>
      </section>
      <section>
        <SectionHeader title="Música para orar" to="/musica/genero/contemplativa" />
        <Row>{albums.filter(a => ["Contemplativa","Adoración"].includes(a.genre)).map((a) => <AlbumCard key={a.id} album={a} />)}</Row>
      </section>
      <section>
        <SectionHeader title="Adoración al Santísimo" to="/musica/genero/adoracion" />
        <Row>{albums.filter(a => a.genre === "Adoración").map((a) => <AlbumCard key={a.id} album={a} />)}</Row>
      </section>
      <section>
        <SectionHeader title="Música mariana" to="/musica/genero/mariana" />
        <Row>{albums.filter(a => a.genre === "Mariana").map((a) => <AlbumCard key={a.id} album={a} />)}</Row>
      </section>
      <section>
        <SectionHeader title="Explora por género" to="/musica/generos" />
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {genres.map((g) => (
            <Link key={g.slug} to={`/musica/genero/${g.slug}`}
              className={`aspect-[2/1] rounded-md p-3 font-semibold text-sm bg-gradient-to-br ${g.color} shadow`}>
              {g.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}