import { bibleStudyAuth } from "@/features/biblia/auth/bibleStudyAuth";
import { getMeta, setMeta } from "@/features/biblia/db";

export interface BiblePlan {
  id: number;
  titulo: string;
  descripcion: string;
  duracion_dias: number;
  categoria: string;
  imagen_url: string;
}

export interface BiblePlanDaySummary {
  id: number;
  plan_id: number;
  dia: number;
  titulo: string;
  lectura: string;
}

export interface BiblePlanDay extends BiblePlanDaySummary {
  descripcion: string;
  motivacion: string;
  oracion_inicial: string;
  oracion_final: string;
}

export interface BiblePlanDetail {
  plan: BiblePlan;
  dias: BiblePlanDaySummary[];
}

export interface BiblePlanJourney {
  plan: BiblePlan;
  jornada: BiblePlanDay;
}

export interface BiblePlanProgress {
  plan_id: number;
  dia_actual: number;
  completado: boolean;
  updated_at: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const baseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "https://lavozdejesus.co")
  .trim()
  .replace(/\/+$/, "");
const apiUrl = (import.meta.env.VITE_BIBLE_PLANS_API_URL as string | undefined)?.trim() || `${baseUrl}/api/biblia-planes.php`;
const localKey = (planId: number) => `planProgress:${planId}`;

async function parse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success || payload.data === undefined) {
    throw new Error(payload?.message || "No fue posible consultar los planes.");
  }
  return payload.data;
}

async function request<T>(params: Record<string, string | number>): Promise<T> {
  const url = new URL(apiUrl, window.location.origin);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  return parse<T>(response);
}

async function accessToken(): Promise<string | null> {
  const { data } = await bibleStudyAuth.auth.getSession();
  return data.session?.access_token ?? null;
}

const authHeaders = (token: string) => {
  const bearer = `Bearer ${token}`;
  return { Authorization: bearer, "X-LVJ-Authorization": bearer };
};

export async function listBiblePlans(): Promise<BiblePlan[]> {
  const data = await request<{ planes: BiblePlan[] }>({ accion: "catalogo" });
  return data.planes ?? [];
}

export const getBiblePlan = (id: number) => request<BiblePlanDetail>({ accion: "detalle", id });

export const getBiblePlanDay = (planId: number, day: number) =>
  request<BiblePlanJourney>({ accion: "jornada", plan_id: planId, dia: day });

export async function getLocalPlanProgress(planId: number): Promise<BiblePlanProgress | null> {
  return getMeta<BiblePlanProgress>(localKey(planId));
}

export async function getServerPlanProgress(planId: number): Promise<BiblePlanProgress | null> {
  const token = await accessToken();
  if (!token) return null;
  const url = new URL(apiUrl, window.location.origin);
  url.searchParams.set("accion", "progreso");
  url.searchParams.set("plan_id", String(planId));
  const response = await fetch(url.toString(), { headers: { Accept: "application/json", ...authHeaders(token) } });
  if (response.status === 401 || response.status === 403) return null;
  return parse<BiblePlanProgress | null>(response);
}

async function postServerProgress(progress: BiblePlanProgress): Promise<BiblePlanProgress | null> {
  const token = await accessToken();
  if (!token) return null;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({
      accion: "progreso",
      plan_id: progress.plan_id,
      dia_actual: progress.dia_actual,
      completado: progress.completado,
    }),
  });
  return parse<BiblePlanProgress>(response);
}

export async function resolvePlanProgress(planId: number): Promise<BiblePlanProgress | null> {
  const local = await getLocalPlanProgress(planId);
  let server: BiblePlanProgress | null = null;
  try {
    server = await getServerPlanProgress(planId);
  } catch {
    server = null;
  }
  if (!local && !server) return null;

  const merged: BiblePlanProgress = {
    plan_id: planId,
    dia_actual: Math.max(local?.dia_actual ?? 1, server?.dia_actual ?? 1),
    completado: Boolean(local?.completado || server?.completado),
    updated_at: server?.updated_at || local?.updated_at || new Date().toISOString(),
  };
  await setMeta(localKey(planId), merged);

  const serverBehind = Boolean(
    local &&
      (!server ||
        local.dia_actual > server.dia_actual ||
        (local.completado && !server.completado)),
  );
  if (serverBehind) {
    try {
      const synced = await postServerProgress(merged);
      if (synced) {
        const normalized: BiblePlanProgress = {
          plan_id: planId,
          dia_actual: Math.max(merged.dia_actual, synced.dia_actual),
          completado: merged.completado || synced.completado,
          updated_at: synced.updated_at || merged.updated_at,
        };
        await setMeta(localKey(planId), normalized);
        return normalized;
      }
    } catch {
      // La lectura del plan no debe bloquearse por una falla de sincronización.
    }
  }

  return merged;
}

export async function savePlanProgress(planId: number, day: number, completed: boolean): Promise<BiblePlanProgress> {
  const previous = await getLocalPlanProgress(planId);
  const local: BiblePlanProgress = {
    plan_id: planId,
    dia_actual: Math.max(previous?.dia_actual ?? 1, day),
    completado: Boolean(previous?.completado || completed),
    updated_at: new Date().toISOString(),
  };
  await setMeta(localKey(planId), local);

  try {
    const server = await postServerProgress(local);
    if (!server) return local;
    const merged: BiblePlanProgress = {
      plan_id: planId,
      dia_actual: Math.max(local.dia_actual, server.dia_actual),
      completado: local.completado || server.completado,
      updated_at: server.updated_at || local.updated_at,
    };
    await setMeta(localKey(planId), merged);
    return merged;
  } catch {
    return local;
  }
}
