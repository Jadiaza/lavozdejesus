import { describe, expect, it } from "vitest";
import type { BibliaLibro } from "@/services/bibliaService";
import { resolverReferenciaBiblica } from "./referenceSearch";

const books: BibliaLibro[] = [
  { id: 1, codigo: "JHN", nombre: "Juan", abreviatura: "Jn", testamento: "NT", grupo: "Evangelios", orden: 50, capitulos: 21 },
  { id: 2, codigo: "1CO", nombre: "1 Corintios", abreviatura: "1 Cor", testamento: "NT", grupo: "Cartas", orden: 55, capitulos: 16 },
  { id: 3, codigo: "PSA", nombre: "Salmos", abreviatura: "Sal", testamento: "AT", grupo: "Poéticos", orden: 19, capitulos: 150 },
  { id: 4, codigo: "REV", nombre: "Apocalipsis", abreviatura: "Ap", testamento: "NT", grupo: "Apocalíptico", orden: 73, capitulos: 22 },
  { id: 5, codigo: "1JN", nombre: "1 Juan", abreviatura: "1 Jn", testamento: "NT", grupo: "Cartas", orden: 70, capitulos: 5 },
];

describe("resolverReferenciaBiblica", () => {
  for (const value of ["Jn 3,16", "Jn 3:16", "Juan 3,16", "Juan 3:16", "Juan 3 16"]) {
    it(`resuelve ${value}`, () => {
      const result = resolverReferenciaBiblica(value, books);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.libro.codigo).toBe("JHN");
        expect(result.data.capitulo).toBe(3);
        expect(result.data.versiculoInicio).toBe(16);
        expect(result.data.versiculoFin).toBe(16);
      }
    });
  }

  it("resuelve un capítulo completo", () => {
    const result = resolverReferenciaBiblica("Juan 3", books);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.versiculoInicio).toBeUndefined();
  });

  it("resuelve rangos", () => {
    const result = resolverReferenciaBiblica("Juan 3,16-18", books);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.versiculoFin).toBe(18);
  });

  for (const value of ["1 Cor 13", "1 Cor 13,1-13", "Sal 23", "Salmo 23", "Ap 12,7", "1 Jn 4,8"]) {
    it(`acepta ${value}`, () => {
      expect(resolverReferenciaBiblica(value, books).ok).toBe(true);
    });
  }

  it("rechaza capítulos inexistentes", () => {
    const result = resolverReferenciaBiblica("Juan 30", books);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("capítulo 30");
  });

  it("rechaza rangos invertidos", () => {
    expect(resolverReferenciaBiblica("Juan 3,18-16", books).ok).toBe(false);
  });
});
