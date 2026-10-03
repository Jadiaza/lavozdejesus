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
const API_URL = (import.meta.env.VITE_ACCESS_POLICY_API_URL as string | undefined)?.trim() || "https://lavozdejesus.co/api/acceso-politica.php";
const mapLevel = (v: unknown): ModuleAccessLevel => v === "premium" ? "premium" : v === "registrado" ? "free" : "guest";
const fallbackPolicy: ModuleAccessPolicy[] = [
  { module: "inicio", level: "guest" }, { module: "radio", level: "guest" }, { module: "programacion", level: "guest" },
  { module: "capilla_virtual", level: "guest", submodules: { intenciones: "free" } },
  { module: "oraciones", level: "guest", submodules: { mis_oraciones: "free", peticion: "free", recordatorios: "free" } },
  { module: "rosario", level: "guest", submodules: { diario: "free" } }, { module: "liturgia", level: "guest" },
  { module: "santoral", level: "guest" }, { module: "biblia", level: "free" }, { module: "biblioteca", level: "guest" },
  { module: "formacion", level: "guest" }, { module: "comunidad", level: "free" }, { module: "podcast", level: "free" },
  { module: "eventos", level: "guest" }, { module: "testimonios", level: "guest" }, { module: "donaciones", level: "guest" }, { module: "publicidad", level: "guest" },
];
let cachedPolicy: ModuleAccessPolicy[] | null = null;
export const loadAccessPolicy = async (): Promise<ModuleAccessPolicy[]> => {
  try {
    const r = await fetch(API_URL, { cache: "no-store", headers: { Accept: "application/json" } }); const d = await r.json();
    if (!r.ok || !d?.ok) throw new Error("policy");
    cachedPolicy = Object.entries(d.modulos).map(([module, v]: [string, any]) => ({ module, level: mapLevel(v?.nivel_acceso), submodules: Object.fromEntries(Object.entries(v?.submodulos ?? {}).map(([k,x]) => [k,mapLevel(x)])) }));
    return cachedPolicy;
  } catch { cachedPolicy = fallbackPolicy; return fallbackPolicy; }
};
export const getRouteTarget = (pathname: string): {module:string;submodule?:string}|null => {
  const p=pathname.toLowerCase();
  if(p==="/")return{module:"inicio"}; if(p.startsWith("/radio"))return{module:"radio"}; if(p.startsWith("/programacion"))return{module:"programacion"};
  if(p.startsWith("/capilla/intenciones"))return{module:"capilla_virtual",submodule:"intenciones"}; if(p.startsWith("/capilla"))return{module:"capilla_virtual"};
  if(p.startsWith("/oraciones/mis-oraciones"))return{module:"oraciones",submodule:"mis_oraciones"}; if(p.startsWith("/oraciones/peticion"))return{module:"oraciones",submodule:"peticion"}; if(p.startsWith("/oraciones/recordatorios"))return{module:"oraciones",submodule:"recordatorios"}; if(p.startsWith("/oraciones/devociones"))return{module:"oraciones",submodule:"devociones"}; if(p.startsWith("/oraciones/liturgia"))return{module:"oraciones",submodule:"liturgia_horas"}; if(p.startsWith("/oraciones/categoria"))return{module:"oraciones",submodule:"categorias"}; if(p.startsWith("/oraciones"))return{module:"oraciones"};
  if(p.startsWith("/rosario/"))return{module:"rosario",submodule:p.split("/")[2]}; if(p==="/rosario")return{module:"rosario"};
  if(p.startsWith("/biblia/"))return{module:"biblia",submodule:p.split("/")[2]==="buscar"?"leer":p.split("/")[2]}; if(p==="/biblia")return{module:"biblia"};
  if(p.startsWith("/podcast"))return{module:"podcast",submodule:p.split("/")[2]}; if(p.startsWith("/liturgia"))return{module:"liturgia"}; if(p.startsWith("/formacion"))return{module:"formacion"}; if(p.startsWith("/testimonios"))return{module:"testimonios"}; if(p.startsWith("/eventos"))return{module:"eventos"}; if(p.startsWith("/donar"))return{module:"donaciones"}; return null;
};
export const getModuleAccessPolicy=(module:string,submodule?:string,policy=cachedPolicy):ModuleAccessLevel=>{const item=policy?.find(x=>x.module===module)||fallbackPolicy.find(x=>x.module===module);if(!item)return"guest";return submodule&&item.submodules?.[submodule]?item.submodules[submodule]:item.level;};
export const getRouteAccessPolicy=(pathname:string,policy=cachedPolicy):ModuleAccessLevel=>{const t=getRouteTarget(pathname);return t?getModuleAccessPolicy(t.module,t.submodule,policy):"guest";};
