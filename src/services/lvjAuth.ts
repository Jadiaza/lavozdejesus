import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lvj-not-configured.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_not_configured";
const REMEMBER_KEY = "lvj:auth:remember";
const STORAGE_KEY = "lvj-auth";

const configuredFetch: typeof fetch = (input, init) => {
  const headers = new Headers(
    typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
  );
  if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  if (
    (SUPABASE_KEY.startsWith("sb_publishable_") || SUPABASE_KEY.startsWith("sb_secret_")) &&
    headers.get("Authorization") === `Bearer ${SUPABASE_KEY}`
  ) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SUPABASE_KEY);
  return fetch(input, { ...init, headers });
};

export function isLvjAuthConfigured(): boolean {
  return SUPABASE_URL.startsWith("https://")
    && !SUPABASE_URL.includes("not-configured")
    && SUPABASE_KEY.length > 20
    && !SUPABASE_KEY.includes("not_configured");
}

export function setRememberSession(remember: boolean): void {
  const currentLocal = localStorage.getItem(STORAGE_KEY);
  const currentSession = sessionStorage.getItem(STORAGE_KEY);
  const current = remember ? (currentLocal ?? currentSession) : (currentSession ?? currentLocal);

  localStorage.setItem(REMEMBER_KEY, String(remember));

  if (current) {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, current);
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(STORAGE_KEY, current);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export function getRememberSession(): boolean {
  return localStorage.getItem(REMEMBER_KEY) === "true";
}

/**
 * Único cliente de autenticación de LVJPRAYER.
 * Todos los módulos del ecosistema deben consumir este cliente y no crear
 * clientes Supabase de autenticación propios.
 */
export const lvjAuth = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  global: { fetch: configuredFetch },
  auth: {
    storage: localStorage,
    storageKey: STORAGE_KEY,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
