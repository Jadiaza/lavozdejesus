import { NavLink, Link } from "react-router-dom";
import {
  Home, Search, Compass, Users, Disc3, Tags, Music4, Sparkles,
  HeartHandshake, Church, Heart as HeartIcon, BookOpen, ListMusic, Star, History, User2, LogOut,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../state/authStore";

const explorar = [
  { to: "/musica", end: true, icon: Home, label: "Inicio" },
  { to: "/musica/artistas", icon: Users, label: "Artistas" },
  { to: "/musica/albumes", icon: Disc3, label: "Álbumes populares" },
  { to: "/musica/generos", icon: Tags, label: "Géneros" },
  { to: "/musica/canciones", icon: Music4, label: "Canciones populares" },
  { to: "/musica/nuevos", icon: Sparkles, label: "Nuevos lanzamientos" },
  { to: "/musica/genero/contemplativa", icon: HeartHandshake, label: "Música para orar" },
  { to: "/musica/genero/adoracion", icon: Church, label: "Adoración" },
  { to: "/musica/genero/alabanza", icon: Music4, label: "Alabanza" },
  { to: "/musica/genero/mariana", icon: HeartIcon, label: "Música mariana" },
  { to: "/musica/genero/liturgica", icon: BookOpen, label: "Música litúrgica" },
];

const miMusica = [
  { to: "/musica/biblioteca?tab=canciones", icon: Music4, label: "Canciones" },
  { to: "/musica/biblioteca?tab=albumes", icon: Disc3, label: "Álbumes" },
  { to: "/musica/biblioteca?tab=artistas", icon: Users, label: "Artistas" },
  { to: "/musica/biblioteca?tab=playlists", icon: ListMusic, label: "Playlists" },
  { to: "/musica/biblioteca?tab=favoritos", icon: Star, label: "Favoritos" },
  { to: "/musica/biblioteca?tab=historial", icon: History, label: "Historial" },
];

const item = "flex items-center gap-3 px-3 py-2 rounded text-sm text-[hsl(var(--lv-text-muted))] hover:text-[hsl(var(--lv-text))] hover:bg-white/5 transition";
const active = "text-[hsl(var(--lv-text))] bg-white/[0.06] before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-[hsl(var(--lv-green))] before:rounded relative";

export const Sidebar = () => {
  const user = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  return (
    <aside className="w-64 shrink-0 bg-[hsl(var(--lv-sidebar))] border-r border-[color:var(--lv-border)] flex flex-col">
      <div className="p-4">
        <Link to="/musica" className="flex items-center gap-2 mb-1">
          <img src={logo} alt="LaVozFy" width={36} height={36} className="h-9 w-9" />
          <div>
            <div className="text-sm font-semibold leading-none">LaVozFy</div>
            <div className="text-[10px] text-[hsl(var(--lv-text-muted))]">Música que eleva el alma</div>
          </div>
        </Link>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q");
            if (q) window.location.assign(`/musica/buscar?q=${encodeURIComponent(String(q))}`);
          }}
          className="mt-3 relative"
        >
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--lv-text-muted))]" />
          <input
            name="q"
            placeholder="Buscar…"
            className="w-full pl-8 pr-2 py-2 rounded bg-white/[0.04] border border-[color:var(--lv-border)] text-sm placeholder:text-[hsl(var(--lv-text-muted))] focus:outline-none focus:border-[hsl(var(--lv-green))]"
          />
        </form>
      </div>

      <nav className="flex-1 overflow-y-auto lv-scroll px-2 pb-2">
        <div className="px-2 pt-2 text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--lv-text-muted))]">Explorar</div>
        <div className="mt-1">
          {explorar.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end as boolean | undefined}
              className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
              <it.icon className="h-4 w-4" strokeWidth={1.6} />
              <span className="truncate">{it.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="px-2 pt-4 text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--lv-text-muted))]">Mi música</div>
        <div className="mt-1">
          {miMusica.map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
              <it.icon className="h-4 w-4" strokeWidth={1.6} />
              <span className="truncate">{it.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-6 px-2 pb-2">
          {!user ? (
            <div className="space-y-2">
              <Link
                to="/musica/login"
                className="block w-full text-center rounded bg-[hsl(var(--lv-green))] hover:bg-[hsl(var(--lv-green-hover))] text-black text-sm font-semibold py-2 transition"
              >Entrar</Link>
              <Link
                to="/musica/registro"
                className="block text-center text-xs text-[hsl(var(--lv-text-muted))] hover:text-[hsl(var(--lv-text))]"
              >Registrarse</Link>
            </div>
          ) : (
            <div className="space-y-1">
              <NavLink to="/musica/perfil" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
                <div className="h-6 w-6 rounded-full bg-[hsl(var(--lv-green))] text-black grid place-items-center text-[10px] font-bold">
                  {(user.email ?? "?")[0].toUpperCase()}
                </div>
                <span className="truncate">{user.email}</span>
              </NavLink>
              <NavLink to="/musica/biblioteca" className={({ isActive }) => `${item} ${isActive ? active : ""}`}>
                <User2 className="h-4 w-4" /> Mi biblioteca
              </NavLink>
              <button onClick={() => signOut()} className={item + " w-full text-left"}>
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>

        <div className="px-3 pt-2 text-[10px] text-[hsl(var(--lv-text-muted))] flex items-center gap-1">
          <Compass className="h-3 w-3" /> La Voz de Jesús · Música
        </div>
      </nav>
    </aside>
  );
};