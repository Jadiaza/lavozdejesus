import type { PrayerReminder } from "./prayerReminderService";

const DEFAULT_API_BASE = "https://lavozdejesus.co";
const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE)
  .trim()
  .replace(/\/+$/, "");
const DEVICE_TOKEN_KEY = "lvj-prayer-push-device-v1";
const PUSH_ACTIVE_KEY = "lvj-prayer-push-active-v1";

type PublicKeyResponse = { success: boolean; public_key?: string; message?: string };

const apiUrl = (file: string) => `${API_BASE}/api/${file}`;

const base64UrlToUint8Array = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
};

const deviceToken = () => {
  const existing = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (existing) return existing;
  const token = crypto.randomUUID();
  localStorage.setItem(DEVICE_TOKEN_KEY, token);
  return token;
};

const postJson = async <T>(file: string, payload: unknown): Promise<T> => {
  const response = await fetch(apiUrl(file), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(result.message || "No fue posible configurar las notificaciones.");
  return result;
};

export const prayerPushSupported = () =>
  typeof window !== "undefined" &&
  window.isSecureContext &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const prayerPushActive = () =>
  typeof window !== "undefined" && localStorage.getItem(PUSH_ACTIVE_KEY) === "true";

export const syncPrayerPush = async (reminders: PrayerReminder[]) => {
  if (!prayerPushSupported()) throw new Error("Este dispositivo no admite notificaciones push.");
  if (Notification.permission !== "granted") throw new Error("Debes permitir las notificaciones.");

  const enabledIds = reminders.filter(({ enabled }) => enabled).map(({ id }) => id);
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (enabledIds.length > 0 && !subscription) {
    const keyResponse = await fetch(apiUrl("push-public-key.php"), { cache: "no-store" });
    const keyPayload = await keyResponse.json() as PublicKeyResponse;
    if (!keyResponse.ok || !keyPayload.public_key) {
      throw new Error(keyPayload.message || "El servicio de notificaciones todavía no está configurado.");
    }
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(keyPayload.public_key),
    });
  }

  if (!subscription) {
    localStorage.removeItem(PUSH_ACTIVE_KEY);
    return { active: false };
  }

  await postJson<{ success: boolean }>("push-subscription.php", {
    device_token: deviceToken(),
    subscription: subscription.toJSON(),
    reminders: enabledIds,
    timezone: "America/Bogota",
  });

  if (enabledIds.length > 0) localStorage.setItem(PUSH_ACTIVE_KEY, "true");
  else localStorage.removeItem(PUSH_ACTIVE_KEY);
  return { active: enabledIds.length > 0 };
};

export const sendPrayerPushTest = async () => {
  if (!prayerPushActive()) throw new Error("Activa primero al menos un recordatorio.");
  return postJson<{ success: boolean; message: string }>("push-test.php", {
    device_token: deviceToken(),
  });
};
