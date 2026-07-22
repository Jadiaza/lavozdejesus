export interface DoctrinalStudyV2 {
  schema_version: string;
  prompt_version: string;
  nivel: "doctrinal";
  referencia: string;
  titulo: string;
  resumen: string;
  textos: Record<"platense" | "torres_amat", { disponible: boolean; texto: string; observacion?: string; es_version_base?: boolean; version_texto?: string | null }>;
  fundamentacion_straubinger: Record<string, unknown>;
  comprension_global: string;
  contexto_biblico: Record<string, unknown>;
  mensaje_teologico: Record<string, unknown>;
  mensaje_cristologico: Record<string, unknown>;
  tipologia?: Record<string, unknown>;
  referencias_cruzadas: Array<{ referencia: string; relacion: string; categoria?: string }>;
  doctrina_catolica: {
    doctrina_central: unknown;
    catecismo: unknown[];
    magisterio: unknown[];
    padres_iglesia: unknown[];
    liturgia?: unknown;
    sacramentos?: unknown[];
    moral_cristiana: unknown[];
    errores_interpretacion: unknown[];
  };
  aplicacion_espiritual: string;
  preguntas_para_meditar: string[];
  advertencias: string[];
  metadata: Record<string, unknown>;
}

export function isDoctrinalStudyV2(value: unknown): value is DoctrinalStudyV2 {
  if (!value || typeof value !== "object") return false;
  const study=value as Record<string,unknown>;
  return typeof study.schema_version === "string"
    && study.schema_version.startsWith("2.")
    && study.nivel === "doctrinal"
    && Boolean(study.doctrina_catolica)
    && typeof study.doctrina_catolica === "object";
}
