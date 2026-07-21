import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_DESTINATION = "/biblia/estudio";
const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "hotmail.com", "hotmail.es", "outlook.com", "outlook.es",
  "live.com", "live.com.co", "msn.com", "yahoo.com", "yahoo.es", "icloud.com", "me.com",
  "proton.me", "protonmail.com", "aol.com",
]);

const getSafeDestination = (search: string) => {
  const requested = new URLSearchParams(search).get("next");
  return requested?.startsWith("/biblia") ? requested : DEFAULT_DESTINATION;
};

const isAllowedEmail = (value: string) => {
  const domain = value.trim().toLowerCase().split("@").at(-1) ?? "";
  return ALLOWED_EMAIL_DOMAINS.has(domain);
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const next = useMemo(() => getSafeDestination(location.search), [location.search]);

  const callbackUrl = useMemo(() => {
    const url = new URL("/acceso", window.location.origin);
    url.searchParams.set("next", next);
    return url.toString();
  }, [next]);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate(next, { replace: true });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) navigate(next, { replace: true });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate, next]);

  const magic = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAllowedEmail(email)) {
      setMessage("Utiliza un correo de un proveedor reconocido como Gmail, Outlook, Hotmail, Yahoo, iCloud o Proton.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });
    setLoading(false);
    setMessage(error ? error.message : "Te enviamos un enlace seguro a tu correo.");
  };

  const google = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-10 text-[#F8F5EA]">
      <div className="mx-auto max-w-sm rounded-[1.75rem] border border-[#D4AF37]/30 bg-[#0B0B0B] p-6 shadow-2xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] to-[#D4AF37]">
          <BookOpen className="text-black" />
        </span>
        <h1 className="mt-4 text-center font-display text-2xl">Profundiza en la Palabra</h1>
        <p className="mt-2 text-center text-sm text-[#C9C3B3]">
          Crea una cuenta gratuita para acceder al estudio teológico, palabras clave y Lectio Divina.
        </p>
        <button type="button" disabled={loading} onClick={google} className="mt-6 w-full rounded-xl bg-[#F8F5EA] px-4 py-3 font-semibold text-black disabled:opacity-50">
          Continuar con Google
        </button>
        <div className="my-4 flex items-center gap-3 text-xs text-[#C9C3B3]">
          <span className="h-px flex-1 bg-[#D4AF37]/20" />o por correo<span className="h-px flex-1 bg-[#D4AF37]/20" />
        </div>
        <form onSubmit={magic}>
          <label className="text-xs uppercase tracking-wider text-[#D4AF37]">Correo electrónico</label>
          <div className="mt-1 flex rounded-xl border border-[#D4AF37]/25 bg-[#111] px-3">
            <Mail className="my-auto h-4 w-4 text-[#D4AF37]" />
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent px-3 py-3 outline-none" placeholder="tu@correo.com" />
          </div>
          <button disabled={loading} className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] px-4 py-3 font-bold text-black disabled:opacity-50">
            Enviar enlace de acceso
          </button>
        </form>
        {message ? <p className="mt-3 text-center text-sm text-[#C9C3B3]">{message}</p> : null}
        <Link to="/biblia" className="mt-5 block text-center text-sm text-[#D4AF37]">Seguir como invitado</Link>
      </div>
    </div>
  );
}
