import { useCallback, useEffect, useRef, useState } from "react";
import { Minimize2, Volume2, VolumeX } from "lucide-react";
import type { CapillaStreamPublico } from "@/services/sheetsService";

const HLS_JS_URL = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";

type CapillaVideoProps = {
  nombre?: string;
  descripcion?: string;
  ciudad?: string;
  pais?: string;
  sitioWeb?: string;
  imagenUrl?: string;
  stream?: CapillaStreamPublico | null;
};

type HlsInstance = {
  loadSource: (url: string) => void;
  attachMedia: (element: HTMLMediaElement) => void;
  destroy: () => void;
};

type HlsConstructor = {
  new (): HlsInstance;
  isSupported: () => boolean;
};

declare global {
  interface Window {
    Hls?: HlsConstructor;
  }
}

let hlsScriptPromise: Promise<void> | null = null;

const loadHlsScript = () => {
  if (window.Hls) return Promise.resolve();
  if (hlsScriptPromise) return hlsScriptPromise;

  hlsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = HLS_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar HLS.js"));
    document.head.appendChild(script);
  });

  return hlsScriptPromise;
};

const youtubeEmbedUrl = (url: string) => {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  );

  if (!youtubeMatch?.[1]) return "";

  return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1`;
};

const vimeoEmbedUrl = (url: string) => {
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (!vimeoMatch?.[1]) return "";

  return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&controls=0&playsinline=1`;
};

const isHlsStream = (stream?: CapillaStreamPublico | null) =>
  stream?.tipo_stream?.toLowerCase() === "hls" || stream?.url_stream.includes(".m3u8");

