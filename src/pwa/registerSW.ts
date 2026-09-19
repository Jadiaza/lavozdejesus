// Registro protegido del service worker para contextos reales de producción.
// Conserva ?sw=off como interruptor de emergencia.

const SW_URL = "/sw.js";

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
  } catch {
    /* registration failed — silent */
  }
}
