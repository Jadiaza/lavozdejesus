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
    return <main className="lvj-sacred-page flex min-h-screen items-center justify-center px-6 text-center">
      <div className="lvj-sacred-panel max-w-sm p-8">
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
    </main>;
  }

  return (
    <main className="lvj-sacred-page min-h-screen px-4 pb-10 pt-7 text-[#F4EBD0] sm:px-6 sm:pt-10">
      <div className="lvj-sacred-backdrop" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl">
        <header className="flex items-center justify-center gap-3 text-center">
          <img src="/pwa-192.png" alt="Logo de LVJPRAYER" className="h-14 w-14 rounded-2xl border border-[#D4AF37]/40 shadow-lg" />
          <div className="text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">La Voz de Jesús</p>
            <p className="text-2xl font-black tracking-wide text-[#FFF7DF]">LVJPRAYER</p>
            <p className="text-xs text-white/60">Conecta tu espíritu</p>
          </div>
        </header>

        <section className="mx-auto mt-9 grid max-w-4xl items-center gap-8 md:grid-cols-[1.05fr_.95fr] md:gap-12">
          <div className="text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/[0.07] px-3 py-1.5 text-xs font-semibold text-[#E7C96B]">
              <Sparkles className="h-3.5 w-3.5" /> Tu fe, siempre contigo
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#FFF7DF] sm:text-5xl">
              Un espacio para <span className="text-[#D4AF37]">encontrarte con Jesús</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/75 md:mx-0">
              Ora, lee la Biblia, vive la Liturgia, reza el Rosario y escucha la radio católica desde un solo lugar.
            </p>
            <button type="button" onClick={install} disabled={installing} className="lvj-sacred-button mt-7 w-full max-w-sm text-sm disabled:opacity-60">
              <Download className="h-5 w-5" /> {installing ? "Preparando instalación…" : "Instalar LVJPRAYER"}
            </button>
            <p className="mt-3 text-xs text-white/50">Gratis · Sin descargar desde una tienda · Acceso desde tu pantalla de inicio</p>
            <button type="button" onClick={() => navigate("/")} className="mt-4 text-sm text-[#D4AF37] underline-offset-4 hover:underline">
              Continuar en el navegador
            </button>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <div className="relative rounded-[2.4rem] border border-[#D4AF37]/40 bg-gradient-to-b from-[#182139] to-[#05070D] p-3 shadow-2xl shadow-black/50">
              <div className="mx-auto mb-5 mt-1 h-1.5 w-16 rounded-full bg-white/20" />
              <div className="rounded-[1.8rem] border border-white/10 bg-[#0B1020] px-5 pb-6 pt-7 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10">
                  <img src="/pwa-192.png" alt="" className="h-16 w-16 rounded-full" />
                </div>
                <p className="mt-4 text-xl font-bold text-[#FFF7DF]">Tu encuentro con Jesús</p>
                <p className="mt-1 text-xs text-white/55">Oración · Palabra · Fe</p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
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
                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#D4AF37]">
                  <Smartphone className="h-4 w-4" /> Siempre a un toque de distancia
                </div>
              </div>
            </div>
          </div>
        </section>

        {showHelp && (
          <section className="lvj-sacred-panel mx-auto mt-8 max-w-2xl p-5 sm:p-6" aria-live="polite">
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

        <section className="mx-auto mt-10 max-w-4xl">
          <div className="mb-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">Un ecosistema de fe</p>
            <h2 className="mt-2 text-2xl font-bold text-[#FFF7DF]">Todo lo que alimenta tu vida espiritual</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Biblia", "Lee, estudia y medita la Palabra."],
              ["Oración", "Encuentra oraciones y devociones para cada día."],
              ["Radio católica", "Acompaña tus momentos con música y esperanza."],
            ].map(([title, description]) => (
              <article key={title} className="lvj-sacred-card p-4 text-center">
                <h3 className="font-bold text-[#E7C96B]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
              </article>
            ))}
          </div>
        </section>
        <footer className="mt-10 text-center text-xs text-white/40">LVJPRAYER · La Voz de Jesús · Conecta tu espíritu</footer>
      </div>
    </main>
  );
}
