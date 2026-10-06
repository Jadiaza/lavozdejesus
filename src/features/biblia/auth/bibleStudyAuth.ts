import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lvj-not-configured.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_not_configured";
const REMEMBER_KEY = "lvj:bible-study-auth:remember";

export function setBibleStudyRememberSession(_remember = true): void {
  localStorage.setItem(REMEMBER_KEY, "true");
}

export function getBibleStudyRememberSession(): boolean {
  return true;
}

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
    storage: localStorage,
    storageKey: "lvj-bible-study-auth",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Alias oficial para los módulos de LVJPRAYER. Se conserva el nombre histórico
// para no romper imports existentes del módulo Biblia.
export const lvjAuth = bibleStudyAuth;