export const CapillaVideo = ({
  nombre = "Capilla Virtual",
  descripcion = "",
  ciudad = "",
  pais = "",
  sitioWeb = "",
  imagenUrl = "",
  stream = null,
}: CapillaVideoProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const volumePanelTimerRef = useRef<number | null>(null);
  const [streamError, setStreamError] = useState("");
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isVolumePanelOpen, setIsVolumePanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [systemTime, setSystemTime] = useState(() => Date.now());
  const currentDate = new Date(systemTime);
  const location = [ciudad, pais].filter(Boolean).join(", ");
  const streamUrl = stream?.url_stream ?? "";
  const streamType = stream?.tipo_stream?.toLowerCase() ?? "";
  const youtubeUrl = streamType === "youtube" ? youtubeEmbedUrl(streamUrl) : "";
  const vimeoUrl = streamType === "vimeo" ? vimeoEmbedUrl(streamUrl) : "";
  const iframeUrl = streamType === "iframe" ? streamUrl : "";
  const embedUrl = youtubeUrl || vimeoUrl || iframeUrl;
  const useMediaElement =
    Boolean(streamUrl) && (isHlsStream(stream) || streamType === "audio" || streamType === "otro");
  const liveDate = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(currentDate);
  const liveTime = new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(currentDate);

  const setVideoElement = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video;
    if (video) {
      video.defaultMuted = true;
      video.muted = true;
    }
  }, []);

  useEffect(() => {
    const syncClock = () => setSystemTime(Date.now());
    const timer = window.setInterval(syncClock, 250);
    syncClock();
    document.addEventListener("visibilitychange", syncClock);
    document.addEventListener("fullscreenchange", syncClock);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", syncClock);
      document.removeEventListener("fullscreenchange", syncClock);
      if (volumePanelTimerRef.current !== null) {
        window.clearTimeout(volumePanelTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement?.id === "capilla-transmision");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      void document.exitFullscreen();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const syncMutedState = () => {
      setMuted(video.muted || video.volume === 0);
      setVolume(video.volume);
    };
    video.addEventListener("volumechange", syncMutedState);
    return () => video.removeEventListener("volumechange", syncMutedState);
  }, [useMediaElement]);

  const scheduleVolumePanelClose = () => {
    if (volumePanelTimerRef.current !== null) {
      window.clearTimeout(volumePanelTimerRef.current);
    }
    volumePanelTimerRef.current = window.setTimeout(() => {
      setIsVolumePanelOpen(false);
      volumePanelTimerRef.current = null;
    }, 4_000);
  };

  const toggleVolumePanel = () => {
    const video = videoRef.current;
    if (!video) return;

    if (muted) {
      video.defaultMuted = false;
      video.muted = false;
      if (video.volume === 0) {
        video.volume = 1;
      }
      setMuted(false);

      if (video.paused) {
        void video.play().catch(() => {
          video.defaultMuted = true;
          video.muted = true;
          setMuted(true);
        });
      }
    }

    const nextOpen = !isVolumePanelOpen;
    setIsVolumePanelOpen(nextOpen);
    if (nextOpen) {
      scheduleVolumePanelClose();
    } else if (volumePanelTimerRef.current !== null) {
      window.clearTimeout(volumePanelTimerRef.current);
      volumePanelTimerRef.current = null;
    }
  };

  const changeVolume = (nextVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = nextVolume;
    video.defaultMuted = nextVolume === 0;
    video.muted = nextVolume === 0;
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
    scheduleVolumePanelClose();
  };

  useEffect(() => {
    if (!useMediaElement || !videoRef.current || !streamUrl) return undefined;

    const video = videoRef.current;
    let hls: HlsInstance | null = null;
    let cancelled = false;
    setStreamError("");

    const handlePlaybackError = () => {
      if (!cancelled) {
        setStreamError(
          "La transmisión no está disponible en este momento. Permanece en oración; Jesús sigue presente.",
        );
      }
    };
    const startPlayback = () => {
      if (!cancelled) {
        void video.play().catch(handlePlaybackError);
      }
    };

    video.addEventListener("error", handlePlaybackError);
    video.addEventListener("canplay", startPlayback);

    if (isHlsStream(stream)) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.load();
        return () => {
          cancelled = true;
          video.removeEventListener("error", handlePlaybackError);
          video.removeEventListener("canplay", startPlayback);
          video.removeAttribute("src");
          video.load();
        };
      }

      loadHlsScript()
        .then(() => {
          if (cancelled || !window.Hls?.isSupported()) {
            handlePlaybackError();
            return;
          }

          hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        })
        .catch(() => {
          handlePlaybackError();
        });

      return () => {
        cancelled = true;
        video.removeEventListener("error", handlePlaybackError);
        video.removeEventListener("canplay", startPlayback);
        hls?.destroy();
        video.removeAttribute("src");
        video.load();
      };
    }

    video.src = streamUrl;
    video.load();
    return () => {
      cancelled = true;
      video.removeEventListener("error", handlePlaybackError);
      video.removeEventListener("canplay", startPlayback);
      video.removeAttribute("src");
      video.load();
    };
  }, [stream, streamUrl, useMediaElement]);

  return (
    <section className="px-4 pt-4">
      <div className="mx-auto max-w-[430px] overflow-hidden rounded-2xl border border-gold/30 bg-black shadow-deep">
        <div
          id="capilla-transmision"
          className="relative aspect-video w-full overflow-hidden bg-black [&:fullscreen]:h-screen [&:fullscreen]:aspect-auto"
        >
          {embedUrl ? (
            <iframe
              title={`${nombre} - Adoracion Eucaristica`}
              src={embedUrl}
              className="h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : useMediaElement ? (
            <video
              ref={setVideoElement}
              className="h-full w-full bg-black"
              autoPlay
              playsInline
              disablePictureInPicture
              poster={imagenUrl || undefined}
              aria-label={`${nombre} - transmision en vivo`}
            />
          ) : (
            <div className="grid h-full place-items-center bg-[#07111c] px-6 text-center text-sm text-foreground/75">
              La transmisión no está disponible en este momento. Permanece en oración; Jesús sigue presente.
            </div>
          )}

          {isFullscreen ? (
            <button
              type="button"
              onClick={exitFullscreen}
              className="absolute left-4 top-4 z-20 flex min-h-11 items-center gap-2 rounded-full border border-gold/60 bg-[#07111c]/85 px-4 py-2 text-xs font-bold text-gold shadow-deep backdrop-blur-md transition active:scale-95"
              aria-label="Salir de pantalla completa"
            >
              <Minimize2 className="h-5 w-5" />
              Salir
            </button>
          ) : null}

          <time
            dateTime={currentDate.toISOString()}
            className={`pointer-events-none absolute z-20 rounded-lg border border-gold/35 bg-[#07111c]/80 text-left font-mono font-semibold leading-tight tracking-[0.04em] text-gold shadow-deep backdrop-blur-md transition-all ${
              isFullscreen
                ? "bottom-6 left-6 px-4 py-3 text-xl sm:text-2xl"
                : "bottom-3 left-3 px-2.5 py-1.5 text-[10px] min-[390px]:text-xs"
            }`}
            aria-label={`Transmisión en vivo: ${liveDate}, ${liveTime}`}
          >
            <span className="tabular-nums">{liveDate}: {liveTime}</span>
          </time>

          {isFullscreen && useMediaElement ? (
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
              {isVolumePanelOpen ? (
                <div className="flex items-center px-1 py-1.5">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={muted ? 0 : volume}
                    onChange={(event) => changeVolume(Number(event.target.value))}
                    onPointerDown={scheduleVolumePanelClose}
                    className="h-6 w-28 cursor-pointer appearance-none bg-transparent accent-[#d6aa40] [&::-moz-range-progress]:h-0.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-[#d6aa40] [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#d6aa40] [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/20 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d6aa40]"
                    aria-label="Volumen de la transmisión en pantalla completa"
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={toggleVolumePanel}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 bg-[#07111c]/80 text-gold shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-md transition active:scale-95"
                aria-label={muted ? "Activar sonido y ajustar volumen" : "Ajustar volumen"}
                aria-expanded={isVolumePanelOpen}
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          ) : null}

        </div>

        {(streamError || descripcion || location || imagenUrl || sitioWeb || stream?.nombre) && (
          <div className="grid gap-3 bg-[#07111c] p-4 text-sm text-foreground/82">
            {imagenUrl ? (
              <img
                src={imagenUrl}
                alt=""
                className="h-28 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ) : null}
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">
                {nombre}
              </h2>
              {stream?.nombre ? (
                <p className="mt-1 text-sm font-semibold text-gold/90">{stream.nombre}</p>
              ) : null}
              {location ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold/80">
                  {location}
                </p>
              ) : null}
            </div>
            {streamError ? (
              <p className="rounded-xl border border-gold/20 bg-gold/[0.06] p-3 leading-relaxed text-foreground/75">
                {streamError}
              </p>
            ) : null}
            {descripcion ? (
              <p className="leading-relaxed text-foreground/75">{descripcion}</p>
            ) : null}
            {sitioWeb ? (
              <a
                href={sitioWeb}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit rounded-full border border-gold/30 px-4 py-2 text-xs font-extrabold uppercase text-gold transition active:scale-95"
              >
                Sitio oficial
              </a>
            ) : null}
          </div>
        )}
      </div>

      {useMediaElement && !isFullscreen ? (
        <div className="relative mx-auto mt-2 flex max-w-[430px] items-center justify-end gap-2">
          {isVolumePanelOpen ? (
            <div className="flex items-center px-1 py-1.5">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(event) => changeVolume(Number(event.target.value))}
                onPointerDown={scheduleVolumePanelClose}
                className="h-6 w-28 cursor-pointer appearance-none bg-transparent accent-[#d6aa40] [&::-moz-range-progress]:h-0.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-[#d6aa40] [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#d6aa40] [&::-moz-range-track]:h-0.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-white/20 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#d6aa40]"
                aria-label="Volumen de la transmisión"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={toggleVolumePanel}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 bg-[#07111c]/80 text-gold shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:bg-gold/[0.06] active:scale-95"
            aria-label={muted ? "Activar sonido y ajustar volumen" : "Ajustar volumen"}
            aria-expanded={isVolumePanelOpen}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      ) : null}
    </section>
  );
};
