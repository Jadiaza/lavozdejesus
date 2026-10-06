import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Cloud,
  Eye,
  EyeOff,
  FileText,
  Heart,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAccessContext } from "@/services/acceso";
import {
  lvjAuth,
  getRememberSession,
  isLvjAuthConfigured,
  setRememberSession,
} from "@/services/lvjAuth";

type AccessMode = "login" | "register";
const DEFAULT_DESTINATION = "/";

function safeDestination(search: string): string {
  const requested = new URLSearchParams(search).get("next");
  if (!requested || !requested.startsWith("/") || requested.startsWith("//")) return DEFAULT_DESTINATION;
  if (requested.startsWith("/acceso")) return DEFAULT_DESTINATION;
  return requested;
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
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptDataTreatment, setAcceptDataTreatment] = useState(false);
  const [acceptCommunications, setAcceptCommunications] = useState(false);
  const remember = true;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);
  const [syncingAccount, setSyncingAccount] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
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

  const validateAndEnter = async (accessToken: string) => {
    try {
      await getAccessContext(accessToken);
      setSyncingAccount(false);
      setLoading(false);
      if (location.pathname === "/acceso" && !location.search) return;
      navigate(next, { replace: true });
    } catch (error) {
      setSyncingAccount(false);
      setLoading(false);
      setMessage(
        error instanceof Error
          ? friendlyError(error.message)
          : "No fue posible habilitar tu cuenta en La Voz de Jesús.",
      );
    }
  };

  useEffect(() => {
    let active = true;

    const completeAccess = async () => {
      const { data, error } = await lvjAuth.auth.getSession();
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

      setAccountEmail(data.session.user.email ?? "");
      setSyncingAccount(true);
      await validateAndEnter(data.session.access_token);
    };

    void completeAccess();

    const { data } = lvjAuth.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY") {
        setRecovering(true);
        setLoading(false);
        setSyncingAccount(false);
        return;
      }

      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setAccountEmail(session.user.email ?? "");
        setSyncingAccount(true);
        void validateAndEnter(session.access_token);
      }
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

    if (!isLvjAuthConfigured()) {
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

    if (mode === "register" && (!acceptTerms || !acceptPrivacy || !acceptDataTreatment)) {
      setMessage("Para crear tu cuenta debes aceptar los términos de uso, conocer la política de privacidad y autorizar el tratamiento de tus datos personales.");
      return;
    }

    setLoading(true);
    // La sesión queda persistente por defecto; solo se guarda en sessionStorage si el usuario lo desmarca.
    setRememberSession(remember);

    if (recovering) {
      const { error } = await lvjAuth.auth.updateUser({ password });

      if (error) {
        setMessage(friendlyError(error.message));
      } else {
        await lvjAuth.auth.signOut({ scope: "local" });
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
      const { data, error } = await lvjAuth.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: {
            full_name: name.trim() || "Usuario LVJ",
            consent_terms_at: new Date().toISOString(),
            consent_privacy_at: new Date().toISOString(),
            consent_data_treatment_at: new Date().toISOString(),
            consent_communications: acceptCommunications,
          },
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
      const { data: signInData, error } = await lvjAuth.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setMessage(friendlyError(error.message));
      } else if (signInData.session) {
        // No navegamos todavía: primero validamos la identidad contra el
        // backend local de LVJ. Esto evita que AccessGate vea una sesión
        // todavía sin contexto y nos devuelva nuevamente a /acceso.
        setSyncingAccount(true);
        await validateAndEnter(signInData.session.access_token);
      }
    }

    setLoading(false);
  };

  const resetPassword = async () => {
    if (!isLvjAuthConfigured()) {
      setMessage("El acceso de usuarios no está configurado en este entorno. Faltan la URL o la clave pública de Supabase.");
      return;
    }

    if (!email.trim()) {
      setMessage("Escribe primero el correo de tu cuenta.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await lvjAuth.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
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

    const { error } = await lvjAuth.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: callbackUrl },
    });

    setSuccess(!error);
    setMessage(error ? friendlyError(error.message) : "Si la cuenta está pendiente de confirmación, enviamos un nuevo enlace. Revisa también correo no deseado.");
    setLoading(false);
  };

  if (accountEmail && !recovering && location.pathname === "/acceso" && !location.search && !loading) {
    const closeAccount = async () => {
      await lvjAuth.auth.signOut({ scope: "local" });
      setAccountEmail("");
      navigate("/", { replace: true });
    };

    return (
      <main className="min-h-screen bg-[#030303] px-5 py-8 text-[#F8F5EA]">
        <div className="mx-auto w-full max-w-[390px]">
          <header className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]">
              <UserRound className="h-8 w-8" />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">La Voz de Jesús</p>
            <h1 className="mt-2 font-display text-3xl">Mi cuenta</h1>
            <p className="mt-2 text-sm text-[#8F897C]">Tu sesión está activa en este dispositivo.</p>
          </header>
          <section className="mt-8 rounded-2xl border border-[#D4AF37]/25 bg-[#0B0B0B] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-5 w-5" /></span>
              <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Sesión iniciada</p><p className="mt-1 truncate text-sm font-semibold">{accountEmail}</p></div>
            </div>
          </section>
          <div className="mt-5 grid gap-3">
            <Link to="/mas" className="flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E7BE4C] to-[#F2D27A] px-4 text-sm font-bold text-black">Volver a Más</Link>
            <button type="button" onClick={closeAccount} className="min-h-12 rounded-xl border border-red-400/25 bg-red-950/10 px-4 text-sm font-semibold text-red-200">Cerrar sesión</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] px-3 py-2 text-[#F8F5EA] sm:px-4 sm:py-4">
      <div
        className="pointer-events-none fixed inset-0 bg-contain bg-top bg-no-repeat opacity-100"
        style={{ backgroundImage: "url('/images/auth-bg.svg')" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,.12),transparent_34%),linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.78)_58%,#030303_100%)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-[360px]">
        <section className="relative mb-3 px-2 pb-1 pt-1 text-center">
          <div className="relative mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#FFF1A8]/50 bg-gradient-to-br from-[#FFE28A] via-[#D4AF37] to-[#B88716] shadow-[0_0_38px_rgba(212,175,55,.28)]">
            <BookOpen className="h-7 w-7 text-black" strokeWidth={2.2} aria-hidden="true" />
          </div>

          <h1 className="relative mt-2 font-display text-[1.65rem] font-semibold leading-none tracking-tight text-[#FFFDF5] drop-shadow-[0_2px_8px_rgba(0,0,0,.75)] sm:text-[2rem]">
            Acceso a LVJPRAYER
          </h1>

          <p className="relative mx-auto mt-2 max-w-[330px] text-[.82rem] leading-[1.32] text-[#F6F1E6] drop-shadow-[0_2px_6px_rgba(0,0,0,.9)]">
            Inicia sesión o crea tu cuenta para disfrutar de una experiencia personalizada en La Voz de Jesús.
          </p>

          <div className="relative mt-3 grid grid-cols-4 gap-1">
            <Benefit icon={UserRound} label="Tu contenido" sublabel="personalizado" />
            <Benefit icon={Heart} label="Guarda tus" sublabel="favoritos" />
            <Benefit icon={Cloud} label="Sincroniza" sublabel="en todos tus dispositivos" />
            <Benefit icon={ShieldCheck} label="Privacidad" sublabel="y seguridad" />
          </div>
        </section>

        <section className="px-1 py-1">
          {!recovering ? (
            <div className="grid grid-cols-2 border-b border-[#D4AF37]/45">
              {(["login", "register"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setMessage("");
                  }}
                  className={`min-h-11 rounded-t-xl px-2 text-[.9rem] font-bold transition-all duration-200 ${mode === item
                    ? "bg-gradient-to-r from-[#D4AF37] via-[#E7BE4C] to-[#F4D26D] text-black shadow-[0_5px_22px_rgba(212,175,55,.20)]"
                    : "text-[#C9C3B3] hover:bg-white/5 hover:text-[#F8F5EA]"}`}
                >
                  {item === "login" ? "Iniciar sesión" : "Registrarme"}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.1rem] border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4 text-center">
              <h2 className="font-display text-lg font-bold">Establece tu contraseña</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#C9C3B3]">Escribe una nueva contraseña segura para terminar de recuperar tu cuenta.</p>
            </div>
          )}

          <form onSubmit={submit} className="mt-3 space-y-2.5">
            {!recovering && mode === "register" ? (
              <Field icon={UserRound} label="Nombre (opcional)" type="text" value={name} onChange={setName} autoComplete="name" placeholder="Tu nombre" />
            ) : null}

            {!recovering ? (
              <Field icon={Mail} label="Correo electrónico" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="tu@correo.com" required />
            ) : null}

            <PasswordField
              label="Contraseña"
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              autoComplete={mode === "login" && !recovering ? "current-password" : "new-password"}
              placeholder="Mínimo 8 caracteres"
            />

            {mode === "register" || recovering ? (
              <PasswordField
                label="Confirmar contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                minLength={8}
              />
            ) : null}

            {!recovering && mode === "register" ? (
              <section className="border-t border-[#D4AF37]/30 pt-2.5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                    <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                  </span>
                  <div>
                    <h2 className="text-xs font-bold text-[#F8F5EA]">Consentimientos y tratamiento de datos</h2>
                    <p className="mt-0.5 text-[10px] text-[#8F897C]">Revisa las políticas oficiales antes de crear tu cuenta.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <ConsentRow checked={acceptTerms} onChange={setAcceptTerms} icon={FileText}>
                    Acepto los <a href="https://panelapp.lavozdejesus.co/term_of_use.php" target="_blank" rel="noreferrer" className="font-semibold text-[#D4AF37] underline underline-offset-2">Términos de uso</a> de LVJPRAYER <RequiredMark />
                  </ConsentRow>
                  <ConsentRow checked={acceptPrivacy} onChange={setAcceptPrivacy} icon={ShieldCheck}>
                    He leído la <a href="https://panelapp.lavozdejesus.co/privacy_policy.php" target="_blank" rel="noreferrer" className="font-semibold text-[#D4AF37] underline underline-offset-2">Política de privacidad y tratamiento de datos</a> <RequiredMark />
                  </ConsentRow>
                  <ConsentRow checked={acceptDataTreatment} onChange={setAcceptDataTreatment} icon={CheckCircle2}>
                    Autorizo el <strong className="text-[#F8F5EA]">tratamiento de mis datos personales</strong> conforme a la Política de privacidad y para las finalidades informadas por LVJPRAYER <RequiredMark />
                  </ConsentRow>
                  <ConsentRow checked={acceptCommunications} onChange={setAcceptCommunications} icon={Mail}>
                    Deseo recibir comunicaciones de LVJPRAYER sobre novedades, contenidos, actividades y servicios <span className="text-[#8F897C]">(Opcional)</span>
                  </ConsentRow>
                </div>

                <p className="mt-2 flex gap-2 text-[9px] leading-relaxed text-[#777166]">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
                  <span>Los consentimientos marcados con * son necesarios para crear la cuenta. La opción de comunicaciones es voluntaria.</span>
                </p>
              </section>
            ) : null}

            {!recovering ? (
              <p className="px-1 text-center text-[11px] leading-relaxed text-[#8F897C]">
                Tu sesión se mantendrá activa en este dispositivo hasta que elijas <strong className="text-[#D4AF37]">Cerrar sesión</strong> desde <strong className="text-[#F8F5EA]">Más</strong>.
              </p>
            ) : null}

            <button
              disabled={loading || syncingAccount}
              className="min-h-12 w-full rounded-[.85rem] bg-gradient-to-r from-[#D4AF37] via-[#E7BE4C] to-[#F2D27A] px-4 py-3 text-[.92rem] font-bold text-black shadow-[0_8px_28px_rgba(212,175,55,.18)] transition-transform active:scale-[.99] disabled:opacity-50"
            >
              {loading || syncingAccount ? "Habilitando cuenta..." : recovering ? "Guardar nueva contraseña" : mode === "login" ? "Iniciar sesión  ›" : "Crear mi cuenta  ›"}
            </button>
          </form>

          {!recovering && mode === "login" ? (
            <button type="button" disabled={loading} onClick={resetPassword} className="mt-1 min-h-8 w-full text-xs font-medium text-[#D4AF37] hover:text-[#F2D27A]">
              ¿Olvidaste tu contraseña?
            </button>
          ) : null}

          {message ? (
            <p role={success ? "status" : "alert"} className={`mt-2 rounded-lg border p-2 text-center text-xs ${success ? "border-emerald-400/25 bg-emerald-950/20 text-emerald-200" : "border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F2D27A]"}`}>
              {message}
            </p>
          ) : null}

          {registrationSubmitted ? (
            <div className="mt-3 grid gap-2">
              <button type="button" disabled={loading} onClick={resendConfirmation} className="min-h-11 rounded-xl border border-[#D4AF37]/30 px-3 text-sm font-semibold text-[#D4AF37]">Reenviar confirmación</button>
              <button type="button" disabled={loading} onClick={resetPassword} className="min-h-11 rounded-xl border border-white/10 px-3 text-sm text-[#C9C3B3]">Ya tenía acceso: establecer contraseña</button>
            </div>
          ) : null}

          {!recovering ? (
            <Link to="/" className="mt-1 block min-h-8 pt-1 text-center text-xs text-[#C9C3B3] hover:text-[#F8F5EA]">
              ← Volver a LVJPRAYER
            </Link>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Benefit({ icon: Icon, label, sublabel }: { icon: typeof UserRound; label: string; sublabel: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
      <Icon className="h-6 w-6 text-[#FFD44F] drop-shadow-[0_2px_5px_rgba(0,0,0,.9)]" aria-hidden="true" />
      <span className="text-[10px] font-semibold leading-tight text-[#FFFDF5] drop-shadow-[0_2px_5px_rgba(0,0,0,.9)]">{label}</span>
      <span className="text-[9px] leading-tight text-[#E2DDD2] drop-shadow-[0_2px_5px_rgba(0,0,0,.9)]">{sublabel}</span>
    </div>
  );
}

function ConsentRow({ checked, onChange, icon: Icon, children }: { checked: boolean; onChange: (value: boolean) => void; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 border-b border-white/5 py-1.5 text-[10px] leading-relaxed text-[#C9C3B3] transition-colors hover:border-[#D4AF37]/25">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4AF37]" />
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
      <span>{children}</span>
    </label>
  );
}

function RequiredMark() {
  return <strong className="text-[#D4AF37]"> *</strong>;
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  ...input
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[.08em] text-[#D4AF37]">{label}</label>
      <div className="mt-0.5 flex min-h-11 rounded-lg border border-[#D4AF37]/35 bg-[#111]/95 px-3 transition-colors focus-within:border-[#D4AF37]/75 focus-within:shadow-[0_0_0_3px_rgba(212,175,55,.08)]">
        <Icon className="my-auto h-5 w-5 shrink-0 text-[#D4AF37]" />
        <input {...input} value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-[.88rem] text-[#F8F5EA] outline-none placeholder:text-[#85818A]" />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
  autoComplete,
  placeholder,
  minLength = 8,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
}) {
  return (
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[.08em] text-[#D4AF37]">{label}</label>
      <div className="mt-1 flex min-h-14 rounded-xl border border-[#D4AF37]/35 bg-[#111]/95 px-3 transition-colors focus-within:border-[#D4AF37]/75 focus-within:shadow-[0_0_0_3px_rgba(212,175,55,.08)]">
        <LockKeyhole className="my-auto h-5 w-5 shrink-0 text-[#D4AF37]" />
        <input
          required
          minLength={minLength}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent px-3 text-[1rem] text-[#F8F5EA] outline-none placeholder:text-[#85818A]"
          placeholder={placeholder}
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="min-h-9 px-1 text-[#E6E1D8]" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
