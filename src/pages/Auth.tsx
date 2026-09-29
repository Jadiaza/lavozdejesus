import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Cloud, Eye, EyeOff, FileText, Heart, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  bibleStudyAuth,
  getBibleStudyRememberSession,
  isBibleStudyAuthConfigured,
  setBibleStudyRememberSession,
} from "@/features/biblia/auth/bibleStudyAuth";

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
      if (active) navigate(next, { replace: true });
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
    return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-[#F8F5EA] sm:py-8">
      <div className="mx-auto max-w-md">
        <section className="relative mb-4 overflow-hidden rounded-[1.75rem] border border-[#D4AF37]/35 bg-[radial-gradient(circle_at_72%_8%,rgba(212,175,55,.20),transparent_32%),linear-gradient(145deg,#101010,#050505_70%)] p-5 text-center shadow-[0_18px_60px_rgba(0,0,0,.45)] sm:p-6">
          <div className="pointer-events-none absolute right-[-35px] top-[-35px] h-36 w-36 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#FFF0B0]/40 bg-gradient-to-br from-[#F6D978] via-[#D4AF37] to-[#A77D16] shadow-[0_0_35px_rgba(212,175,55,.22)]">
            <BookOpen className="h-7 w-7 text-black" aria-hidden="true" />
          </span>
          <h1 className="relative mt-4 font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">Acceso a LVJPRAYER</h1>
          <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#C9C3B3]">
            Inicia sesión o crea tu cuenta para disfrutar de una experiencia personalizada en La Voz de Jesús.
          </p>

          <div className="relative mt-5 grid grid-cols-4 gap-2 border-t border-[#D4AF37]/15 pt-4">
            <Benefit icon={UserRound} label="Tu contenido" sublabel="personalizado" />
            <Benefit icon={Heart} label="Guarda tus" sublabel="favoritos" />
            <Benefit icon={Cloud} label="Sincroniza" sublabel="en tus dispositivos" />
            <Benefit icon={ShieldCheck} label="Privacidad" sublabel="y seguridad" />
          </div>
        </section>

        <section className="rounded-[1.85rem] border border-[#D4AF37]/45 bg-[#080808] p-4 shadow-[0_22px_70px_rgba(0,0,0,.55)] sm:p-5">
          {!recovering ? (
            <div className="grid grid-cols-2 rounded-[1.1rem] border border-[#D4AF37]/30 bg-[#111] p-1.5">
              {(["login", "register"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setMode(item); setMessage(""); }}
                  className={`min-h-12 rounded-[0.85rem] px-3 text-sm font-bold transition-all duration-200 ${mode === item ? "bg-gradient-to-r from-[#D4AF37] to-[#F2D27A] text-black shadow-[0_4px_18px_rgba(212,175,55,.18)]" : "text-[#C9C3B3] hover:bg-white/5"}`}
                >
                  {item === "login" ? "Iniciar sesión" : "Registrarme"}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.1rem] border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4 text-center">
              <h2 className="font-display text-lg font-bold text-[#F8F5EA]">Establece tu contraseña</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#C9C3B3]">Escribe una nueva contraseña segura para terminar de recuperar tu cuenta.</p>
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            {!recovering && mode === "register" ? <Field icon={UserRound} label="Nombre (opcional)" type="text" value={name} onChange={setName} autoComplete="name" placeholder="Tu nombre" /> : null}
            {!recovering ? <Field icon={Mail} label="Correo electrónico" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="tu@correo.com" required /> : null}

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
              <Field icon={LockKeyhole} label="Confirmar contraseña" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" placeholder="Repite tu contraseña" required />
            ) : null}

            {!recovering && mode === "register" ? (
              <section className="rounded-[1.35rem] border border-[#D4AF37]/30 bg-[#101010] p-4 shadow-inner">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                    <ShieldCheck className="h-5 w-5 text-[#D4AF37]" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-[#F8F5EA]">Consentimientos y tratamiento de datos</h2>
                    <p className="mt-0.5 text-[10px] text-[#8F897C]">Revisa las políticas oficiales antes de crear tu cuenta.</p>
                  </div>
                </div>

                <div className="space-y-2.5">
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

                <p className="mt-3 flex gap-2 text-[10px] leading-relaxed text-[#777166]">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
                  <span>Los consentimientos marcados con * son necesarios para crear la cuenta. La opción de comunicaciones es voluntaria.</span>
                </p>
              </section>
            ) : null}

            {!recovering ? (
              <label className="flex min-h-11 items-start gap-3 rounded-xl px-1 py-1 text-sm text-[#C9C3B3]">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="mt-1 h-4 w-4 accent-[#D4AF37]" />
                <span>
                  <strong className="text-[#F8F5EA]">Recordar mi sesión</strong>
                  <span className="block text-xs leading-relaxed text-[#8F897C]">Desmárcalo si este dispositivo es compartido. La contraseña nunca se guarda en LVJ.</span>
                </span>
              </label>
            ) : null}

            <button disabled={loading} className="min-h-13 w-full rounded-[1rem] bg-gradient-to-r from-[#D4AF37] via-[#E7BE4C] to-[#F2D27A] px-4 py-3 font-bold text-black shadow-[0_8px_24px_rgba(212,175,55,.16)] transition-transform active:scale-[.99] disabled:opacity-50">
              {loading ? "Procesando..." : recovering ? "Guardar nueva contraseña" : mode === "login" ? "Iniciar sesión" : "Crear mi cuenta"}
            </button>
          </form>

          {!recovering && mode === "login" ? (
            <button type="button" disabled={loading} onClick={resetPassword} className="mt-3 min-h-11 w-full text-sm font-medium text-[#D4AF37] hover:text-[#F2D27A]">¿Olvidaste tu contraseña?</button>
          ) : null}

          {message ? <p role={success ? "status" : "alert"} className={`mt-3 rounded-xl border p-3 text-center text-sm ${success ? "border-emerald-400/25 bg-emerald-950/20 text-emerald-200" : "border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F2D27A]"}`}>{message}</p> : null}

          {registrationSubmitted ? (
            <div className="mt-3 grid gap-2">
              <button type="button" disabled={loading} onClick={resendConfirmation} className="min-h-11 rounded-xl border border-[#D4AF37]/30 px-3 text-sm font-semibold text-[#D4AF37]">Reenviar confirmación</button>
              <button type="button" disabled={loading} onClick={resetPassword} className="min-h-11 rounded-xl border border-white/10 px-3 text-sm text-[#C9C3B3]">Ya tenía acceso: establecer contraseña</button>
            </div>
          ) : null}

          {!recovering ? <Link to="/" className="mt-4 block min-h-11 pt-2 text-center text-sm text-[#C9C3B3] hover:text-[#F8F5EA]">← Volver a LVJPRAYER</Link> : null}
        </section>
      </div>
    </main>
  );


function Benefit({ icon: Icon, label, sublabel }: { icon: typeof UserRound; label: string; sublabel: string }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
      <Icon className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
      <span className="text-[10px] font-semibold leading-tight text-[#F8F5EA]">{label}</span>
      <span className="text-[9px] leading-tight text-[#8F897C]">{sublabel}</span>
    </div>
  );
}

