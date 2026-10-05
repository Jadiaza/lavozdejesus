import { LogIn, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { lvjAuth } from "@/features/biblia/auth/bibleStudyAuth";

const DISMISSED_KEY = "lvj_access_prompt_dismissed_v2";
const SPLASH_WAIT_MS = 3100;

export default function WelcomeAccessPrompt() {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alive = true;

    // No interrumpimos rutas internas, recuperación de contraseña ni usuarios
    // que ya tienen una sesión activa.
    if (location.pathname !== "/") return;

    const show = async () => {
      const dismissed = sessionStorage.getItem(DISMISSED_KEY) === "1";
      if (dismissed) return;

      const { data } = await lvjAuth.auth.getSession();
      if (!alive || data.session) return;

      window.setTimeout(() => {
        if (!alive || sessionStorage.getItem(DISMISSED_KEY) === "1") return;
        void lvjAuth.auth.getSession().then(({ data: latest }) => {
          if (!alive || latest.session) return;
          setVisible(true);
        });
      }, SPLASH_WAIT_MS);
    };

    void show();

    const { data: listener } = lvjAuth.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setVisible(false);
      }
    });

    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, [location.pathname]);

  if (!visible) return null;

  const close = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  const login = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
    const destination = location.pathname + location.search + location.hash;
    navigate("/acceso?next=" + encodeURIComponent(destination));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-[3px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lvj-access-title"
    >
      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-[#080B12] p-6 text-[#F8F5EA] shadow-2xl">
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#8F897C] transition hover:bg-white/10 hover:text-white"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10">
            <UserRound className="h-8 w-8 text-[#D4AF37]" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">
            Bienvenido a LVJPRAYER
          </p>
          <h2 id="lvj-access-title" className="mt-2 font-display text-2xl font-semibold">
            Vive tu fe con nosotros
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#B9B3A6]">
            Puedes iniciar sesión para disfrutar de tu experiencia personal o continuar como invitado y explorar libremente los contenidos disponibles.
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={login}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E7BE4C] to-[#F2D27A] px-4 text-sm font-bold text-black shadow-lg"
          >
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={close}
            className="min-h-12 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-semibold text-[#E5E0D5] transition hover:bg-white/[0.07]"
          >
            Continuar como invitado
          </button>
        </div>

        <p className="mt-4 text-center text-[10px] leading-4 text-[#706A5F]">
          Puedes iniciar sesión más adelante desde <strong className="text-[#A79F90]">Más → Mi cuenta</strong>.
        </p>
      </section>
    </div>
  );
}
