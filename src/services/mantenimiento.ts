import { useEffect, useState, type ReactNode } from "react";

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
  modo_mantenimiento_submodulo: boolean;
  mantenimiento_activo: boolean;
  mensaje_mantenimiento: string;
  nivel_mantenimiento_activo: "global" | "modulo" | "submodulo" | "ninguno";
}

const DEFAULT_MAINTENANCE_MESSAGE =
  "Este módulo se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.";

const DEFAULT_GLOBAL_MESSAGE =
  "La aplicación se encuentra temporalmente en mantenimiento. Intenta nuevamente más tarde.";

const API_URL =
  (import.meta.env.VITE_MAINTENANCE_API_URL as string | undefined)?.trim() ||
  "https://lavozdejesus.co/api/mantenimiento.php";

export interface MaintenanceRouteTarget {
  modulo: MaintenanceModule;
  submodulo: string | null;
}

const normalizePath = (pathname: string) => {
  const value = pathname.replace(/\/+$/, "");
  return value || "/";
};

export const getMaintenanceRouteTarget = (pathname: string): MaintenanceRouteTarget | null => {
  const path = normalizePath(pathname).toLowerCase();

  if (path === "/") return { modulo: "inicio", submodulo: null };
  if (path === "/radio") return { modulo: "radio", submodulo: null };
  if (path === "/programacion") return { modulo: "programacion", submodulo: null };
  if (path === "/capilla" || path === "/capilla-virtual") return { modulo: "capilla_virtual", submodulo: null };
  if (path.startsWith("/capilla/intenciones")) return { modulo: "capilla_virtual", submodulo: "intenciones" };

  if (path === "/liturgia" || path.startsWith("/liturgia/") ||
      path === "/lecturas-del-dia" || path === "/lectura-del-dia") {
    return { modulo: "liturgia", submodulo: null };
  }

  if (path === "/oraciones/liturgia" || path.startsWith("/oraciones/liturgia/")) {
    return { modulo: "oraciones", submodulo: "liturgia_horas" };
  }
  if (path === "/oraciones/categorias" || path.startsWith("/oraciones/categoria/")) {
    return { modulo: "oraciones", submodulo: "categorias" };
  }
  if (path === "/oraciones/devociones" || path.startsWith("/oraciones/devociones/")) {
    return { modulo: "oraciones", submodulo: "devociones" };
  }
  if (path === "/oraciones/mis-oraciones") return { modulo: "oraciones", submodulo: "mis_oraciones" };
  if (path === "/oraciones/peticion") return { modulo: "oraciones", submodulo: "peticion" };
  if (path === "/oraciones/recordatorios") return { modulo: "oraciones", submodulo: "recordatorios" };
  if (path === "/oraciones" || path.startsWith("/oraciones/oracion/")) {
    return { modulo: "oraciones", submodulo: null };
  }
  if (path === "/devociones") return { modulo: "oraciones", submodulo: "devociones" };

  if (path === "/rosario") return { modulo: "rosario", submodulo: null };
  if (path === "/rosario/modalidad") return { modulo: "rosario", submodulo: "modalidad" };
  if (path === "/rosario/intencion") return { modulo: "rosario", submodulo: "intencion" };
  if (path === "/rosario/seleccionar-misterios") return { modulo: "rosario", submodulo: "seleccionar_misterios" };
  if (path === "/rosario/configuracion") return { modulo: "rosario", submodulo: "configuracion" };
  if (path === "/rosario/digital") return { modulo: "rosario", submodulo: "digital" };
  if (path === "/rosario/fisico") return { modulo: "rosario", submodulo: "fisico" };
  if (path === "/rosario/audio") return { modulo: "rosario", submodulo: "audio" };
  if (path === "/rosario/misterios") return { modulo: "rosario", submodulo: "misterios" };
  if (path === "/rosario/descargas") return { modulo: "rosario", submodulo: "descargas" };
  if (path === "/rosario/diario") return { modulo: "rosario", submodulo: "diario" };
  if (path === "/rosario/informacion") return { modulo: "rosario", submodulo: "informacion" };
  if (path.startsWith("/rosario/")) return { modulo: "rosario", submodulo: null };

  if (path === "/biblia") return { modulo: "biblia", submodulo: null };
  if (path === "/biblia/leer") return { modulo: "biblia", submodulo: "leer" };
  if (path === "/biblia/buscar" || path.startsWith("/biblia/buscar/")) return { modulo: "biblia", submodulo: "leer" };
  if (path === "/biblia/estudio" || path.startsWith("/biblia/estudio/")) return { modulo: "biblia", submodulo: "estudio" };
  if (path === "/biblia/planes" || path.startsWith("/biblia/planes/")) return { modulo: "biblia", submodulo: "planes" };
  if (path === "/biblia/personajes" || path.startsWith("/biblia/personajes/")) return { modulo: "biblia", submodulo: "personajes" };
  if (path === "/biblia/explorar") return { modulo: "biblia", submodulo: "personajes" };
  if (path === "/biblia/mapas" || path.startsWith("/biblia/mapas/")) return { modulo: "biblia", submodulo: "mapas" };
  if (path === "/biblia/libros") return { modulo: "biblia", submodulo: "libros" };
  if (path === "/biblia/favoritos") return { modulo: "biblia", submodulo: "favoritos" };
  if (path === "/biblia/mi-biblia") return { modulo: "biblia", submodulo: "mi_biblia" };
  if (path === "/biblia/comparar") return { modulo: "biblia", submodulo: "comparar" };
  if (path.startsWith("/biblia/")) return { modulo: "biblia", submodulo: null };

  if (path === "/formacion" || path.startsWith("/formacion/")) return { modulo: "formacion", submodulo: null };
  if (path === "/eventos" || path.startsWith("/eventos/")) return { modulo: "eventos", submodulo: null };
  if (path === "/testimonios" || path.startsWith("/testimonios/")) return { modulo: "testimonios", submodulo: null };
  if (path === "/donar" || path.startsWith("/donar/") || path === "/donaciones") return { modulo: "donaciones", submodulo: null };
  if (path === "/podcast" || path.startsWith("/podcast/")) return { modulo: "podcast", submodulo: null };

  return null;
};

