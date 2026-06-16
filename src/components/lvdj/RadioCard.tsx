import { useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2, Radio as RadioIcon } from "lucide-react";

const STREAM_URL = "https://stream.zeno.fm/phybdd3ph98uv";
const META_URL =
  "https://api.zeno.fm/mounts/metadata/subscribe/phybdd3ph98uv";

type Status = "idle" | "connecting" | "playing" | "error";

export const RadioCard = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [status, setStatus] = useState<Status>("idle");

  const [nowPlaying, setNowPlaying] = useState(
    "Conecta tu espíritu..."
  );

  // Audio
  useEffect(() => {
    const a = new Audio(STREAM_URL);

    a.preload = "metadata";
    a.crossOrigin = "anonymous";

    audioRef.current = a;

    const onPlaying = () => setStatus("playing");
    const onWaiting = () => setStatus("connecting");
    const onError = () => setStatus("error");
    const onPause = () =>
      setStatus((s) => (s === "playing" ? "idle" : s));

    a.addEventListener("playing", onPlaying);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("error", onError);
    a.addEventListener("pause", onPause);

    return () => {
      a.pause();
      a.src = "";
    };
  }, []);

  // Metadata Zeno
  useEffect(() => {
    const meta = new EventSource(META_URL);

    meta.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

       if (data?.streamTitle) {
  const parts = data.streamTitle.split(" - ");

  setNowPlaying(
    parts.length > 1
      ? parts[parts.length - 1].trim()
      : data.streamTitle
  );
        }
      } catch (err) {
        console.error("Metadata error:", err);
      }
    };

    return () => {
      meta.close();
    };
  }, []);

  const toggle = async () => {
    const a = audioRef.current;

    if (!a) return;

    if (status === "playing" || status === "connecting") {
      a.pause();
      setStatus("idle");
    } else {
      setStatus("connecting");

      try {
        a.load();
        await a.play();
      } catch (err) {
        console.error("Error al reproducir:", err);
        setStatus("error");
      }
    }
  };

  const isOn =
    status === "playing" || status === "connecting";

  const isLong = nowPlaying.length > 25;

  return (
    <button
      onClick={toggle}
      className="group w-full relative overflow-hidden rounded-2xl bg-gradient-gold shadow-gold px-4 py-3 flex items-center gap-4 hover:scale-[1.01] active:scale-[0.99] transition-all"
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-deep/90 shadow-deep">
        {status === "connecting" ? (
          <Loader2 className="h-5 w-5 text-gold animate-spin" />
        ) : isOn ? (
          <Pause className="h-5 w-5 text-gold fill-gold" />
        ) : (
          <Play className="h-5 w-5 text-gold fill-gold ml-0.5" />
        )}
      </span>

      <div className="flex-1 text-left min-w-0">
        <div className="font-sans text-[18px] font-bold text-navy-deep leading-none">
          {isOn ? "EN TRANSMISIÓN" : "ESCUCHAR EN VIVO"}
        </div>

       <div className="mt-1">
  <div className="text-[11px] uppercase tracking-[0.15em] text-navy-deep/60 font-semibold">
    Ahora suena
  </div>

  <div className="text-sm font-bold text-navy-deep leading-tight mt-0.5 line-clamp-2">
    {nowPlaying}
  </div>
        </div>

        {status === "error" && (
          <div className="text-xs text-red-700 mt-1">
            No se pudo conectar a la transmisión
          </div>
        )}
      </div>

      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-navy-deep/15 shrink-0">
        {isOn && (
          <span className="absolute inset-0 rounded-full animate-ping bg-navy-deep/30" />
        )}

        <RadioIcon className="h-4 w-4 text-navy-deep relative" />
      </span>
    </button>
  );
};