function ConsentRow({ checked, onChange, icon: Icon, children }: { checked: boolean; onChange: (value: boolean) => void; icon: typeof FileText; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/5 bg-[#090909] p-2.5 text-[11px] leading-relaxed text-[#C9C3B3] transition-colors hover:border-[#D4AF37]/20">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4AF37]" />
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
      <span>{children}</span>
    </label>
  );
}

function RequiredMark() {
  return <strong className="text-[#D4AF37]"> *</strong>;
}

function PasswordField({ label, value, onChange, showPassword, setShowPassword, autoComplete, placeholder }: { label: string; value: string; onChange: (value: string) => void; showPassword: boolean; setShowPassword: (value: boolean) => void; autoComplete: string; placeholder: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">{label}</label>
      <div className="mt-1 flex rounded-xl border border-[#D4AF37]/30 bg-[#111] px-3 transition-colors focus-within:border-[#D4AF37]/70 focus-within:shadow-[0_0_0_3px_rgba(212,175,55,.08)]">
        <LockKeyhole className="my-auto h-4 w-4 shrink-0 text-[#D4AF37]" />
        <input required minLength={8} type={showPassword ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className="min-w-0 flex-1 bg-transparent px-3 py-3 outline-none" placeholder={placeholder} />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="min-h-11 px-1 text-[#C9C3B3]" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      </div>
    </div>
  );
}
