import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_APP_CONFIG, getAppConfig } from "@/services/sheetsService";
import { RadioPlayerContext } from "./RadioPlayerCore";
import type { RadioPlayerContextValue, RadioStatus } from "./RadioPlayerCore";

const toTitleCase = (value: string) =>
  value
    .replace(/^\d+\.\s*/, "")
    .replace(/^Track\s*\d+\s*-\s*/i, "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const RadioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analysisRef = useRef<{
    analyser: AnalyserNode;
    context: AudioContext;
    data: Uint8Array;
    source: MediaElementAudioSourceNode;
  } | null>(null);
  const analysisAudioRef = useRef<HTMLAudioElement | null>(null);
  const levelRef = useRef(0);
  const bandsRef = useRef({ bass: 0, mid: 0, treble: 0 });
  const [status, setStatus] = useState<RadioStatus>("idle");
  const [streamUrl, setStreamUrl] = useState(DEFAULT_APP_CONFIG.radio_stream_url);
  const [metadataUrl, setMetadataUrl] = useState(
    DEFAULT_APP_CONFIG.radio_metadata_url,
  );
  const [defaultTitle, setDefaultTitle] = useState(
    DEFAULT_APP_CONFIG.radio_default_title,
  );
  const [defaultSubtitle, setDefaultSubtitle] = useState(
    DEFAULT_APP_CONFIG.radio_default_subtitle,
  );
  const [playerImageUrl, setPlayerImageUrl] = useState(
    DEFAULT_APP_CONFIG.radio_player_image_url,
  );
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState(DEFAULT_APP_CONFIG.radio_default_title);
  const [artworkUrl, setArtworkUrl] = useState("");
  const [volume, setVolumeState] = useState(0.5);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioBands, setAudioBands] = useState({
    bass: 0,
    mid: 0,
    treble: 0,
  });

  useEffect(() => {
    let mounted = true;

    getAppConfig()
      .then((config) => {
        if (!mounted) return;

        setStreamUrl(config.radio_stream_url);
        setMetadataUrl(config.radio_metadata_url);
        setDefaultTitle(config.radio_default_title);
        setDefaultSubtitle(config.radio_default_subtitle);
        setPlayerImageUrl(config.radio_player_image_url);
        setTitle((currentTitle) =>
          currentTitle === DEFAULT_APP_CONFIG.radio_default_title
            ? config.radio_default_title
            : currentTitle,
        );
      })
      .catch((error) => {
        console.error("Config error:", error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const audio = new Audio(streamUrl);

    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    audio.volume = 0.5;
    audioRef.current = audio;

    const onPlaying = () => setStatus("playing");
    const onWaiting = () => setStatus("connecting");
    const onError = () => setStatus("error");
    const onPause = () =>
      setStatus((currentStatus) =>
        currentStatus === "playing" || currentStatus === "connecting"
          ? "idle"
          : currentStatus,
      );

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("pause", onPause);

    return () => {
      if (analysisAudioRef.current === audio) {
        analysisRef.current?.source.disconnect();
        analysisRef.current?.analyser.disconnect();
        void analysisRef.current?.context.close();
        analysisRef.current = null;
        analysisAudioRef.current = null;
        levelRef.current = 0;
        bandsRef.current = { bass: 0, mid: 0, treble: 0 };
        setAudioLevel(0);
        setAudioBands({ bass: 0, mid: 0, treble: 0 });
      }

      audio.pause();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("pause", onPause);
      audio.src = "";
      audioRef.current = null;
    };
  }, [streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;

    if (status !== "playing" || !audio) {
      levelRef.current = 0;
      bandsRef.current = { bass: 0, mid: 0, treble: 0 };
      setAudioLevel(0);
      setAudioBands({ bass: 0, mid: 0, treble: 0 });
      return;
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) return;

    let frame = 0;
    let cancelled = false;

    try {
      if (!analysisRef.current || analysisAudioRef.current !== audio) {
        analysisRef.current?.source.disconnect();
        analysisRef.current?.analyser.disconnect();
        void analysisRef.current?.context.close();

        const context = new AudioContextCtor();
        const analyser = context.createAnalyser();
        const source = context.createMediaElementSource(audio);

        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.76;
        source.connect(analyser);
        analyser.connect(context.destination);

        analysisRef.current = {
          analyser,
          context,
          data: new Uint8Array(analyser.frequencyBinCount),
          source,
        };
        analysisAudioRef.current = audio;
      }

      const analysis = analysisRef.current;
      void analysis.context.resume();

      const averageBand = (from: number, to: number, divisor: number) => {
        let sum = 0;
        let peak = 0;
        let count = 0;
        const end = Math.min(to, analysis.data.length);

        for (let index = from; index < end; index += 1) {
          const value = analysis.data[index];
          sum += value;
          peak = Math.max(peak, value);
          count += 1;
        }

        const average = sum / Math.max(1, count);
        const weighted = average * 0.68 + peak * 0.32;

        return Math.min(1, Math.max(0, weighted / divisor));
      };

      const readLevel = () => {
        if (cancelled) return;

        analysis.analyser.getByteFrequencyData(analysis.data);

        let sum = 0;
        const usableBins = Math.min(48, analysis.data.length);

        for (let index = 2; index < usableBins; index += 1) {
          sum += analysis.data[index];
        }

        const average = sum / Math.max(1, usableBins - 2);
        const rawLevel = Math.min(1, Math.max(0, average / 150));
        const nextLevel = levelRef.current * 0.62 + rawLevel * 0.38;

        if (Math.abs(nextLevel - levelRef.current) > 0.012) {
          levelRef.current = nextLevel;
          setAudioLevel(nextLevel);
        }

        const rawBands = {
          bass: averageBand(2, 12, 116),
          mid: averageBand(12, 52, 104),
          treble: averageBand(52, 124, 92),
        };
        const nextBands = {
          bass: bandsRef.current.bass * 0.48 + rawBands.bass * 0.52,
          mid: bandsRef.current.mid * 0.56 + rawBands.mid * 0.44,
          treble: bandsRef.current.treble * 0.62 + rawBands.treble * 0.38,
        };
        const shouldUpdateBands =
          Math.abs(nextBands.bass - bandsRef.current.bass) > 0.005 ||
          Math.abs(nextBands.mid - bandsRef.current.mid) > 0.005 ||
          Math.abs(nextBands.treble - bandsRef.current.treble) > 0.005;

        if (shouldUpdateBands) {
          bandsRef.current = nextBands;
          setAudioBands(nextBands);
        }

        frame = window.requestAnimationFrame(readLevel);
      };

      frame = window.requestAnimationFrame(readLevel);
    } catch (error) {
      console.warn("Audio analyser unavailable:", error);
      levelRef.current = volume;
      bandsRef.current = { bass: volume, mid: volume, treble: volume };
      setAudioLevel(volume);
      setAudioBands({ bass: volume, mid: volume, treble: volume });
    }

    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [status, volume]);

  useEffect(() => {
    if (!metadataUrl) return;

    const meta = new EventSource(metadataUrl);

    meta.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data?.streamTitle) {
          const parts = String(data.streamTitle).split(" - ");

          if (parts.length > 1) {
            setArtist(toTitleCase(parts[0]));
            setTitle(toTitleCase(parts.slice(1).join(" - ")));
          } else {
            setArtist("");
            setTitle(toTitleCase(data.streamTitle));
          }
        }
      } catch (error) {
        console.error("Metadata error:", error);
      }
    };

    return () => meta.close();
  }, [metadataUrl]);

  useEffect(() => {
    const controller = new AbortController();
    const query = [artist, title].filter(Boolean).join(" ").trim();

    if (!query || title === defaultTitle) {
      setArtworkUrl("");
      return () => controller.abort();
    }

    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          term: query,
          media: "music",
          entity: "song",
          limit: "1",
        });
        const response = await fetch(
          `https://itunes.apple.com/search?${params.toString()}`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as {
          results?: Array<{
            artworkUrl100?: string;
            artistName?: string;
            trackName?: string;
          }>;
        };
        const match = data.results?.[0];
        const artwork = match?.artworkUrl100 ?? "";

        setArtworkUrl(artwork.replace("100x100bb", "600x600bb"));
        if (match?.trackName && title !== match.trackName) {
          setTitle(toTitleCase(match.trackName));
        }
        if (match?.artistName && artist !== match.artistName) {
          setArtist(toTitleCase(match.artistName));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Artwork lookup error:", error);
          setArtworkUrl("");
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [artist, defaultTitle, title]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === "playing") return;

    setStatus("connecting");

    try {
      if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        audio.load();
      }

      await audio.play();
    } catch (error) {
      console.error("Error al reproducir:", error);
      setStatus("error");
    }
  }, [status]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus("idle");
  }, []);

  const toggle = useCallback(async () => {
    if (status === "playing" || status === "connecting") {
      pause();
      return;
    }

    await play();
  }, [pause, play, status]);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.min(1, Math.max(0, value)));
  }, []);

  const value = useMemo<RadioPlayerContextValue>(
    () => ({
      artist,
      title,
      artworkUrl,
      playerImageUrl,
      defaultTitle,
      defaultSubtitle,
      status,
      streamUrl,
      volume,
      audioLevel,
      audioBands,
      isPlaying: status === "playing" || status === "connecting",
      play,
      pause,
      toggle,
      setVolume,
    }),
    [
      artist,
      audioBands,
      audioLevel,
      artworkUrl,
      defaultSubtitle,
      defaultTitle,
      pause,
      play,
      playerImageUrl,
      setVolume,
      status,
      streamUrl,
      title,
      toggle,
      volume,
    ],
  );

  return (
    <RadioPlayerContext.Provider value={value}>
      {children}
    </RadioPlayerContext.Provider>
  );
};
