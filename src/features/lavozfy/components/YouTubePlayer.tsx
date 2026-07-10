import { useEffect, useRef } from "react";
import { usePlayer, currentTrack } from "../state/playerStore";

// Loads IFrame API on demand
let apiPromise: Promise<any> | null = null;
const loadAPI = () => {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const w = window as any;
    if (w.YT && w.YT.Player) { resolve(w.YT); return; }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => resolve((window as any).YT);
  });
  return apiPromise;
};

export const YouTubePlayer = ({ visible = false }: { visible?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const state = usePlayer();
  const track = currentTrack(state);

  // init once
  useEffect(() => {
    let mounted = true;
    loadAPI().then((YT) => {
      if (!mounted || !ref.current) return;
      playerRef.current = new YT.Player(ref.current, {
        height: "100%", width: "100%",
        playerVars: { autoplay: 0, controls: 0, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            playerRef.current.setVolume(state.muted ? 0 : Math.round(state.volume * 100));
          },
          onStateChange: (e: any) => {
            const YTS = (window as any).YT.PlayerState;
            if (e.data === YTS.ENDED) usePlayer.getState().onEnded();
          },
        },
      });
    });
    return () => { mounted = false; };
    // eslint-disable-next-line
  }, []);

  // load video when track changes
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !track || track.source !== "youtube" || !track.videoId) return;
    if (typeof p.loadVideoById === "function") {
      p.loadVideoById({ videoId: track.videoId });
      state.setDuration(track.duration);
    }
    // eslint-disable-next-line
  }, [track?.id]);

  // play / pause
  useEffect(() => {
    const p = playerRef.current;
    if (!p || !track || track.source !== "youtube") return;
    if (state.isPlaying && typeof p.playVideo === "function") p.playVideo();
    if (!state.isPlaying && typeof p.pauseVideo === "function") p.pauseVideo();
  }, [state.isPlaying, track?.id, track?.source]);

  // volume
  useEffect(() => {
    const p = playerRef.current;
    if (!p || typeof p.setVolume !== "function") return;
    p.setVolume(state.muted ? 0 : Math.round(state.volume * 100));
  }, [state.volume, state.muted]);

  // seek + position tick
  useEffect(() => {
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p || typeof p.getCurrentTime !== "function") return;
      const cur = p.getCurrentTime?.() ?? 0;
      const dur = p.getDuration?.() ?? 0;
      if (dur && Math.abs(dur - usePlayer.getState().duration) > 1) usePlayer.getState().setDuration(dur);
      usePlayer.getState().tick(cur);
    }, 500);
    return () => clearInterval(id);
  }, []);

  // external seek
  useEffect(() => {
    const p = playerRef.current;
    if (!p || typeof p.seekTo !== "function") return;
    const cur = p.getCurrentTime?.() ?? 0;
    if (Math.abs(cur - state.position) > 1.5) p.seekTo(state.position, true);
  }, [state.position]);

  return (
    <div className={visible ? "w-full h-full" : "absolute -z-10 opacity-0 pointer-events-none w-px h-px overflow-hidden"}>
      <div ref={ref} className="w-full h-full" />
    </div>
  );
};