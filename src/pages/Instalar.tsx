import { useEffect, useState } from "react";
import appMockup from "@/assets/image_app.png";
import { Download, Heart, Smartphone, Share, PlusSquare, CheckCircle2 } from "lucide-react";

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
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [openHint, setOpenHint] = useState(false);

  useEffect(() => {
    const isIOS = detectIOS();
    setInstalled(standaloneInstalled());
    setIos(isIOS);
    // En iPhone/iPad no existe un cuadro de instalación automática como en Android.
    // Mostramos de inmediato las instrucciones para que el usuario no quede bloqueado.
    if (isIOS && !standaloneInstalled()) setShowHelp(true);

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
    if (ios) {
      setShowHelp((visible) => !visible);
      return;
    }
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
              window.open("/", "_blank", "noopener,noreferrer");
            }}
            className="lvj-sacred-button mt-6 w-full"
          >
            Abrir LVJPRAYER
          </button>
          {openHint && (
            <p className="mt-3 text-xs leading-5 text-white/65">
              Si LVJPRAYER no se abrió como aplicación, vuelve a la pantalla de inicio de tu dispositivo y pulsa el icono de LVJPRAYER que instalaste.
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#03060D] px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-[max(12px,env(safe-area-inset-top))] text-[#F4EBD0] sm:px-8 sm:py-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <img src={appMockup} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,10,3,.74)_0%,rgba(3,7,16,.88)_48%,#03060d_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_22%,rgba(194,137,43,.24),transparent_48%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-24px)] w-full max-w-[430px] flex-col items-center justify-between gap-3 text-center sm:max-w-lg sm:justify-center sm:gap-5">
        <header className="shrink-0 pt-1">
          <h1 className="font-serif text-[clamp(2.2rem,8.5vw,3.8rem)] font-bold leading-none tracking-tight"><span className="text-[#D4AF37]">LVJ</span><span className="text-[#FFF5DE]">PRAYER</span></h1>
          <div className="mx-auto mt-2 h-[2px] w-[min(48vw,230px)] bg-[#D4AF37]" />
          <p className="mt-2 text-[clamp(1.02rem,4.2vw,1.5rem)] font-semibold leading-tight tracking-wide text-[#F7E6B0]">Tu encuentro con Jesús</p>
          <p className="mt-1.5 text-[clamp(.9rem,3.5vw,1.2rem)] tracking-wide text-white/75">Oración · Palabra · Fe</p>
        </header>

        <div className="relative flex h-[clamp(290px,47svh,500px)] w-full shrink-0 items-center justify-center sm:h-[min(53svh,570px)]">
          <div className="relative h-full max-w-full rounded-[2.35rem] border-[2px] border-[#D4AF37] bg-[#080b12] p-[5px] shadow-[0_0_0_1px_rgba(255,238,172,.20),0_0_34px_rgba(199,144,42,.16)]">
            <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#050812]">
              <img src={appMockup} alt="Vista previa de LVJPRAYER con sus accesos a Biblia, Rosario, Oraciones y Radio" className="block h-full w-auto max-w-full object-contain" loading="eager" decoding="async" />
            </div>
            <div className="pointer-events-none absolute left-1/2 top-3 z-20 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-black shadow-inner" />
          </div>
        </div>

        <button type="button" onClick={install} disabled={installing} className="inline-flex min-h-[clamp(58px,8.5svh,78px)] w-full shrink-0 items-center justify-center gap-3 rounded-[1.15rem] border-2 border-[#FFF0A0] bg-gradient-to-b from-[#FFE982] via-[#F5C944] to-[#DCA122] px-4 py-3 text-[clamp(1rem,4.3vw,1.45rem)] font-black uppercase tracking-wide text-[#100D05] shadow-[0_0_0_1px_rgba(159,111,16,.75),0_0_24px_rgba(240,190,54,.30),inset_0_2px_0_rgba(255,255,255,.8)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40 disabled:opacity-60">
          {ios ? <Share className="h-[clamp(22px,6vw,32px)] w-[clamp(22px,6vw,32px)] shrink-0" /> : <Download className="h-[clamp(22px,6vw,32px)] w-[clamp(22px,6vw,32px)] shrink-0" />}
          <span>{installing ? "Preparando instalación…" : ios ? (showHelp ? "Ocultar instrucciones" : "Instalar en iPhone / iPad") : "Instalar LVJPRAYER"}</span>
        </button>

        <div className="grid w-full shrink-0 grid-cols-3 divide-x divide-[#D4AF37]/30 pb-1">
          <div className="flex flex-col items-center gap-1.5 px-1.5"><CheckCircle2 className="h-6 w-6 text-[#D4AF37] sm:h-8 sm:w-8" /><p className="text-[clamp(.65rem,2.8vw,.9rem)] leading-[1.35] text-white/80">100% gratis<br />Sin descargas<br />desde una tienda</p></div>
          <div className="flex flex-col items-center gap-1.5 px-1.5"><Smartphone className="h-6 w-6 text-[#D4AF37] sm:h-8 sm:w-8" /><p className="text-[clamp(.65rem,2.8vw,.9rem)] leading-[1.35] text-white/80">Acceso directo<br />desde tu pantalla<br />de inicio</p></div>
          <div className="flex flex-col items-center gap-1.5 px-1.5"><Heart className="h-6 w-6 text-[#D4AF37] sm:h-8 sm:w-8" /><p className="text-[clamp(.65rem,2.8vw,.9rem)] leading-[1.35] text-white/80">Tu espacio<br />de oración<br />siempre a mano</p></div>
        </div>

        {showHelp && (
          <section className="w-full rounded-2xl border border-[#D4AF37]/40 bg-black/65 p-4 text-left shadow-[0_0_24px_rgba(212,175,55,.10)] backdrop-blur-xl sm:p-6" aria-live="polite">
            <h2 className="text-lg font-bold text-[#FFF7DF]">Instalar LVJPRAYER en tu iPhone o iPad</h2>
            {ios ? (
              <>
                <p className="mt-2 text-sm leading-6 text-white/75">Apple no permite que una página web se instale con un botón automático. Sigue estos pasos desde <strong className="text-[#FFF7DF]">Safari</strong>:</p>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-white/80">
                  <li>Si abriste esta página desde otra aplicación, ábrela en Safari en <strong className="text-[#FFF7DF]">lavozdejesus.vercel.app/instalar</strong>.</li>
                  <li>Pulsa el botón <strong className="text-[#FFF7DF]">Compartir</strong> de Safari <Share className="inline h-4 w-4 text-[#D4AF37]" />.</li>
                  <li>Desplázate por el menú y selecciona <strong className="text-[#FFF7DF]">Añadir a pantalla de inicio</strong> <PlusSquare className="inline h-4 w-4 text-[#D4AF37]" />. Si aparece la opción para abrir como app web, déjala activada.</li>
                  <li>Pulsa <strong className="text-[#FFF7DF]">Añadir</strong>. Después abre LVJPRAYER desde el nuevo icono de la pantalla de inicio.</li>
                </ol>
                <p className="mt-3 text-xs leading-5 text-[#F7E6B0]/80">Si no aparece «Añadir a pantalla de inicio», revisa el menú Editar acciones de Compartir o confirma que estás usando Safari.</p>
              </>
            ) : (
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/75"><p>En Chrome o Edge, abre el menú del navegador (⋮ o …) y elige <strong className="text-[#FFF7DF]">Instalar aplicación</strong> o <strong className="text-[#FFF7DF]">Añadir a pantalla de inicio</strong>.</p><p>Si no aparece esa opción, abre la página en Chrome y vuelve a intentarlo.</p></div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
