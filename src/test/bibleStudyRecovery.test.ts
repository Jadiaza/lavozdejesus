import { describe, expect, it } from "vitest";
import { isRecoverableBibleStudyStatus, matchesBibleStudyRequest, type BibleStudy, type BibleStudyRequest } from "@/services/bibleStudyService";

const request: BibleStudyRequest = { libro_codigo: "MAT", capitulo_inicio: 1, versiculo_inicio: 18, capitulo_fin: 1, versiculo_fin: 25, nivel: "pastoral" };
const study: BibleStudy = { id: 42, referencia: "Mateo 1,18-25", titulo: "Emmanuel", estado: "revision", revisado: false, es_publico: false, metodo: "integral_lvj", nivel: "pastoral", idioma: "es", esquema_version: "integral-lvj-1.0", libro_codigo: "MAT", capitulo_inicio: 1, versiculo_inicio: 18, capitulo_fin: 1, versiculo_fin: 25, contenido: { titulo: "Emmanuel" } };

describe("recuperación de estudios interrumpidos", () => {
  it("reconoce exactamente el estudio terminado", () => {
    expect(matchesBibleStudyRequest(study, request)).toBe(true);
  });
  it("clasifica timeouts y conflictos como recuperables", () => {
    expect(isRecoverableBibleStudyStatus(409)).toBe(true);
    expect(isRecoverableBibleStudyStatus(504)).toBe(true);
    expect(isRecoverableBibleStudyStatus(524)).toBe(true);
    expect(isRecoverableBibleStudyStatus(422)).toBe(false);
  });
  it("no confunde otro rango o un registro sin contenido", () => {
    expect(matchesBibleStudyRequest({ ...study, versiculo_fin: 24 }, request)).toBe(false);
    expect(matchesBibleStudyRequest({ ...study, contenido: {} }, request)).toBe(false);
  });
});
