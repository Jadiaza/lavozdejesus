export type ModuleAccessLevel = "guest" | "free" | "premium";

export interface ModuleAccessPolicy {
  module: string;
  level: ModuleAccessLevel;
  submodules?: Record<string, ModuleAccessLevel>;
}

/**
 * Política oficial de acceso de LVJPRAYER.
 * guest = sin registro, free = usuario registrado, premium = futura suscripción.
 *
 * La política se mantiene separada de la disponibilidad/mantenimiento:
 * mostrar_* indica disponibilidad; esta matriz indica acceso.
 */
export const LVJ_ACCESS_POLICY: ModuleAccessPolicy[] = [
  { module: "inicio", level: "guest" },
  { module: "radio", level: "guest" },
  { module: "programacion", level: "guest" },
  { module: "capilla_virtual", level: "guest", submodules: { intenciones: "free" } },
  {
    module: "oraciones",
    level: "guest",
    submodules: {
      categorias: "guest",
      devociones: "guest",
      liturgia_horas: "guest",
      mis_oraciones: "free",
      peticion: "free",
      recordatorios: "free",
    },
  },
  {
    module: "rosario",
    level: "guest",
    submodules: {
      modalidad: "guest",
      intencion: "guest",
      seleccionar_misterios: "guest",
      configuracion: "guest",
      digital: "guest",
      fisico: "guest",
      audio: "guest",
      misterios: "guest",
      descargas: "guest",
      diario: "free",
      informacion: "guest",
    },
  },
  { module: "liturgia", level: "guest" },
  { module: "santoral", level: "guest" },
  {
    module: "biblia",
    level: "free",
    submodules: {
      leer: "free",
      estudio: "free",
      planes: "free",
      personajes: "free",
      mapas: "free",
      libros: "free",
      favoritos: "free",
      mi_biblia: "free",
      comparar: "free",
    },
  },
  { module: "biblioteca", level: "guest" },
  { module: "formacion", level: "guest" },
  { module: "comunidad", level: "free" },
  { module: "podcast", level: "free" },
  { module: "eventos", level: "guest" },
  { module: "testimonios", level: "guest" },
  { module: "donaciones", level: "guest" },
  { module: "publicidad", level: "guest" },
];

export const getModuleAccessPolicy = (
  module: string,
  submodule?: string,
): ModuleAccessLevel => {
  const policy = LVJ_ACCESS_POLICY.find((item) => item.module === module);
  if (!policy) return "guest";
  return submodule && policy.submodules?.[submodule]
    ? policy.submodules[submodule]
    : policy.level;
};

export const getRouteAccessPolicy = (pathname: string): ModuleAccessLevel => {
  if (
    pathname === "/biblia"
    || pathname.startsWith("/biblia/")
  ) {
    return "free";
  }

  if (pathname === "/podcast" || pathname.startsWith("/podcast/")) {
    return "free";
  }

  if (pathname === "/oraciones/mis-oraciones"
    || pathname === "/oraciones/peticion"
    || pathname === "/oraciones/recordatorios") {
    return "free";
  }

  if (pathname === "/capilla/intenciones") return "free";

  return "guest";
};
