import { describe, expect, it } from "vitest";
import { tabsForStudyLevel } from "@/features/biblia/studyTabs";

describe("pestañas por nivel de estudio", () => {
  it("muestra la experiencia esencial pastoral", () => {
    expect(tabsForStudyLevel("pastoral")).toEqual(["Texto", "Teología", "Oración"]);
  });

  it("muestra análisis técnico en Teológico", () => {
    expect(tabsForStudyLevel("teologico")).toEqual(["Texto", "Comparación", "Estructura", "Teología"]);
  });

  it("muestra la estructura completa en Doctrinal maestro y Formativo", () => {
    expect(tabsForStudyLevel("doctrinal")).toHaveLength(5);
    expect(tabsForStudyLevel("formativo")).toHaveLength(5);
  });

  it("conserva compatibilidad con el esquema doctrinal 2.x", () => {
    expect(tabsForStudyLevel("doctrinal", true)).toEqual(["Texto", "Teología", "Oración"]);
  });
});
