import { useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  bibleStudyAuth,
  getBibleStudyRememberSession,
  isBibleStudyAuthConfigured,
  setBibleStudyRememberSession,
} from "@/features/biblia/auth/bibleStudyAuth";
import { getRecentBibleStudies } from "@/services/bibleStudyService";

type AccessMode = "login" | "register";
const DEFAULT_DESTINATION = "/biblia/estudio";

function safeDestination(search: string): string {
  const requested = new URLSearchParams(search).get("next");
  return requested?.startsWith("/biblia") ? requested : DEFAULT_DESTINATION;
}

function friendlyError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "El correo o la contraseña no son correctos.";
  if (normalized.includes("email not confirmed")) return "Confirma tu correo antes de iniciar sesión.";
  if (normalized.includes("user already registered")) return "Este correo ya está registrado. Inicia sesión o recupera tu contraseña.";
  if (normalized.includes("password should be")) return "La contraseña debe tener al menos 8 caracteres.";
  if (normalized.includes("rate limit")) return "Has realizado varios intentos. Espera unos minutos y vuelve a intentarlo.";
  if (normalized.includes("email rate limit")) return "Se alcanzó el límite temporal de correos. Espera unos minutos antes de solicitar otro.";
  if (normalized.includes("failed to fetch")) return "No fue posible comunicarse con el servicio de acceso. Revisa tu conexión e inténtalo nuevamente.";
  return message || "No fue posible completar el acceso.";
}

