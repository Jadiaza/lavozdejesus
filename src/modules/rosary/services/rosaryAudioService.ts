import type { AudioSegment } from "../types";
import { isSafeMediaUrl } from "./http";

type Listener = () => void;

/**
 * Envoltorio de un único elemento <audio>. Aísla la reproducción de la UI y
 * evita instancias duplicadas al navegar entre pantallas.
 */
class RosaryAudioService {
  private el: HTMLAudioElement | null = null;
  private listeners = new Set<Listener>();

  state = {
    segmentId: null as string | null,
    playing: false,
    position: 0,
    duration: 0,
    error: null as string | null,
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  private ensure(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!this.el) {
      this.el = new Audio();
      this.el.preload = "metadata";
      this.el.addEventListener("timeupdate", () => {
        this.state.position = this.el?.currentTime ?? 0;
        this.emit();
      });
      this.el.addEventListener("loadedmetadata", () => {
        this.state.duration = this.el?.duration ?? 0;
        this.emit();
      });
      this.el.addEventListener("ended", () => {
        this.state.playing = false;
        this.emit();
      });
      this.el.addEventListener("error", () => {
        this.state.error = "No se pudo reproducir el audio";
        this.state.playing = false;
        this.emit();
      });
    }
    return this.el;
  }

  async play(segment: AudioSegment) {
    const el = this.ensure();
    if (!el) return;
    if (!isSafeMediaUrl(segment.url)) {
      this.state.error = "Audio no disponible";
      this.emit();
      return;
    }
    if (this.state.segmentId !== segment.id) {
      el.src = segment.url as string;
      this.state.segmentId = segment.id;
      this.state.position = 0;
    }
    this.state.error = null;
    try {
      await el.play();
      this.state.playing = true;
    } catch {
      this.state.error = "Toca de nuevo para iniciar el audio";
      this.state.playing = false;
    }
    this.emit();
  }

  pause() {
    this.el?.pause();
    this.state.playing = false;
    this.emit();
  }

  seek(seconds: number) {
    if (this.el) this.el.currentTime = Math.max(0, seconds);
  }

  setVolume(v: number) {
    if (this.el) this.el.volume = Math.min(1, Math.max(0, v));
  }

  setSpeed(rate: number) {
    if (this.el) this.el.playbackRate = rate;
  }

  dispose() {
    this.el?.pause();
    this.el = null;
    this.state = { segmentId: null, playing: false, position: 0, duration: 0, error: null };
    this.emit();
  }
}

export const rosaryAudioService = new RosaryAudioService();