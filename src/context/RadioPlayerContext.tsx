import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_APP_CONFIG, getAppConfig } from "@/services/sheetsService";
import {
  heartbeatRadioAudienceSession,
  pauseRadioAudienceSession,
  startRadioAudienceSession,
  stopRadioAudienceSession,
} from "@/services/radioAudienceService";
import { RadioPlayerContext } from "./RadioPlayerCore";
import type { RadioPlayerContextValue, RadioStatus } from "./RadioPlayerCore";

const toTitleCase = (value: string) =>
  value
    .replace(/^\d+\.\s*/, "")
    .replace(/^Track\s*\d+\s*-\s*/i, "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const RECONNECT_BASE_DELAY = 1500;
const RECONNECT_MAX_DELAY = 30000;
const STALL_TIMEOUT = 8000;

export const RadioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldPlayRef = useRef(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const stallTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectingRef = useRef(false);
  const audienceSessionStartedRef = useRef(false);
  const audienceHeartbeatTimerRef = useRef<number | null>(null);
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

    const applyConfig = async () => {
      try {
        const config = await getAppConfig();
        if (!mounted) return;

        setStreamUrl((current) =>
          current === config.radio_stream_url ? current : config.radio_stream_url,
        );
        setMetadataUrl((current) =>
          current === config.radio_metadata_url
            ? current
            : config.radio_metadata_url,
        );
        setDefaultTitle(config.radio_default_title);
        setDefaultSubtitle(config.radio_default_subtitle);
        setPlayerImageUrl(config.radio_player_image_url);
        setTitle((currentTitle) =>
          currentTitle === DEFAULT_APP_CONFIG.radio_default_title
            ? config.radio_default_title
            : currentTitle,
        );
      } catch (error) {
        console.error("Config error:", error);
      }
    };

    void applyConfig();

    // The DB is the source of truth. We refresh on app load/resume
    // and only re-check after a playback failure, avoiding periodic polling.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void applyConfig();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const preservePlayback = shouldPlayRef.current;
    const audio = new Audio(streamUrl);

    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    audio.volume = volume;
    audioRef.current = audio;
    shouldPlayRef.current = preservePlayback;
    reconnectAttemptRef.current = 0;
    reconnectingRef.current = false;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const clearStallTimer = () => {
      if (stallTimerRef.current !== null) {
        window.clearTimeout(stallTimerRef.current);
        stallTimerRef.current = null;
      }
    };

    const scheduleReconnect = (reason: string) => {
      if (!shouldPlayRef.current || reconnectTimerRef.current !== null) return;

      const attempt = reconnectAttemptRef.current;
      const delay = Math.min(
        RECONNECT_MAX_DELAY,
        RECONNECT_BASE_DELAY * 2 ** Math.min(attempt, 5),
      );

      reconnectAttemptRef.current += 1;
      setStatus("connecting");

      reconnectTimerRef.current = window.setTimeout(async () => {
        reconnectTimerRef.current = null;

        if (!shouldPlayRef.current || audioRef.current !== audio) return;

        reconnectingRef.current = true;

        try {
          audio.pause();
          audio.src = streamUrl;
          audio.load();
          await audio.play();

          reconnectAttemptRef.current = 0;
        } catch (error) {
          console.warn(
            `Radio reconnect failed (attempt ${reconnectAttemptRef.current}, reason: ${reason}):`,
            error,
          );
          reconnectingRef.current = false;
          scheduleReconnect("retry");
        }
      }, delay);
    };

    const onPlaying = () => {
      clearReconnectTimer();
      clearStallTimer();
      reconnectingRef.current = false;
      reconnectAttemptRef.current = 0;
      setStatus("playing");
      if (!audienceSessionStartedRef.current) {
        void startRadioAudienceSession().then((token) => {
          audienceSessionStartedRef.current = Boolean(token);
        });
      }
    };

    const onWaiting = () => {
      if (!shouldPlayRef.current) return;

      setStatus("connecting");
      clearStallTimer();

      stallTimerRef.current = window.setTimeout(() => {
        if (
          shouldPlayRef.current &&
          audioRef.current === audio &&
          audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA
        ) {
          scheduleReconnect("stall");
        }
      }, STALL_TIMEOUT);
    };

    const onError = () => {
      clearStallTimer();
      if (shouldPlayRef.current) {
        scheduleReconnect("error");
      } else {
        setStatus("error");
      }
    };

    const onStalled = () => {
      if (!shouldPlayRef.current) return;
      setStatus("connecting");
      scheduleReconnect("stalled");
    };

    const onEnded = () => {
      if (!shouldPlayRef.current) {
        setStatus("idle");
        return;
      }

      setStatus("connecting");
      scheduleReconnect("ended");
    };

    const onPause = () => {
      clearStallTimer();

      if (!shouldPlayRef.current) {
        clearReconnectTimer();
        setStatus((currentStatus) =>
          currentStatus === "playing" ||
          currentStatus === "connecting" ||
          currentStatus === "error"
            ? "idle"
            : currentStatus,
        );
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);

    // If the DB stream changed while the user was listening,
    // automatically continue on the new stream.
    if (preservePlayback) {
      setStatus("connecting");
      void audio.play().catch((error) => {
        console.warn("Playback resume after stream change failed:", error);
      });
    }

    return () => {
      clearReconnectTimer();
      clearStallTimer();
      shouldPlayRef.current = false;
      reconnectingRef.current = false;
      if (audienceHeartbeatTimerRef.current !== null) {
        window.clearInterval(audienceHeartbeatTimerRef.current);
        audienceHeartbeatTimerRef.current = null;
      }
      if (audienceSessionStartedRef.current) {
        audienceSessionStartedRef.current = false;
        void stopRadioAudienceSession();
      }

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
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("ended", onEnded);
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
    if (status !== "playing") {
      if (audienceHeartbeatTimerRef.current !== null) {
        window.clearInterval(audienceHeartbeatTimerRef.current);
        audienceHeartbeatTimerRef.current = null;
      }
      return;
    }

    void heartbeatRadioAudienceSession();
    if (audienceHeartbeatTimerRef.current !== null) {
      window.clearInterval(audienceHeartbeatTimerRef.current);
    }
    audienceHeartbeatTimerRef.current = window.setInterval(() => {
      void heartbeatRadioAudienceSession();
    }, 60_000);

    return () => {
      if (audienceHeartbeatTimerRef.current !== null) {
        window.clearInterval(audienceHeartbeatTimerRef.current);
        audienceHeartbeatTimerRef.current = null;
      }
    };
  }, [status]);

  useEffect(() => {
    const onPageHide = () => {
      if (audienceSessionStartedRef.current) {
        audienceSessionStartedRef.current = false;
        void stopRadioAudienceSession();
      }
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, []);

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

    shouldPlayRef.current = true;
    reconnectAttemptRef.current = 0;
    reconnectingRef.current = false;
    setStatus("connecting");

    try {
      if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        audio.load();
      }

      await audio.play();
    } catch (error) {
      console.error("Error al reproducir:", error);
      if (shouldPlayRef.current) {
        setStatus("connecting");
        // The event handlers will continue the retry cycle if the stream
        // becomes available again.
        if (reconnectTimerRef.current === null) {
          const retryDelay = RECONNECT_BASE_DELAY;
          reconnectTimerRef.current = window.setTimeout(async () => {
            reconnectTimerRef.current = null;
            if (!shouldPlayRef.current || audioRef.current !== audio) return;

            try {
              audio.pause();
              audio.load();
              await audio.play();
            } catch (retryError) {
              console.warn("Initial radio retry failed:", retryError);
              setStatus("connecting");
            }
          }, retryDelay);
        }
      } else {
        setStatus("error");
      }
    }
  }, [status]);

  const pause = useCallback(() => {
    shouldPlayRef.current = false;

    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (stallTimerRef.current !== null) {
      window.clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }

    audioRef.current?.pause();
    void pauseRadioAudienceSession();
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