export default function Auth() {
  const [mode, setMode] = useState<AccessMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(getBibleStudyRememberSession);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [recovering, setRecovering] = useState(() => window.location.pathname === "/acceso/recuperar");
  const navigate = useNavigate();
  const location = useLocation();
  const next = useMemo(() => safeDestination(location.search), [location.search]);
  const callbackUrl = useMemo(() => {
    const url = new URL("/acceso", window.location.origin);
    url.searchParams.set("next", next);
    return url.toString();
  }, [next]);
  const recoveryCallbackUrl = useMemo(() => {
    const url = new URL("/acceso/recuperar", window.location.origin);
    url.searchParams.set("next", next);
    return url.toString();
  }, [next]);

  useEffect(() => {
    let active = true;
    const completeAccess = async () => {
      const { data, error } = await bibleStudyAuth.auth.getSession();
      if (!active) return;
      if (error) {
        setMessage(friendlyError(error.message));
        setLoading(false);
        return;
      }
      if (!data.session) {
        setLoading(false);
        return;
      }
      if (recovering) {
        setLoading(false);
        return;
      }
      try {
        await getRecentBibleStudies();
        if (active) navigate(next, { replace: true });
      } catch (accessError) {
        if (!active) return;
        setMessage(accessError instanceof Error ? friendlyError(accessError.message) : "No fue posible validar tu cuenta con el servidor.");
        setLoading(false);
      }
    };
    void completeAccess();
    const { data } = bibleStudyAuth.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") {
        setRecovering(true);
        setLoading(false);
        return;
      }
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) void completeAccess();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [navigate, next, recovering]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setRegistrationSubmitted(false);
    if (!isBibleStudyAuthConfigured()) {
      setMessage("El acceso de usuarios no está configurado en este entorno. Faltan la URL o la clave pública de Supabase.");
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if ((mode === "register" || recovering) && password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setBibleStudyRememberSession(remember);
    if (recovering) {
      const { error } = await bibleStudyAuth.auth.updateUser({ password });
      if (error) {
        setMessage(friendlyError(error.message));
      } else {
        await bibleStudyAuth.auth.signOut({ scope: "local" });
        setRecovering(false);
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setSuccess(true);
        setMessage("Contraseña establecida correctamente. Ya puedes iniciar sesión.");
        navigate(`/acceso?next=${encodeURIComponent(next)}`, { replace: true });
      }
      setLoading(false);
      return;
    }
    if (mode === "register") {
      const { data, error } = await bibleStudyAuth.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: { full_name: name.trim() || "Usuario LVJ" },
        },
      });
      if (error) {
        setMessage(friendlyError(error.message));
      } else if (!data.session) {
        setSuccess(true);
        setRegistrationSubmitted(true);
        setMessage("Solicitud recibida. Si el correo es nuevo, recibirás un enlace de confirmación. Si ya lo habías usado antes, inicia sesión o establece una contraseña.");
      }
    } else {
      const { error } = await bibleStudyAuth.auth.signInWithPassword({ email: normalizedEmail, password });
      if (error) setMessage(friendlyError(error.message));
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!isBibleStudyAuthConfigured()) {
      setMessage("El acceso de usuarios no está configurado en este entorno. Faltan la URL o la clave pública de Supabase.");
      return;
    }
    if (!email.trim()) {
      setMessage("Escribe primero el correo de tu cuenta.");
      return;
    }
    setLoading(true);
    setMessage("");
    const { error } = await bibleStudyAuth.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: recoveryCallbackUrl,
    });
    setSuccess(!error);
    setMessage(error ? friendlyError(error.message) : "Te enviamos un enlace para restablecer tu contraseña.");
    setLoading(false);
  };

  const resendConfirmation = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setMessage("");
    const { error } = await bibleStudyAuth.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: callbackUrl },
    });
    setSuccess(!error);
    setMessage(error ? friendlyError(error.message) : "Si la cuenta está pendiente de confirmación, enviamos un nuevo enlace. Revisa también correo no deseado.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-[#F8F5EA]">
      <div className="mx-auto max-w-sm">
        <section className="mb-4 rounded-[1.5rem] border border-[#D4AF37]/25 bg-[#0B0B0B] p-5 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#F2D27A] to-[#D4AF37]">
            <BookOpen className="text-black" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-2xl">Acceso al estudio bíblico</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#C9C3B3]">
            La cuenta gratuita permite proteger el servicio, aplicar tu cupo mensual y conservar el historial de estudios en todos tus dispositivos.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#8F897C]">
            Puedes seguir leyendo y comparando la Biblia sin registrarte. Tus datos de acceso se usan únicamente para identificar tu cuenta.
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-[#D4AF37]/30 bg-[#0B0B0B] p-5 shadow-2xl">
          {!recovering ? <div className="grid grid-cols-2 rounded-xl border border-[#D4AF37]/20 bg-[#111] p-1">
            {(["login", "register"] as const).map((item) => (
              <button key={item} type="button" onClick={() => { setMode(item); setMessage(""); }} className={`min-h-11 rounded-lg px-3 text-sm font-bold ${mode === item ? "bg-[#D4AF37] text-black" : "text-[#C9C3B3]"}`}>
                {item === "login" ? "Iniciar sesión" : "Registrarme"}
              </button>
            ))}
          </div> : <div className="rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 p-3 text-center"><h2 className="font-display text-lg text-[#F8F5EA]">Establece tu contraseña</h2><p className="mt-1 text-xs text-[#C9C3B3]">Escribe una nueva contraseña segura para terminar de recuperar tu cuenta.</p></div>}

          <form onSubmit={submit} className="mt-5 space-y-4">
            {!recovering && mode === "register" ? <Field icon={UserRound} label="Nombre" type="text" value={name} onChange={setName} autoComplete="name" placeholder="Tu nombre" /> : null}
            {!recovering ? <Field icon={Mail} label="Correo electrónico" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="tu@correo.com" required /> : null}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">Contraseña</label>
              <div className="mt-1 flex rounded-xl border border-[#D4AF37]/25 bg-[#111] px-3 focus-within:border-[#D4AF37]/60">
                <LockKeyhole className="my-auto h-4 w-4 shrink-0 text-[#D4AF37]" />
                <input required minLength={8} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" && !recovering ? "current-password" : "new-password"} className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none" placeholder="Mínimo 8 caracteres" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="min-h-11 px-1 text-[#C9C3B3]" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            {mode === "register" || recovering ? <Field icon={LockKeyhole} label="Confirmar contraseña" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" placeholder="Repite tu contraseña" required /> : null}

            {!recovering ? <label className="flex min-h-11 items-start gap-3 text-sm text-[#C9C3B3]">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="mt-1 h-4 w-4 accent-[#D4AF37]" />
              <span><strong className="text-[#F8F5EA]">Recordar mi sesión</strong><span className="block text-xs text-[#8F897C]">Desmárcalo si este dispositivo es compartido. La contraseña nunca se guarda en LVJ.</span></span>
            </label> : null}

            <button disabled={loading} className="min-h-12 w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] px-4 py-3 font-bold text-black disabled:opacity-50">
              {loading ? "Procesando..." : recovering ? "Guardar nueva contraseña" : mode === "login" ? "Iniciar sesión" : "Crear mi cuenta"}
            </button>
          </form>

          {!recovering && mode === "login" ? <button type="button" disabled={loading} onClick={resetPassword} className="mt-3 min-h-11 w-full text-sm text-[#D4AF37]">Olvidé mi contraseña</button> : null}
          {message ? <p role={success ? "status" : "alert"} className={`mt-3 rounded-xl border p-3 text-center text-sm ${success ? "border-emerald-400/25 bg-emerald-950/20 text-emerald-200" : "border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F2D27A]"}`}>{message}</p> : null}
          {registrationSubmitted ? <div className="mt-3 grid gap-2"><button type="button" disabled={loading} onClick={resendConfirmation} className="min-h-11 rounded-xl border border-[#D4AF37]/30 px-3 text-sm font-semibold text-[#D4AF37]">Reenviar confirmación</button><button type="button" disabled={loading} onClick={resetPassword} className="min-h-11 rounded-xl border border-white/10 px-3 text-sm text-[#C9C3B3]">Ya tenía acceso: establecer contraseña</button></div> : null}
          {!recovering ? <Link to="/biblia" className="mt-4 block min-h-11 pt-3 text-center text-sm text-[#C9C3B3]">Continuar sin registrarme</Link> : null}
        </section>
      </div>
    </main>
  );
}

function Field({ icon: Icon, label, value, onChange, ...input }: { icon: typeof Mail; label: string; value: string; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <div><label className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">{label}</label><div className="mt-1 flex rounded-xl border border-[#D4AF37]/25 bg-[#111] px-3 focus-within:border-[#D4AF37]/60"><Icon className="my-auto h-4 w-4 shrink-0 text-[#D4AF37]"/><input {...input} value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none"/></div></div>;
}
