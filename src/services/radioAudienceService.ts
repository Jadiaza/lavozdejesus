import { buildApiUrl } from "@/services/sheetsService";
import { lvjAuth } from "@/services/lvjAuth";

const API_URL = buildApiUrl("/api/radio-audience");
const SESSION_KEY = "lvj:radio:audience-session";

type AudienceSessionResponse = {
  success?: boolean;
  session_id?: number;
  session_token?: string;
  tipo_oyente?: "registrado" | "invitado";
};

const authHeaders = async (): Promise<HeadersInit> => {
  try {
    const { data } = await lvjAuth.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

const post = async (
  action: string,
  body: Record<string, string | number> = {},
) => {
  const headers = await authHeaders();
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      ...headers,
    },
    body: new URLSearchParams({
      action,
      ...Object.fromEntries(
        Object.entries(body).map(([key, value]) => [key, String(value)]),
      ),
    }),
    cache: "no-store",
    keepalive: action === "stop",
  });

  const raw = await response.text();
  let result: AudienceSessionResponse = {};
  try {
    result = raw ? (JSON.parse(raw) as AudienceSessionResponse) : {};
  } catch {
    throw new Error(
      `Radio audience respuesta no JSON (HTTP ${response.status}): ${raw.slice(0, 180)}`,
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(
      `Radio audience HTTP ${response.status}: ${raw.slice(0, 300)}`,
    );
  }

  return result;
};

export async function startRadioAudienceSession(
  streamId?: number,
): Promise<string | null> {
  try {
    const current = sessionStorage.getItem(SESSION_KEY);

    // Never trust a cached token blindly. It may belong to a previous
    // database/session lifecycle. Validate it before reusing it.
    if (current) {
      try {
        await post("heartbeat", { session_token: current });
        return current;
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    const result = await post("start", streamId ? { stream_id: streamId } : {});
    const token = result.session_token ?? null;

    if (!token) {
      throw new Error("Radio audience no devolvió session_token.");
    }

    sessionStorage.setItem(SESSION_KEY, token);
    return token;
  } catch (error) {
    console.warn(
      "[RadioAudience] No fue posible iniciar la sesión de audiencia.",
      error,
    );
    return null;
  }
}

export async function heartbeatRadioAudienceSession(): Promise<boolean> {
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token) return false;

  try {
    await post("heartbeat", { session_token: token });
    return true;
  } catch (error) {
    // A missing/expired server session must not poison the browser session.
    sessionStorage.removeItem(SESSION_KEY);
    console.warn("[RadioAudience] Heartbeat falló.", error);
    return false;
  }
}

export async function pauseRadioAudienceSession(): Promise<void> {
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token) return;

  try {
    await post("pause", { session_token: token });
  } catch (error) {
    console.warn(
      "[RadioAudience] No fue posible pausar la sesión.",
      error,
    );
  }
}

export async function stopRadioAudienceSession(): Promise<void> {
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token) return;

  sessionStorage.removeItem(SESSION_KEY);

  try {
    await post("stop", { session_token: token });
  } catch (error) {
    console.warn(
      "[RadioAudience] No fue posible cerrar la sesión.",
      error,
    );
  }
}
