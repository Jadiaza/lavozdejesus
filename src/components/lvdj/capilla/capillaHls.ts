type HlsModule = typeof import("hls.js");

let hlsModulePromise: Promise<HlsModule> | null = null;

export const preloadCapillaHls = () => {
  hlsModulePromise ??= import("hls.js");
  return hlsModulePromise;
};
