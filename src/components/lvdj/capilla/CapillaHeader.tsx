import { useEffect } from "react";
import { ArrowLeft, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type CapillaHeaderProps = {
  nombre?: string;
  subtitulo?: string;
  logoUrl?: string;
};

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
  unlock?: () => void;
};

export const CapillaHeader = ({
  nombre = "Capilla Virtual",
  subtitulo = "Adoracion Eucaristica - 24 horas",
  logoUrl = "",
}: CapillaHeaderProps) => {
  const navigate = useNavigate();

  const lockPhoneLandscape = async () => {
    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const orientation = screen.orientation as LockableScreenOrientation | undefined;

    if (!isPhone || !orientation?.lock) return;

    try {
      await orientation.lock("landscape");
    } catch {
      // Some mobile browsers do not allow locking orientation.
    }
  };

  useEffect(() => {
    const restoreOrientation = () => {
      if (!document.fullscreenElement) {
        const orientation = screen.orientation as LockableScreenOrientation | undefined;
        orientation?.unlock?.();
      }
    };

    document.addEventListener("fullscreenchange", restoreOrientation);
    return () => {
      document.removeEventListener("fullscreenchange", restoreOrientation);
      const orientation = screen.orientation as LockableScreenOrientation | undefined;
      orientation?.unlock?.();
    };
  }, []);

  const handleFullscreen = async () => {
    const element = document.getElementById("capilla-transmision");
    const video = element?.querySelector("video") as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    const fullscreenElement = element as
      | (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void })
      | null;

    if (!element) return;

    if (!document.fullscreenElement && element.requestFullscreen) {
      try {
        await element.requestFullscreen();
        await lockPhoneLandscape();
      } catch {
        video?.webkitEnterFullscreen?.();
      }
      return;
    }

    if (!document.fullscreenElement && fullscreenElement?.webkitRequestFullscreen) {
      await Promise.resolve(fullscreenElement.webkitRequestFullscreen());
      await lockPhoneLandscape();
      return;
    }

    if (!document.fullscreenElement && video?.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      void document.exitFullscreen();
    }
  };

  return (
    <header className="relative z-30 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-[430px] items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#07111c]/55 p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-black/15 text-foreground/90 transition hover:border-gold/60 hover:text-gold active:scale-95"
          aria-label="Regresar"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5 text-left">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`Logotipo de ${nombre}`}
              className="h-9 w-9 shrink-0 rounded-full object-contain"
              loading="lazy"
            />
          ) : null}
          <div className="min-w-0">
            <h1 className="truncate font-display text-[1.35rem] font-semibold leading-tight text-foreground min-[390px]:text-2xl">
              {nombre}
            </h1>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-gold/90 min-[390px]:text-[11px]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="truncate">{subtitulo}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFullscreen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-black/15 text-foreground/90 transition hover:border-gold/60 hover:text-gold active:scale-95"
          aria-label="Pantalla completa"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
