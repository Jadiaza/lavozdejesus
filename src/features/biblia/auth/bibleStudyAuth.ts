import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lvj-not-configured.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_not_configured";
const REMEMBER_KEY = "lvj:bible-study-auth:remember";

const remembersSession = () => localStorage.getItem(REMEMBER_KEY) !== "false";

const storage: SupportedStorage = {
  getItem(key) {
    // Una sola fuente de persistencia según la preferencia actual.
    // No hacemos fallback al otro storage porque eso podría mantener una
    // sesión persistente después de que el usuario eligió no recordarla.
    return (remembersSession() ? localStorage : sessionStorage).getItem(key);
  },
  setItem(key, value) {
    const primary = remembersSession() ? localStorage : sessionStorage;
    const secondary = remembersSession() ? sessionStorage : localStorage;
    primary.setItem(key, value);
    secondary.removeItem(key);
  },
  removeItem(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

const configuredFetch: typeof fetch = (input, init) => {
  const headers = new Headers(
    typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
  );
  if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  if ((SUPABASE_KEY.startsWith("sb_publishable_") || SUPABASE_KEY.startsWith("sb_secret_"))
    && headers.get("Authorization") === `Bearer ${SUPABASE_KEY}`) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SUPABASE_KEY);
  return fetch(input, { ...init, headers });
};

export function setBibleStudyRememberSession(remember: boolean): void {
  const storageKey = "lvj-bible-study-auth";
  const currentLocal = localStorage.getItem(storageKey);
  const currentSession = sessionStorage.getItem(storageKey);
  const current = remember ? (currentLocal ?? currentSession) : (currentSession ?? currentLocal);

  localStorage.setItem(REMEMBER_KEY, String(remember));

  if (current) {
    if (remember) {
      localStorage.setItem(storageKey, current);
      sessionStorage.removeItem(storageKey);
    } else {
      sessionStorage.setItem(storageKey, current);
      localStorage.removeItem(storageKey);
    }
  }
}

export function getBibleStudyRememberSession(): boolean {
  return remembersSession();
}

export function isBibleStudyAuthConfigured(): boolean {
  return SUPABASE_URL.startsWith("https://")
    && !SUPABASE_URL.includes("not-configured")
    && SUPABASE_KEY.length > 20
    && !SUPABASE_KEY.includes("not_configured");
}

export const bibleStudyAuth = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  global: { fetch: configuredFetch },
  auth: {
    storage,
    storageKey: "lvj-bible-study-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Alias oficial para los módulos de LVJPRAYER. Se conserva el nombre histórico
// para no romper imports existentes del módulo Biblia.
export const lvjAuth = bibleStudyAuth;
