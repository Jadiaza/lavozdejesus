import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, X, Smartphone, Monitor, Share, PlusSquare } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function getPlatform() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
  return "other";
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export default function PWAInstaller() {
  const location = useLocation();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState("other");

  useEffect(() => {
    setPlatform(getPlatform());
    setInstalled(isStandalone());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setOpen(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = () => setInstalled(isStandalone());
    displayMode.addEventListener?.("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener?.("change", onDisplayModeChange);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setInstallPrompt(null);
      return;
    }
    setOpen(true);
  };

  if (installed || location.pathname === "/instalar") return null;

  const isAppleMobile = platform === "ios";
  const isMac = platform === "mac";
  const isAndroid = platform === "android";
  const isWindows = platform === "windows";

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        aria-label="Instalar LVJPRAYER"
        className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-3 z-[60] inline-flex items-center gap-1.5 rounded-full border border-[#8C7540]/70 bg-[#0B1020]/95 px-3 py-2 text-xs font-semibold text-[#F4EBD0] shadow-md transition hover:bg-[#151D30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] sm:bottom-6 sm:right-6 sm:px-3.5 sm:py-2.5"
      >
        <Download className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
        <span>Instalar</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-background p-5 text-foreground shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Download className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="pwa-install-title" className="text-lg font-bold">Instala LVJPRAYER</h2>
                  <p className="text-sm text-muted-foreground">Lleva la oración contigo.</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar instrucciones" className="rounded-full p-2 hover:bg-muted">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {isAppleMobile ? (
              <div className="space-y-3 text-sm leading-relaxed">
                <p>En tu iPhone o iPad, abre esta página en <strong>Safari</strong> y sigue estos pasos:</p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>Pulsa el botón <strong>Compartir</strong> <Share className="inline h-4 w-4" aria-label="Compartir" />.</li>
                  <li>Desplázate y selecciona <strong>Añadir a pantalla de inicio</strong> <PlusSquare className="inline h-4 w-4" aria-label="Añadir a pantalla de inicio" />.</li>
                  <li>Confirma con <strong>Añadir</strong>. El icono de LVJPRAYER aparecerá en tu pantalla de inicio.</li>
                </ol>
                <p className="rounded-lg bg-muted p-3 text-muted-foreground">Si abriste esta página desde otra aplicación, elige primero «Abrir en Safari».</p>
              </div>
            ) : isMac ? (
              <div className="space-y-3 text-sm leading-relaxed">
                <p>En macOS, puedes añadir LVJPRAYER desde el navegador:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong>Safari:</strong> en la barra de menú, abre <strong>Archivo → Añadir al Dock</strong> (en versiones compatibles de macOS).</li>
                  <li><strong>Chrome o Edge:</strong> abre el menú del navegador y busca <strong>Instalar LVJPRAYER</strong> o <strong>Instalar página como aplicación</strong>.</li>
                </ul>
                <p className="text-muted-foreground">Si la opción no aparece, actualiza el navegador y vuelve a abrir esta página.</p>
              </div>
            ) : isWindows ? (
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Para instalar LVJPRAYER en tu computador:</p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>En Chrome o Edge, busca el icono de instalación en la barra de direcciones o abre el menú <strong>⋮</strong>.</li>
                  <li>Selecciona <strong>Instalar LVJPRAYER</strong> o <strong>Aplicaciones → Instalar este sitio como una aplicación</strong>.</li>
                  <li>Confirma la instalación. Podrás abrirla desde el menú Inicio o las aplicaciones.</li>
                </ol>
              </div>
            ) : isAndroid ? (
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Para añadir LVJPRAYER a tu dispositivo Android:</p>
                <ol className="list-decimal space-y-2 pl-5">
                  <li>Abre esta página en Chrome.</li>
                  <li>Pulsa el menú <strong>⋮</strong> y elige <strong>Instalar aplicación</strong> o <strong>Añadir a pantalla de inicio</strong>.</li>
                  <li>Confirma y espera a que aparezca el icono de LVJPRAYER.</li>
                </ol>
                <p className="text-muted-foreground">El nombre de la opción puede variar según el navegador y el dispositivo.</p>
              </div>
            ) : (
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Abre LVJPRAYER en un navegador compatible y busca <strong>Instalar aplicación</strong> en el menú del navegador.</p>
                <p className="text-muted-foreground">La opción depende del navegador y del sistema operativo.</p>
              </div>
            )}

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
              {isAppleMobile ? <Smartphone className="h-4 w-4 shrink-0" /> : <Monitor className="h-4 w-4 shrink-0" />}
              <span>Aplicación oficial de La Voz de Jesús · Conecta tu espíritu.</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Entendido
            </button>
          </section>
        </div>
      )}
    </>
  );
}
