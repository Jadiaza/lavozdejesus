import { Bell, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/authStore";
import { Link } from "react-router-dom";

export const Header = ({ title }: { title?: string }) => {
  const nav = useNavigate();
  const user = useAuth((s) => s.user);
  return (
    <header className="sticky top-0 z-20 bg-[hsl(var(--lv-bg))]/85 backdrop-blur border-b border-[color:var(--lv-border)]">
      <div className="px-4 md:px-6 h-14 flex items-center gap-3">
        <div className="hidden md:flex gap-1">
          <button onClick={() => nav(-1)} className="h-8 w-8 grid place-items-center rounded-full bg-black/40 hover:bg-black/60"><ArrowLeft className="h-4 w-4" /></button>
          <button onClick={() => nav(1)} className="h-8 w-8 grid place-items-center rounded-full bg-black/40 hover:bg-black/60"><ArrowRight className="h-4 w-4" /></button>
        </div>
        {title && <h1 className="text-lg md:text-xl font-semibold truncate">{title}</h1>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q");
            if (q) nav(`/musica/buscar?q=${encodeURIComponent(String(q))}`);
          }}
          className="ml-auto relative hidden md:block"
        >
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--lv-text-muted))]" />
          <input
            name="q"
            placeholder="¿Qué quieres escuchar?"
            className="w-72 pl-8 pr-3 py-2 rounded bg-white/[0.04] border border-[color:var(--lv-border)] text-sm placeholder:text-[hsl(var(--lv-text-muted))] focus:outline-none focus:border-[hsl(var(--lv-green))]"
          />
        </form>
        <button className="h-9 w-9 grid place-items-center rounded-full hover:bg-white/5 ml-auto md:ml-0" aria-label="Notificaciones">
          <Bell className="h-4 w-4" />
        </button>
        {user ? (
          <Link to="/musica/perfil" className="h-8 w-8 rounded-full bg-[hsl(var(--lv-green))] text-black grid place-items-center text-xs font-bold">
            {(user.email ?? "?")[0].toUpperCase()}
          </Link>
        ) : (
          <Link to="/musica/login" className="text-xs font-semibold px-3 py-1.5 rounded bg-[hsl(var(--lv-green))] hover:bg-[hsl(var(--lv-green-hover))] text-black">Entrar</Link>
        )}
      </div>
    </header>
  );
};