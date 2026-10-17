import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Download, Heart, Headphones, Church, Smartphone, Share, PlusSquare, CheckCircle2, Sparkles } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function detectIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function standaloneInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export default function Instalar() {
  const navigate = useNavigate();
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [closeHint, setCloseHint] = useState(false);

  useEffect(() => {
    setInstalled(standaloneInstalled());
    setIos(detectIOS());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    const media = window.matchMedia("(display-mode: standalone)");
    const onModeChange = () => setInstalled(standaloneInstalled());

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    media.addEventListener?.("change", onModeChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      media.removeEventListener?.("change", onModeChange);
    };
  }, []);

  const install = async () => {
    if (promptEvent) {
      setInstalling(true);
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") setInstalled(true);
        else setShowHelp(true);
      } catch {
        setShowHelp(true);
      } finally {
        setInstalling(false);
        setPromptEvent(null);
      }
      return;
    }
    setShowHelp(true);
  };

  if (installed) {
    return (
      <main className="lvj-sacred-page flex min-h-screen items-center justify-center px-6 py-10 text-center">
        <div className="lvj-sacred-backdrop" aria-hidden="true" />
        <div className="lvj-sacred-panel relative z-10 max-w-sm p-8">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-[#D4AF37]" />
          <h1 className="text-2xl font-bold text-[#F4EBD0]">¡LVJPRAYER está instalada!</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">La instalación se completó correctamente. Para entrar, cierra esta pestaña y abre LVJPRAYER desde el nuevo icono que apareció en la pantalla de inicio de tu dispositivo.</p>
          <p className="mt-4 text-xs text-[#D4AF37]">Tu espacio de oración te espera.</p>
          <button
            type="button"
            onClick={() => {
              window.close();
              window.setTimeout(() => setCloseHint(true), 250);
            }}
            className="lvj-sacred-button mt-6 w-full"
          >
            Cerrar instalador
          </button>
          {closeHint && (
            <p className="mt-3 text-xs leading-5 text-white/65">
              El navegador no permite que una página cierre toda la aplicación del navegador. Cierra esta pestaña desde el selector de pestañas y abre LVJPRAYER desde su icono en la pantalla de inicio.
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="lvj-sacred-page relative min-h-screen overflow-hidden px-5 pb-0 pt-8 text-[#F4EBD0] sm:px-8 sm:pt-12">
      <div className="lvj-sacred-backdrop" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 88% 24%, rgba(180,119,42,.24), transparent 27%), radial-gradient(ellipse at 5% 47%, rgba(212,175,55,.12), transparent 22%), linear-gradient(180deg, rgba(4,8,17,.22), rgba(3,6,13,.96))",
        }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <header className="flex w-full max-w-xl items-center justify-center gap-4 text-left sm:gap-6">
          <img
            src="/pwa-192.png"
            alt="Logo de LVJPRAYER"
            className="h-[76px] w-[76px] shrink-0 rounded-[1.35rem] border border-[#E6C75C]/70 bg-black object-cover shadow-[0_0_24px_rgba(212,175,55,.16)] sm:h-24 sm:w-24"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E5C34F] sm:text-sm sm:tracking-[0.3em]">La Voz de Jesús</p>
            <h1 className="mt-1 text-[1.75rem] font-black leading-none tracking-tight text-[#FFF9E9] sm:text-5xl">LVJPRAYER</h1>
            <p className="mt-2 text-sm text-white/70 sm:text-xl">Conecta tu espíritu</p>
          </div>
        </header>

        <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/70 bg-black/35 px-5 py-2.5 text-sm font-semibold text-[#F2D66F] shadow-[0_0_18px_rgba(212,175,55,.08)] sm:mt-12 sm:px-7 sm:text-lg">
          <Sparkles className="h-5 w-5" /> Tu fe, siempre contigo
        </div>

        <section className="mt-8 w-full sm:mt-10">
          <h2 className="mx-auto max-w-3xl font-serif text-[2.65rem] font-semibold leading-[1.08] tracking-[-0.045em] text-[#FFF9EF] sm:text-6xl md:text-7xl">
            Un espacio para
            <span className="mt-2 block text-[#EBC33F]">encontrarte con Jesús</span>
          </h2>
          <div className="mx-auto mt-6 flex w-full max-w-xl items-center gap-2 text-[#E4BD48]" aria-hidden="true">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9D7625] to-[#D7B64B]" />
            <span className="text-xl">✧</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#9D7625] to-[#D7B64B]" />
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-[1.55] text-white/90 sm:text-2xl sm:leading-relaxed">
            Ora, lee la Biblia, vive la Liturgia, reza el Rosario y escucha la radio católica desde un solo lugar.
          </p>

          <button
            type="button"
            onClick={install}
            disabled={installing}
            className="mt-8 inline-flex min-h-[76px] w-full max-w-2xl items-center justify-center gap-4 rounded-[1.55rem] border-2 border-[#FFF0A0] bg-gradient-to-b from-[#FFE985] via-[#F3C84E] to-[#D89A20] px-5 py-5 text-lg font-black uppercase tracking-wide text-[#100D05] shadow-[0_0_0_1px_rgba(159,111,16,.75),0_0_18px_rgba(240,190,54,.32),inset_0_1px_0_rgba(255,255,255,.8)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 disabled:opacity-60 sm:mt-10 sm:min-h-[96px] sm:text-3xl"
          >
            <Download className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" />
            <span>{installing ? "Preparando instalación…" : "Instalar LVJPRAYER"}</span>
          </button>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/70 sm:text-lg">
            Gratis · Sin descargar desde una tienda · Acceso desde tu pantalla de inicio
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-5 text-base text-[#F0C43E] underline decoration-[#F0C43E]/60 underline-offset-4 transition hover:text-[#FFE68B] sm:text-xl"
          >
            Continuar en el navegador
          </button>
        </section>

        {showHelp && (
          <section className="lvj-sacred-panel mt-7 w-full max-w-2xl p-5 text-left sm:p-6" aria-live="polite">
            <h2 className="text-lg font-bold text-[#FFF7DF]">Cómo instalar LVJPRAYER</h2>
            {ios ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-white/75">
                <li>Abre esta página en <strong className="text-[#FFF7DF]">Safari</strong>.</li>
                <li>Pulsa <strong className="text-[#FFF7DF]">Compartir</strong> <Share className="inline h-4 w-4 text-[#D4AF37]" />.</li>
                <li>Selecciona <strong className="text-[#FFF7DF]">Añadir a pantalla de inicio</strong> <PlusSquare className="inline h-4 w-4 text-[#D4AF37]" /> y confirma.</li>
              </ol>
            ) : (
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/75">
                <p>En Chrome o Edge, abre el menú del navegador (⋮ o …) y elige <strong className="text-[#FFF7DF]">Instalar aplicación</strong> o <strong className="text-[#FFF7DF]">Añadir a pantalla de inicio</strong>.</p>
                <p>Si no aparece esa opción, abre la página en Chrome y vuelve a intentarlo.</p>
              </div>
            )}
          </section>
        )}

        <div className="relative mt-10 w-full max-w-2xl pt-2 sm:mt-14" aria-hidden="true">
          <div className="absolute inset-x-[-22%] bottom-0 top-6 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,.17),transparent_64%)]" />
          <div className="absolute inset-x-[-20%] bottom-4 h-24 -rotate-3 rounded-[50%] border-t border-[#D4AF37]/80 shadow-[0_-8px_30px_rgba(212,175,55,.12)]" />
          <div className="absolute inset-x-[-20%] bottom-0 h-28 rotate-3 rounded-[50%] border-t border-[#6CA9E8]/50" />
          <div className="relative mx-auto w-[92%] rounded-t-[4.2rem] border-x-2 border-t-2 border-[#B9A16B] bg-gradient-to-b from-[#28231A] via-[#080A10] to-[#03050A] p-2.5 shadow-[0_-8px_32px_rgba(212,175,55,.14)] sm:w-[84%] sm:rounded-t-[5rem] sm:p-3">
            <div className="rounded-t-[3.4rem] border-x border-t border-white/10 bg-[radial-gradient(ellipse_at_75%_20%,rgba(139,91,35,.32),transparent_35%),linear-gradient(145deg,#111B2B,#05070D_70%)] px-4 pb-12 pt-6 sm:rounded-t-[4.2rem] sm:pb-16 sm:pt-8">
              <div className="mx-auto mb-7 h-7 w-32 rounded-full border border-white/5 bg-black sm:mb-10" />
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] border-2 border-[#E7C85A] bg-black/80 p-2 shadow-[0_0_30px_rgba(212,175,55,.15)] sm:h-36 sm:w-36">
                <img src="/pwa-192.png" alt="" className="h-full w-full rounded-[1.45rem] object-cover" />
              </div>
              <p className="mt-4 text-lg font-bold text-[#F8E7A4] sm:text-2xl">Tu encuentro con Jesús</p>
              <p className="mt-1 text-xs text-white/55 sm:text-sm">Oración · Palabra · Fe</p>
              <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3 text-left sm:gap-4">
                {[
                  { icon: BookOpen, label: "Biblia", detail: "Lee y medita" },
                  { icon: Heart, label: "Oraciones", detail: "Ora cada día" },
                  { icon: Headphones, label: "Radio", detail: "Escucha y alaba" },
                  { icon: Church, label: "Liturgia", detail: "Vive tu fe" },
                ].map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="rounded-xl border border-[#D4AF37]/20 bg-white/[0.035] p-3">
                    <Icon className="mb-2 h-5 w-5 text-[#D4AF37]" />
                    <p className="text-sm font-semibold text-[#FFF7DF]">{label}</p>
                    <p className="mt-0.5 text-[11px] text-white/50">{detail}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#D4AF37]">
                <Smartphone className="h-4 w-4" /> Siempre a un toque de distancia
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
