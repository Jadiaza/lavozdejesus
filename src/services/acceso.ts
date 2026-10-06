export type AccessLevel = "guest" | "free" | "premium" | "admin" | "super_admin";

export interface AccessContext {
  authenticated: boolean;
  user: { id: number; email: string; name: string; email_verified: boolean; active: boolean; role_id: number | null; role_code: string; };
  access: { level: AccessLevel; premium: boolean; admin: boolean; super_admin: boolean; };
}

const API_URL = (import.meta.env.VITE_ACCESS_API_URL as string | undefined)?.trim() || "https://lavozdejesus.co/api/acceso.php";

let cachedAccessContext: AccessContext | null = null;
let cachedAccessToken = "";

export function setCachedAccessContext(accessToken: string, context: AccessContext): void {
  cachedAccessToken = accessToken;
  cachedAccessContext = context;
}

export function getCachedAccessContext(accessToken: string): AccessContext | null {
  return cachedAccessToken === accessToken ? cachedAccessContext : null;
}

export async function getAccessContext(accessToken: string): Promise<AccessContext> {
  const response = await fetch(API_URL, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const data = await response.json();
  if (!response.ok || !data?.success) throw new Error(data?.message || "No fue posible validar el acceso.");
  const context = data as AccessContext;
  setCachedAccessContext(accessToken, context);
  return context;
}

export const canAccessLevel = (context: AccessContext | null, required: AccessLevel): boolean => {
  if (!context) return required === "guest";
  const rank: Record<AccessLevel, number> = { guest: 0, free: 1, premium: 2, admin: 3, super_admin: 4 };
  return rank[context.access.level] >= rank[required];
};

export const isProtectedAccess = (context: AccessContext | null): boolean => Boolean(context?.authenticated);
export const isPremiumAccess = (context: AccessContext | null): boolean => Boolean(context?.access.premium);
