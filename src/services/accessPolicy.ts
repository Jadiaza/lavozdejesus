export type ModuleAccessLevel = "guest" | "free" | "premium";

export interface ModuleAccessPolicy {
  module: string;
  level: ModuleAccessLevel;
  submodules?: Record<string, ModuleAccessLevel>;
}

const API_URL =
  (import.meta.env.VITE_ACCESS_POLICY_API_URL as string | undefined)?.trim() ||
  "https://lavozdejesus.co/api/acceso-politica.php";

const mapLevel = (value: unknown): ModuleAccessLevel | null => {
  if (value === "publico") return "guest";
  if (value === "registrado") return "free";
  if (value === "premium") return "premium";
  return null;
};

const FALLBACK_POLICY: ModuleAccessPolicy[] = [
  { module: "inicio", level: "guest" },
  { module: "radio", level: "guest" },
  { module: "programacion", level: "guest" },
  { module: "capilla_virtual", level: "guest", submodules: { intenciones: "free" } },
  {
    module: "oraciones",
    level: "guest",
    submodules: {
      mis_oraciones: "free",
      peticion: "free",
      recordatorios: "free",
    },
  },
  { module: "rosario", level: "guest", submodules: { diario: "free" } },
  { module: "liturgia", level: "guest" },
  { module: "santoral", level: "guest" },
  { module: "biblioteca", level: "guest" },
  { module: "formacion", level: "guest" },
  { module: "comunidad", level: "free" },
  { module: "podcast", level: "free" },
  { module: "eventos", level: "guest" },
  { module: "testimonios", level: "guest" },
  { module: "donaciones", level: "guest" },
  { module: "publicidad", level: "guest" },
  {
    module: "biblia",
    level: "free",
    submodules: {
      comparar: "free",
      estudio: "free",
      favoritos: "free",
      leer: "free",
      libros: "free",
      mapas: "free",
      mi_biblia: "free",
      personajes: "free",
      planes: "free",
    },
  },
];

export const loadAccessPolicy = async (): Promise<ModuleAccessPolicy[]> => {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error("No fue posible cargar la política de acceso.");

    const data = await response.json();
    if (!data?.ok || !data?.modulos || typeof data.modulos !== "object") {
      throw new Error("Política de acceso inválida.");
    }

    const policy: ModuleAccessPolicy[] = [];
    for (const [module, raw] of Object.entries(data.modulos as Record<string, any>)) {
      const level = mapLevel(raw?.nivel_acceso);
      if (!level) throw new Error("Nivel de acceso inválido para " + module);

      const submodules: Record<string, ModuleAccessLevel> = {};
      for (const [name, value] of Object.entries(raw?.submodulos ?? {})) {
        const subLevel = mapLevel(value);
        if (!subLevel) throw new Error("Nivel de acceso inválido para " + module + "/" + name);
        submodules[name.trim().toLowerCase()] = subLevel;
      }
      policy.push({ module: module.trim().toLowerCase(), level, submodules });
    }

    const policyByModule = new Map(
      FALLBACK_POLICY.map((entry) => [entry.module, entry]),
    );
    for (const entry of policy) policyByModule.set(entry.module, entry);
    return Array.from(policyByModule.values());
  } catch {
    // Respaldo temporal para el lanzamiento: la política dinámica sigue siendo
    // la fuente principal; si su API falla, la PWA conserva una matriz segura
    // conocida y no deja toda la aplicación en pantalla negra.
    return FALLBACK_POLICY;
  }
};

export const getRouteTarget = (pathname: string): { module: string; submodule?: string } | null => {
  const p = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  // Inicio es una superficie pública de la aplicación y no depende de
  // una fila de política en lvj_cfg_modulos.
  if (p === "/") return null;
  if (p === "/devociones") return { module: "oraciones", submodule: "devociones" };
  if (p.startsWith("/radio")) return { module: "radio" };
  if (p.startsWith("/programacion")) return { module: "programacion" };
  if (p.startsWith("/capilla/intenciones")) return { module: "capilla_virtual", submodule: "intenciones" };
  if (p.startsWith("/capilla")) return { module: "capilla_virtual" };
  if (p.startsWith("/oraciones/mis-oraciones")) return { module: "oraciones", submodule: "mis_oraciones" };
  if (p.startsWith("/oraciones/peticion")) return { module: "oraciones", submodule: "peticion" };
  if (p.startsWith("/oraciones/recordatorios")) return { module: "oraciones", submodule: "recordatorios" };
  if (p.startsWith("/oraciones/devociones")) return { module: "oraciones", submodule: "devociones" };
  if (p.startsWith("/oraciones/liturgia")) return { module: "oraciones", submodule: "liturgia_horas" };
  if (p.startsWith("/oraciones/categoria")) return { module: "oraciones", submodule: "categorias" };
  if (p.startsWith("/oraciones")) return { module: "oraciones" };
  if (p.startsWith("/rosario/")) return { module: "rosario", submodule: p.split("/")[2] };
  if (p === "/rosario") return { module: "rosario" };
  if (p.startsWith("/biblia/")) {
    const section = p.split("/")[2];
    return { module: "biblia", submodule: section === "buscar" ? "leer" : section };
  }
  if (p === "/biblia") return { module: "biblia" };
  if (p === "/podcast") return { module: "podcast" };
  if (p === "/podcast/santos-arcangeles-33-dias" || p.startsWith("/podcast/series/")) {
    return { module: "podcast", submodule: "series" };
  }
  if (p === "/podcast/rss" || p.startsWith("/podcast/rss/")) return { module: "podcast", submodule: "series" };
  if (p.startsWith("/podcast/")) return { module: "podcast", submodule: p.split("/")[2] };
  if (p === "/lecturas-del-dia" || p === "/lectura-del-dia" || p.startsWith("/liturgia")) {
    return { module: "liturgia" };
  }
  if (p.startsWith("/formacion")) return { module: "formacion" };
  if (p.startsWith("/testimonios")) return { module: "testimonios" };
  if (p.startsWith("/eventos")) return { module: "eventos" };
  if (p.startsWith("/donar")) return { module: "donaciones" };
  if (p.startsWith("/santoral")) return { module: "santoral" };
  if (p.startsWith("/biblioteca")) return { module: "biblioteca" };
  if (p.startsWith("/comunidad")) return { module: "comunidad" };
  if (p.startsWith("/publicidad")) return { module: "publicidad" };
  if (p.startsWith("/acerca-de") || p.startsWith("/quienes-somos") || p.startsWith("/contacto") || p.startsWith("/privacidad") || p.startsWith("/politica-de-privacidad") || p.startsWith("/terminos")) return null;
  return null;
};

export const getModuleAccessPolicy = (
  module: string,
  submodule?: string,
  policy: ModuleAccessPolicy[] = [],
): ModuleAccessLevel | null => {
  const item = policy.find((entry) => entry.module === module.toLowerCase());
  if (!item) return null;
  if (submodule && item.submodules && Object.prototype.hasOwnProperty.call(item.submodules, submodule)) {
    return item.submodules[submodule];
  }
  return item.level;
};

export const getRouteAccessPolicy = (
  pathname: string,
  policy: ModuleAccessPolicy[],
): ModuleAccessLevel | null => {
  const target = getRouteTarget(pathname);
  if (!target) return null;
  return getModuleAccessPolicy(target.module, target.submodule, policy);
};
