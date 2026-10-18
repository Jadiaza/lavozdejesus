import { useEffect, useState } from "react";
import appMockup from "@/assets/image_app.jpeg";
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
  const [openHint, setOpenHint] = useState(false);

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
          <p className="mt-3 text-sm leading-6 text-white/75">La instalación se completó correctamente. Tu espacio de oración te espera.</p>
          <button
            type="button"
            onClick={() => {
              setOpenHint(true);
              // Intentamos abrir la ruta principal en otra pestaña.
              // El navegador no garantiza que esto active la PWA instalada.
              window.open("/", "_blank", "noopener,noreferrer");
            }}
            className="lvj-sacred-button mt-6 w-full"
          >
            Abrir LVJPRAYER
          </button>
          {openHint && (
            <p className="mt-3 text-xs leading-5 text-white/65">
              Si LVJPRAYER no se abrió como aplicación, vuelve a la pantalla de inicio de tu dispositivo y pulsa el icono de LVJPRAYER que acabas de instalar.
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03060D] px-5 pb-10 pt-8 text-[#F4EBD0] sm:px-8 sm:pt-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src={appMockup} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,10,3,.78)_0%,rgba(3,7,16,.88)_45%,#03060d_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(194,137,43,.2),transparent_45%)]" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <header className="mb-7">
          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl"><span className="text-[#D4AF37]">LVJ</span><span className="text-[#FFF5DE]">PRAYER</span></h1>
          <div className="mx-auto mt-2 h-[2px] w-48 bg-[#D4AF37]" />
          <p className="mt-4 text-xl font-semibold tracking-wide text-[#F7E6B0] sm:text-2xl">Tu encuentro con Jesús</p>
          <p className="mt-3 text-lg tracking-wide text-white/65 sm:text-xl">Oración · Palabra · Fe</p>
        </header>
        <div className="relative mb-7 w-[82%] max-w-[390px] rounded-[3.5rem] border-[5px] border-[#D4AF37] bg-[#080b12] p-3 shadow-[0_0_0_2px_rgba(255,238,172,.25),0_0_50px_rgba(199,144,42,.18)] sm:w-[78%]">
          <div className="absolute left-1/2 top-5 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black shadow-inner" />
          <div className="overflow-hidden rounded-[2.7rem] border border-white/10 bg-[#050812]">
            <img src={appMockup} alt="Vista previa de LVJPRAYER con sus accesos a Biblia, Rosario, Oraciones y Radio" className="block h-auto w-full scale-[1.015] blur-[1.1px]" loading="eager" decoding="async" />
          </div>
        </div>
        <button type="button" onClick={install} disabled={installing} className="inline-flex min-h-[76px] w-full items-center justify-center gap-4 rounded-[1.45rem] border-2 border-[#FFF0A0] bg-gradient-to-b from-[#FFE982] via-[#F5C944] to-[#DCA122] px-5 py-4 text-xl font-black uppercase tracking-wide text-[#100D05] shadow-[0_0_0_1px_rgba(159,111,16,.75),0_0_28px_rgba(240,190,54,.32),inset_0_2px_0_rgba(255,255,255,.8)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 disabled:opacity-60 sm:min-h-[88px] sm:text-2xl">
          <Download className="h-8 w-8 shrink-0" />
          <span>{installing ? "Preparando instalación…" : "Instalar LVJPRAYER"}</span>
        </button>
        <div className="mt-8 grid w-full grid-cols-3 divide-x divide-[#D4AF37]/30">
          <div className="flex flex-col items-center gap-3 px-2"><CheckCircle2 className="h-8 w-8 text-[#D4AF37]" /><p className="text-sm leading-6 text-white/80 sm:text-base">100% gratis<br />Sin descargas<br />desde una tienda</p></div>
          <div className="flex flex-col items-center gap-3 px-2"><Smartphone className="h-8 w-8 text-[#D4AF37]" /><p className="text-sm leading-6 text-white/80 sm:text-base">Acceso desde<br />tu pantalla de inicio</p></div>
          <div className="flex flex-col items-center gap-3 px-2"><Download className="h-8 w-8 text-[#D4AF37]" /><p className="text-sm leading-6 text-white/80 sm:text-base">Instalada en<br />tu dispositivo</p></div>
        </div>
        {showHelp && (
          <section className="mt-7 w-full rounded-2xl border border-[#D4AF37]/30 bg-black/50 p-5 text-left backdrop-blur-xl sm:p-6" aria-live="polite">
            <h2 className="text-lg font-bold text-[#FFF7DF]">Cómo instalar LVJPRAYER</h2>
            {ios ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-white/75">
                <li>Abre esta página en <strong className="text-[#FFF7DF]">Safari</strong>.</li>
                <li>Pulsa <strong className="text-[#FFF7DF]">Compartir</strong> <Share className="inline h-4 w-4 text-[#D4AF37]" />.</li>
                <li>Selecciona <strong className="text-[#FFF7DF]">Añadir a pantalla de inicio</strong> <PlusSquare className="inline h-4 w-4 text-[#D4AF37]" /> y confirma.</li>
              </ol>
            ) : (
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/75"><p>En Chrome o Edge, abre el menú del navegador (⋮ o …) y elige <strong className="text-[#FFF7DF]">Instalar aplicación</strong> o <strong className="text-[#FFF7DF]">Añadir a pantalla de inicio</strong>.</p><p>Si no aparece esa opción, abre la página en Chrome y vuelve a intentarlo.</p></div>
            )}
          </section>
        )}
      </div>
    </main>
  );}
