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
    <main className="lvj-sacred-page relative min-h-screen overflow-hidden px-4 pb-10 pt-4 text-[#F4EBD0] sm:px-8 sm:pt-8">
      <div className="lvj-sacred-backdrop" aria-hidden="true" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 28%, rgba(181,111,35,.26), transparent 38%), linear-gradient(180deg, rgba(4,8,17,.25), rgba(3,6,13,.96))" }} />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <img src="/src/assets/image_app.jpeg" alt="LVJPRAYER, tu encuentro con Jesús. Biblia, oraciones, radio y liturgia." className="block h-auto w-full" loading="eager" decoding="async" />
        <button type="button" onClick={install} disabled={installing} className="-mt-1 inline-flex min-h-[70px] w-full items-center justify-center gap-4 rounded-2xl border-2 border-[#FFF0A0] bg-gradient-to-b from-[#FFE985] via-[#F3C84E] to-[#D89A20] px-5 py-4 text-lg font-black uppercase tracking-wide text-[#100D05] shadow-[0_0_0_1px_rgba(159,111,16,.75),0_0_22px_rgba(240,190,54,.32),inset_0_1px_0_rgba(255,255,255,.8)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 disabled:opacity-60 sm:min-h-[84px] sm:text-2xl">
          <Download className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" />
          <span>{installing ? "Preparando instalación…" : "Instalar LVJPRAYER"}</span>
        </button>
        <div className="mt-6 grid w-full grid-cols-3 divide-x divide-[#D4AF37]/30 rounded-xl border border-[#D4AF37]/20 bg-black/25 py-4">
          <div className="flex flex-col items-center gap-2 px-2"><CheckCircle2 className="h-7 w-7 text-[#D4AF37]" /><p className="text-xs leading-5 text-white/75 sm:text-sm">100% gratis<br />Sin tiendas</p></div>
          <div className="flex flex-col items-center gap-2 px-2"><Smartphone className="h-7 w-7 text-[#D4AF37]" /><p className="text-xs leading-5 text-white/75 sm:text-sm">Acceso desde<br />pantalla de inicio</p></div>
          <div className="flex flex-col items-center gap-2 px-2"><Download className="h-7 w-7 text-[#D4AF37]" /><p className="text-xs leading-5 text-white/75 sm:text-sm">Instalada en<br />tu dispositivo</p></div>
        </div>
        {showHelp && (
          <section className="lvj-sacred-panel mt-6 w-full p-5 text-left sm:p-6" aria-live="polite">
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
