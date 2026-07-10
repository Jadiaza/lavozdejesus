import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../state/authStore";
import logo from "../assets/logo.png";

const wrap = "min-h-screen grid place-items-center p-6 bg-[hsl(var(--lv-bg))]";
const card = "w-full max-w-sm bg-[hsl(var(--lv-panel))] border border-[color:var(--lv-border)] rounded-lg p-6 space-y-4";
const input = "w-full px-3 py-2 rounded bg-white/[0.04] border border-[color:var(--lv-border)] text-sm focus:outline-none focus:border-[hsl(var(--lv-green))]";
const btn = "w-full py-2 rounded bg-[hsl(var(--lv-green))] hover:bg-[hsl(var(--lv-green-hover))] text-black font-semibold text-sm transition disabled:opacity-60";

export const Login = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  return (
    <div className={wrap + " lavozfy"}>
      <form className={card} onSubmit={async (e) => {
        e.preventDefault(); setErr(null); setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) setErr(error.message); else nav("/musica");
      }}>
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="" className="h-10 w-10" />
          <div className="font-semibold">Entrar a LaVozFy</div>
        </div>
        <input className={input} type="email" required placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
        <input className={input} type="password" required placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
        {err && <div className="text-xs text-red-400">{err}</div>}
        <button className={btn} disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
        <div className="flex justify-between text-xs text-[hsl(var(--lv-text-muted))]">
          <Link to="/musica/reset-password" className="hover:text-white">¿Olvidaste tu contraseña?</Link>
          <Link to="/musica/registro" className="hover:text-white">Registrarse</Link>
        </div>
        <Link to="/musica" className="block text-center text-xs text-[hsl(var(--lv-text-muted))]">Volver</Link>
      </form>
    </div>
  );
};

export const Registro = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null); const [ok, setOk] = useState(false); const [loading, setLoading] = useState(false);
  return (
    <div className={wrap + " lavozfy"}>
      <form className={card} onSubmit={async (e) => {
        e.preventDefault(); setErr(null); setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password,
          options: { emailRedirectTo: window.location.origin + "/musica" } });
        setLoading(false);
        if (error) setErr(error.message); else { setOk(true); setTimeout(() => nav("/musica"), 1200); }
      }}>
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="" className="h-10 w-10" />
          <div className="font-semibold">Crear cuenta</div>
        </div>
        <input className={input} type="email" required placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
        <input className={input} type="password" required minLength={6} placeholder="Contraseña (mín. 6)" value={password} onChange={e => setPassword(e.target.value)} />
        {err && <div className="text-xs text-red-400">{err}</div>}
        {ok && <div className="text-xs text-[hsl(var(--lv-green))]">Cuenta creada.</div>}
        <button className={btn} disabled={loading}>{loading ? "Creando…" : "Registrarse"}</button>
        <Link to="/musica/login" className="block text-center text-xs text-[hsl(var(--lv-text-muted))]">Ya tengo cuenta</Link>
      </form>
    </div>
  );
};

export const ResetPassword = () => {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false); const [err, setErr] = useState<string | null>(null);
  return (
    <div className={wrap + " lavozfy"}>
      <form className={card} onSubmit={async (e) => {
        e.preventDefault(); setErr(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/musica/reset-password" });
        if (error) setErr(error.message); else setSent(true);
      }}>
        <div className="font-semibold text-center">Recuperar contraseña</div>
        <input className={input} type="email" required placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
        {err && <div className="text-xs text-red-400">{err}</div>}
        {sent && <div className="text-xs text-[hsl(var(--lv-green))]">Enlace enviado.</div>}
        <button className={btn}>Enviar enlace</button>
        <Link to="/musica/login" className="block text-center text-xs text-[hsl(var(--lv-text-muted))]">Volver</Link>
      </form>
    </div>
  );
};

export const Perfil = () => {
  const user = useAuth(s => s.user); const signOut = useAuth(s => s.signOut);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      {user ? (
        <>
          <div className="text-sm text-[hsl(var(--lv-text-muted))]">Sesión activa como <b className="text-white">{user.email}</b></div>
          <button onClick={() => signOut()} className="text-xs uppercase px-3 py-2 rounded border border-[color:var(--lv-border)] hover:bg-white/5">Cerrar sesión</button>
        </>
      ) : (
        <div>
          <p className="text-sm text-[hsl(var(--lv-text-muted))] mb-3">No has iniciado sesión.</p>
          <Link to="/musica/login" className="inline-block px-4 py-2 rounded bg-[hsl(var(--lv-green))] text-black font-semibold text-sm">Entrar</Link>
        </div>
      )}
    </div>
  );
};