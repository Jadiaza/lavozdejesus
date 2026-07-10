import { useEffect, useRef, useState } from "react";
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

  return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
};

const vimeoEmbedUrl = (url: string) => {
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (!vimeoMatch?.[1]) return "";

  return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
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
    if (!useMediaElement || !videoRef.current || !streamUrl) return undefined;

    const video = videoRef.current;
    let hls: HlsInstance | null = null;
    let cancelled = false;
    setStreamError("");

    if (isHlsStream(stream)) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return () => {
          video.removeAttribute("src");
          video.load();
        };
      }

      loadHlsScript()
        .then(() => {
          if (cancelled || !window.Hls?.isSupported()) {
            setStreamError("La transmision no esta disponible en este navegador.");
            return;
          }

          hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        })
        .catch(() => {
          if (!cancelled) {
            setStreamError("La transmision se encuentra temporalmente fuera de servicio.");
          }
        });

      return () => {
        cancelled = true;
        hls?.destroy();
        video.removeAttribute("src");
        video.load();
      };
    }

    video.src = streamUrl;
    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [stream, streamUrl, useMediaElement]);

  return (
    <section className="px-4 pt-4">
      <div className="mx-auto max-w-[430px] overflow-hidden rounded-2xl border border-gold/30 bg-black shadow-deep">
        <div className="relative aspect-video w-full overflow-hidden">
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
              controls
              playsInline
              poster={imagenUrl || undefined}
              aria-label={`${nombre} - transmision en vivo`}
            />
          ) : (
            <div className="grid h-full place-items-center bg-[#07111c] px-6 text-center text-sm text-foreground/75">
              La transmision se encuentra temporalmente fuera de servicio. Permanece en oracion.
            </div>
          )}

          <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-red-700 px-3 py-2 text-sm font-extrabold uppercase text-white shadow-deep">
            <span className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
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
              <p className="rounded-xl border border-red-400/30 bg-red-950/30 p-3 leading-relaxed text-red-100">
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
    </section>
  );
};
