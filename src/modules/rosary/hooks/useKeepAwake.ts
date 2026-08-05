import { useEffect } from "react";

/** Mantiene la pantalla encendida durante el rezo si el navegador lo permite. */
export const useKeepAwake = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    let sentinel: { release: () => Promise<void> } | null = null;
    let cancelled = false;
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    nav.wakeLock
      ?.request("screen")
      .then((s) => {
        if (cancelled) void s.release();
        else sentinel = s;
      })
      .catch(() => {
        /* no soportado o denegado */
      });
    return () => {
      cancelled = true;
      void sentinel?.release().catch(() => undefined);
    };
  }, [enabled]);
};