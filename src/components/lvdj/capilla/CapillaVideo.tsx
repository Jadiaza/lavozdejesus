import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
  const [streamError, setStreamError] = useState("");
  const [muted, setMuted] = useState(true);
  const location = [ciudad, pais].filter(Boolean).join(", ");
  const streamUrl = stream?.url_stream ?? "";
  const streamType = stream?.tipo_stream?.toLowerCase() ?? "";
  const youtubeUrl = streamType === "youtube" ? youtubeEmbedUrl(streamUrl) : "";
  const vimeoUrl = streamType === "vimeo" ? vimeoEmbedUrl(streamUrl) : "";
  const iframeUrl = streamType === "iframe" ? streamUrl : "";
  const embedUrl = youtubeUrl || vimeoUrl || iframeUrl;
  const useMediaElement =
    Boolean(streamUrl) && (isHlsStream(stream) || streamType === "audio" || streamType === "otro");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
  }, [muted, useMediaElement]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) {
      void video.play();
    }
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
        <div id="capilla-transmision" className="relative aspect-video w-full overflow-hidden bg-black">
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
              ref={videoRef}
              className="h-full w-full bg-black"
              autoPlay
              muted={muted}
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

          <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-gold/30 bg-[#07111c]/80 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(214,170,64,0.65)]" />
            En vivo
          </div>

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

      {useMediaElement ? (
        <button
          type="button"
          onClick={toggleSound}
          className="mx-auto mt-2 flex min-h-11 w-full max-w-[430px] items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-[#07111c]/70 px-4 py-2 text-xs font-semibold text-gold shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-md transition hover:bg-gold/[0.06] active:scale-[0.985]"
          aria-label={muted ? "Activar sonido" : "Desactivar sonido"}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {muted ? "Activar sonido" : "Desactivar sonido"}
        </button>
      ) : null}
    </section>
  );
};
