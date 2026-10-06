// Registro protegido del service worker para contextos reales de producción.
// La versión cambia deliberadamente para forzar una comprobación del worker tras cada despliegue.
// Conserva ?sw=off como interruptor de emergencia.

const SW_URL = "/sw.js";
const APP_CACHE_BUSTER = "lvjprayer-ui-2026-10-06-v1";
const CLIENT_VERSION_KEY = "lvjprayer:client-version";

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  try {
    if (window.top !== window.self) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--")
  ) {
    return true;
  }
  if (new URLSearchParams(window.location.search).has("sw")) {
    const v = new URLSearchParams(window.location.search).get("sw");
    if (v === "off") return true;
  }
  return false;
}

async function clearApplicationCaches() {
  if (!("caches" in window)) return;
  try {
    const names = await caches.keys();
    await Promise.all(
      names.filter((name) => name.startsWith("lvdj-") || name.startsWith("workbox-")).map((name) => caches.delete(name)),
    );
  } catch {
    /* noop */
  }
}

async function refreshInstalledVersion() {
  if (typeof window === "undefined") return;
  const current = window.localStorage.getItem(CLIENT_VERSION_KEY);
  if (current === APP_CACHE_BUSTER) return;

  await unregisterMatching();
  await clearApplicationCaches();
  window.localStorage.setItem(CLIENT_VERSION_KEY, APP_CACHE_BUSTER);
}

async function unregisterMatching() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => (r.active?.scriptURL || "").endsWith(SW_URL))
        .map((r) => r.unregister().catch(() => false)),
    );
  } catch {
    /* noop */
  }
}

export async function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    await unregisterMatching();
    return;
  }
  try {
    await refreshInstalledVersion();
    let reloadingForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadingForUpdate) return;
      reloadingForUpdate = true;
      window.location.reload();
    });

    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
    const registration = await navigator.serviceWorker.getRegistration('/');
    // Comprueba el sw.js contra la red en cada entrada a la aplicación.
    await registration?.update();

    // Activa inmediatamente el worker nuevo cuando exista una actualización.
    // Evita que el dispositivo conserve indefinidamente una versión anterior.
    const waiting = registration?.waiting;
    if (waiting) {
      waiting.postMessage({ type: "SKIP_WAITING", cacheBuster: APP_CACHE_BUSTER });
    }
  } catch {
    /* registration failed — silent */
  }
}
