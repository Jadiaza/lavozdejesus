import type { StudyLevel } from "@/services/bibleStudyService";

export const studyTabs = ["Texto", "Comparación", "Estructura", "Teología", "Oración"] as const;
export type StudyTab = (typeof studyTabs)[number];

export function tabsForStudyLevel(level: StudyLevel, doctrinalV2 = false): readonly StudyTab[] {
  if (level === "pastoral") return ["Texto", "Teología", "Oración"];
  if (level === "teologico") return ["Texto", "Comparación", "Estructura", "Teología"];
  if (level === "doctrinal" && doctrinalV2) return ["Texto", "Teología", "Oración"];
  // Doctrinal maestro y Formativo contienen la estructura integral completa.
  return studyTabs;
}
