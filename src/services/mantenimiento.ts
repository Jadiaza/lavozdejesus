import { useEffect, useState } from "react";

export type MaintenanceModule =
  | "inicio"
  | "radio"
  | "programacion"
  | "capilla_virtual"
  | "oraciones"
  | "rosario"
  | "liturgia"
  | "santoral"
  | "biblia"
  | "biblioteca"
  | "formacion"
  | "comunidad"
  | "podcast"
  | "eventos"
  | "testimonios"
  | "donaciones"
  | "publicidad";

export interface ModuleMaintenanceState {
  modo_mantenimiento_global: boolean;
  modo_mantenimiento: boolean;
  mantenimiento_activo: boolean;
  mensaje_mantenimiento: string;
}

const DEFAULT_MAINTENANCE_MESSAGE =
  "Este módulo se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.";

const DEFAULT_GLOBAL_MESSAGE =
  "La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.";

const API_URL =
  (import.meta.env.VITE_MAINTENANCE_API_URL as string | undefined)?.trim() ||
  "https://lavozdejesus.co/api/mantenimiento.php";

const normalizePath = (pathname: string) => {
  const value = pathname.replace(/\/+$/, "");
  return value || "/";
};

export const getMaintenanceModule = (pathname: string): MaintenanceModule | null => {
  const path = normalizePath(pathname).toLowerCase();

  if (path === "/") return "inicio";
  if (path === "/radio") return "radio";
  if (path === "/programacion") return "programacion";
  if (path === "/capilla" || path === "/capilla-virtual" || path.startsWith("/capilla/")) {
    return "capilla_virtual";
  }
  if (path === "/oraciones" || path.startsWith("/oraciones/") || path === "/devociones") {
    return "oraciones";
  }
  if (path === "/rosario" || path.startsWith("/rosario/")) return "rosario";
  if (path === "/liturgia" || path.startsWith("/liturgia/") ||
      path === "/lecturas-del-dia" || path === "/lectura-del-dia" ||
      path.startsWith("/oraciones/liturgia")) {
    return "liturgia";
  }
  if (path === "/biblia" || path === "/biblia" || path.startsWith("/biblia/")) {
    return "biblia";
  }
  if (path === "/formacion" || path.startsWith("/formacion/")) return "formacion";
  if (path === "/eventos" || path.startsWith("/eventos/")) return "eventos";
  if (path === "/testimonios" || path.startsWith("/testimonios/")) return "testimonios";
  if (path === "/donar" || path.startsWith("/donar/") || path === "/donaciones") {
    return "donaciones";
  }
  if (path === "/podcast" || path.startsWith("/podcast/")) return "podcast";

  return null;
};

const normalizeState = (
  data: Record<string, unknown>,
  moduleName: MaintenanceModule,
): ModuleMaintenanceState => {
  const modules = (data.modulos ?? {}) as Record<string, Record<string, unknown>>;
  const moduleData = modules[moduleName] ?? {};

  const globalMaintenance = Boolean(data.modo_mantenimiento_global);
  const moduleMaintenance = Boolean(moduleData.modo_mantenimiento);
  const active = globalMaintenance || moduleMaintenance;

  return {
    modo_mantenimiento_global: globalMaintenance,
    modo_mantenimiento: moduleMaintenance,
    mantenimiento_activo: active,
    mensaje_mantenimiento:
      typeof (globalMaintenance ? data.mensaje_mantenimiento : moduleData.mensaje_mantenimiento) === "string"
        ? String(globalMaintenance ? data.mensaje_mantenimiento : moduleData.mensaje_mantenimiento).trim()
        : "",
  };
};

export async function getMaintenanceState(
  moduleName: MaintenanceModule,
): Promise<ModuleMaintenanceState> {
  try {
    const response = await fetch(
      `${API_URL}?modulo=${encodeURIComponent(moduleName)}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      return {
        modo_mantenimiento_global: false,
        modo_mantenimiento: false,
        mantenimiento_activo: false,
        mensaje_mantenimiento: "",
      };
    }

    const data = (await response.json()) as Record<string, unknown>;
    const globalMaintenance = Boolean(data.modo_mantenimiento_global);
    const moduleMaintenance = Boolean(data.modo_mantenimiento);

    return {
      modo_mantenimiento_global: globalMaintenance,
      modo_mantenimiento: moduleMaintenance,
      mantenimiento_activo: globalMaintenance || moduleMaintenance,
      mensaje_mantenimiento:
        typeof data.mensaje_mantenimiento === "string"
          ? data.mensaje_mantenimiento.trim()
          : globalMaintenance
            ? DEFAULT_GLOBAL_MESSAGE
            : moduleMaintenance
              ? DEFAULT_MAINTENANCE_MESSAGE
              : "",
    };
  } catch {
    // Fail-open: si la API de mantenimiento no responde, la PWA no se bloquea.
    return {
      modo_mantenimiento_global: false,
      modo_mantenimiento: false,
      mantenimiento_activo: false,
      mensaje_mantenimiento: "",
    };
  }
}

export function useMaintenanceState(moduleName: MaintenanceModule | null) {
  const [state, setState] = useState<ModuleMaintenanceState | null>(null);

  useEffect(() => {
    let active = true;

    if (!moduleName) {
      setState(null);
      return () => {
        active = false;
      };
    }

    setState(null);

    getMaintenanceState(moduleName).then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, [moduleName]);

  return state;
}

export { DEFAULT_GLOBAL_MESSAGE, DEFAULT_MAINTENANCE_MESSAGE };
