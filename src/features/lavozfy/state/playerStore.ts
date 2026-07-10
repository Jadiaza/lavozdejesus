import { create } from "zustand";
import type { Track } from "../data/tracks";

type RepeatMode = "off" | "all" | "one";

type PlayerState = {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  favorites: string[];
  history: string[];
  fullscreen: boolean;
  showQueue: boolean;
  playTrack: (t: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (p: number) => void;
  setDuration: (d: number) => void;
  tick: (p: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleFavorite: (id: string) => void;
  toggleFullscreen: () => void;
  toggleQueue: () => void;
  onEnded: () => void;
};

const load = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const save = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* noop */ } };

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  position: 0,
  duration: 0,
  volume: load("lv:vol", 0.7),
  muted: false,
  shuffle: false,
  repeat: "off",
  favorites: load<string[]>("lv:favs", []),
  history: load<string[]>("lv:hist", []),
  fullscreen: false,
  showQueue: false,
  playTrack: (t, queue) => {
    const q = queue ?? [t];
    const idx = Math.max(0, q.findIndex((x) => x.id === t.id));
    const hist = [t.id, ...get().history.filter((h) => h !== t.id)].slice(0, 50);
    save("lv:hist", hist);
    set({ queue: q, currentIndex: idx, isPlaying: true, position: 0, history: hist });
  },
  playQueue: (tracks, startIndex = 0) => {
    if (!tracks.length) return;
    const t = tracks[startIndex];
    const hist = [t.id, ...get().history.filter((h) => h !== t.id)].slice(0, 50);
    save("lv:hist", hist);
    set({ queue: tracks, currentIndex: startIndex, isPlaying: true, position: 0, history: hist });
  },
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  next: () => {
    const { queue, currentIndex, shuffle, repeat } = get();
    if (!queue.length) return;
    let nextIdx = currentIndex + 1;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    if (nextIdx >= queue.length) nextIdx = repeat === "all" ? 0 : currentIndex;
    if (nextIdx === currentIndex && repeat !== "all") { set({ isPlaying: false }); return; }
    set({ currentIndex: nextIdx, position: 0, isPlaying: true });
  },
  prev: () => {
    const { currentIndex, position } = get();
    if (position > 3) { set({ position: 0 }); return; }
    if (currentIndex <= 0) return;
    set({ currentIndex: currentIndex - 1, position: 0, isPlaying: true });
  },
  seek: (p) => set({ position: p }),
  setDuration: (d) => set({ duration: d }),
  tick: (p) => set({ position: p }),
  setVolume: (v) => { save("lv:vol", v); set({ volume: v, muted: v === 0 }); },
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  cycleRepeat: () =>
    set((s) => ({ repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off" })),
  toggleFavorite: (id) => {
    const favs = get().favorites.includes(id)
      ? get().favorites.filter((x) => x !== id)
      : [...get().favorites, id];
    save("lv:favs", favs);
    set({ favorites: favs });
  },
  toggleFullscreen: () => set((s) => ({ fullscreen: !s.fullscreen })),
  toggleQueue: () => set((s) => ({ showQueue: !s.showQueue })),
  onEnded: () => {
    const { repeat } = get();
    if (repeat === "one") { set({ position: 0, isPlaying: true }); return; }
    get().next();
  },
}));

export const currentTrack = (s: PlayerState) =>
  s.currentIndex >= 0 ? s.queue[s.currentIndex] : undefined;