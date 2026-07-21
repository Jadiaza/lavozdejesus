import { describe, expect, it } from "vitest";
import type { BibliaVersion } from "@/services/bibliaService";
import { equivalentChapterFromPlatense } from "@/utils/bibliaVersification";

const version = (codigo: string, versificacion: string): BibliaVersion => ({
  codigo,
  versificacion,
  nombre: codigo,
  abreviatura: codigo,
  idioma: "es",
  licencia: "",
  canon: 73,
});

describe("equivalencias de numeración de los Salmos", () => {
  it("convierte el Salmo 22 de la Vulgata al Salmo 23 masorético", () => {
    expect(equivalentChapterFromPlatense("PSA", 22, version("TORRESAMAT", "Hebrea"))).toBe(23);
  });

  it("conserva la numeración entre versiones Vulgata", () => {
    expect(equivalentChapterFromPlatense("PSA", 22, version("SCIO", "Vulgata"))).toBe(22);
  });

  it("exige revisión para salmos divididos o combinados", () => {
    expect(equivalentChapterFromPlatense("PSA", 113, version("TORRESAMAT", "Hebrea"))).toBeNull();
  });

  it("no modifica capítulos de otros libros", () => {
    expect(equivalentChapterFromPlatense("MAT", 22, version("TORRESAMAT", "Hebrea"))).toBe(22);
  });
});