export const getMaintenanceModule = (pathname: string): MaintenanceModule | null =>
  getMaintenanceRouteTarget(pathname)?.modulo ?? null;
const inactiveState = (): ModuleMaintenanceState => ({
  modo_mantenimiento_global: false,
  modo_mantenimiento: false,
  modo_mantenimiento_submodulo: false,
  mantenimiento_activo: false,
  mensaje_mantenimiento: "",
  nivel_mantenimiento_activo: "ninguno",
});

export async function getMaintenanceState(
  moduleName: MaintenanceModule,
  submodule: string | null = null,
): Promise<ModuleMaintenanceState> {
  try {
    const params = new URLSearchParams({ modulo: moduleName });
    if (submodule) params.set("submodulo", submodule);

    const response = await fetch(
      `${API_URL}?${params.toString()}`,
      { cache: "no-store" },
    );

    if (!response.ok) return inactiveState();

    const data = (await response.json()) as Record<string, unknown>;
    const globalMaintenance = Boolean(data.modo_mantenimiento_global);
    const moduleMaintenance = Boolean(data.modo_mantenimiento);
    const submoduleMaintenance = Boolean(data.modo_mantenimiento_submodulo);
    const active = globalMaintenance || moduleMaintenance || submoduleMaintenance;

    return {
      modo_mantenimiento_global: globalMaintenance,
      modo_mantenimiento: moduleMaintenance,
      modo_mantenimiento_submodulo: submoduleMaintenance,
      mantenimiento_activo: active,
      mensaje_mantenimiento:
        typeof data.mensaje_mantenimiento === "string"
          ? data.mensaje_mantenimiento.trim()
          : active
            ? submoduleMaintenance
              ? DEFAULT_MAINTENANCE_MESSAGE
              : globalMaintenance
                ? DEFAULT_GLOBAL_MESSAGE
                : DEFAULT_MAINTENANCE_MESSAGE
            : "",
      nivel_mantenimiento_activo:
        globalMaintenance ? "global" : moduleMaintenance ? "modulo" : submoduleMaintenance ? "submodulo" : "ninguno",
    };
  } catch {
    // Fail-open: si la API de mantenimiento no responde, la PWA no se bloquea.
    return inactiveState();
  }
}
export function useMaintenanceState(
  moduleName: MaintenanceModule | null,
  submodule: string | null = null,
) {
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

    getMaintenanceState(moduleName, submodule).then((nextState) => {
      if (active) setState(nextState);
    });

    return () => {
      active = false;
    };
  }, [moduleName, submodule]);

  return state;
}

