import type { AudioManifest, DownloadState } from "../types";

const CACHE_NAME = "lvj-rosary-audio-v1";

/**
 * Descarga opcional de audios al Cache Storage. Degrada con mensaje claro
 * cuando el navegador no lo soporta o no hay archivos publicados.
 */
export const rosaryOfflineService = {
  supported(): boolean {
    return typeof caches !== "undefined";
  },

  async download(
    manifest: AudioManifest,
    onProgress: (state: DownloadState) => void,
  ): Promise<void> {
    if (!this.supported()) {
      onProgress({ status: "unsupported", reason: "Tu navegador no permite descargas offline" });
      return;
    }
    const urls = manifest.segments.map((s) => s.url).filter((u): u is string => !!u);
    if (!urls.length) {
      onProgress({ status: "error", message: "Aún no hay audios publicados para descargar" });
      return;
    }
    try {
      const cache = await caches.open(CACHE_NAME);
      let done = 0;
      for (const url of urls) {
        await cache.add(new Request(url, { mode: "cors" }));
        done++;
        onProgress({ status: "downloading", progress: Math.round((done / urls.length) * 100) });
      }
      onProgress({ status: "downloaded", bytes: manifest.totalBytes ?? 0 });
    } catch {
      onProgress({ status: "error", message: "No se pudo completar la descarga" });
    }
  },

  async isDownloaded(manifest: AudioManifest): Promise<boolean> {
    if (!this.supported() || !manifest.segments.length) return false;
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      return keys.length > 0;
    } catch {
      return false;
    }
  },

  async remove(): Promise<void> {
    if (!this.supported()) return;
    try {
      await caches.delete(CACHE_NAME);
    } catch {
      /* noop */
    }
  },
};