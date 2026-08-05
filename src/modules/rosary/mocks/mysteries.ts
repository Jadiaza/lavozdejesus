import type { Mystery, MysteryGroup, MysteryGroupId } from "../types";

/**
 * CONTENIDO PROVISIONAL — datos mock claramente identificados.
 * Reemplazar por GET /api/rosario/misterios.php?grupo=...
 * Los textos bíblicos y meditaciones se dejan en null: no se inventan
 * como contenido definitivo. La UI muestra el estado "sin contenido publicado".
 */
const m = (
  group: MysteryGroupId,
  order: number,
  title: string,
  shortName: string,
  scriptureRef: string,
  fruit: string,
): Mystery => ({
  id: `${group}-${order}`,
  group,
  order,
  title,
  shortName,
  scriptureRef,
  scriptureText: null,
  meditation: null,
  fruit,
  suggestedIntention: null,
  healingPrayer: null,
  imageUrl: null,
  readingAudioId: null,
  meditationAudioId: null,
  estimatedMinutes: 4,
  published: false,
  contentVersion: "0.1.0-mock",
  provisional: true,
});

export const mysteryGroups: Record<MysteryGroupId, MysteryGroup> = {
  gozosos: {
    id: "gozosos",
    name: "Misterios Gozosos",
    description:
      "Contempla con María los primeros acontecimientos de la vida de Jesucristo.",
    palette: { base: "40 25% 78%", active: "45 90% 65%", completed: "42 60% 62%", accent: "45 85% 68%" },
    mysteries: [
      m("gozosos", 1, "La Encarnación del Hijo de Dios", "La Encarnación", "Lucas 1", "Humildad"),
      m("gozosos", 2, "La Visitación de María a su prima Isabel", "La Visitación", "Lucas 1", "Caridad fraterna"),
      m("gozosos", 3, "El Nacimiento de Jesús en Belén", "El Nacimiento", "Lucas 2", "Pobreza de espíritu"),
      m("gozosos", 4, "La Presentación del Niño Jesús en el Templo", "La Presentación", "Lucas 2", "Obediencia"),
      m("gozosos", 5, "El Niño Jesús perdido y hallado en el Templo", "Jesús en el Templo", "Lucas 2", "Buscar a Dios"),
    ],
  },
  luminosos: {
    id: "luminosos",
    name: "Misterios Luminosos",
    description: "Contempla la vida pública de Jesús y la luz de su Reino.",
    palette: { base: "42 35% 72%", active: "45 95% 68%", completed: "38 75% 58%", accent: "40 90% 62%" },
    mysteries: [
      m("luminosos", 1, "El Bautismo de Jesús en el Jordán", "El Bautismo", "Mateo 3", "Fidelidad bautismal"),
      m("luminosos", 2, "Las bodas de Caná", "Bodas de Caná", "Juan 2", "Confianza en María"),
      m("luminosos", 3, "El anuncio del Reino de Dios", "El Reino", "Marcos 1", "Conversión"),
      m("luminosos", 4, "La Transfiguración del Señor", "La Transfiguración", "Mateo 17", "Deseo de santidad"),
      m("luminosos", 5, "La institución de la Eucaristía", "La Eucaristía", "Lucas 22", "Amor eucarístico"),
    ],
  },
  dolorosos: {
    id: "dolorosos",
    name: "Misterios Dolorosos",
    description: "Acompaña a Jesús en su Pasión redentora.",
    palette: { base: "0 30% 55%", active: "45 85% 62%", completed: "355 55% 42%", accent: "350 60% 45%" },
    mysteries: [
      m("dolorosos", 1, "La oración de Jesús en el Huerto", "En el Huerto", "Lucas 22", "Arrepentimiento"),
      m("dolorosos", 2, "La flagelación del Señor", "La Flagelación", "Juan 19", "Mortificación"),
      m("dolorosos", 3, "La coronación de espinas", "Coronación de espinas", "Mateo 27", "Humildad"),
      m("dolorosos", 4, "Jesús con la cruz camino al Calvario", "El Camino de la Cruz", "Lucas 23", "Paciencia"),
      m("dolorosos", 5, "La Crucifixión y muerte de Jesús", "La Crucifixión", "Juan 19", "Amor hasta el extremo"),
    ],
  },
  gloriosos: {
    id: "gloriosos",
    name: "Misterios Gloriosos",
    description: "Contempla la victoria de Cristo y la gloria de María.",
    palette: { base: "220 30% 68%", active: "45 90% 66%", completed: "222 55% 52%", accent: "220 60% 58%" },
    mysteries: [
      m("gloriosos", 1, "La Resurrección del Señor", "La Resurrección", "Mateo 28", "Fe"),
      m("gloriosos", 2, "La Ascensión del Señor", "La Ascensión", "Hechos 1", "Esperanza"),
      m("gloriosos", 3, "La venida del Espíritu Santo", "Pentecostés", "Hechos 2", "Celo apostólico"),
      m("gloriosos", 4, "La Asunción de la Virgen María", "La Asunción", "Apocalipsis 12", "Devoción mariana"),
      m("gloriosos", 5, "La Coronación de María como Reina", "La Coronación", "Apocalipsis 12", "Perseverancia"),
    ],
  },
};

export const allGroups = Object.values(mysteryGroups);