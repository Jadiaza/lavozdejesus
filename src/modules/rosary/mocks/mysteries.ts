import type { Mystery, MysteryGroup, MysteryGroupId } from "../types";
import { mysteryImageFor } from "./mysteryArt";

const m = (
  group: MysteryGroupId,
  order: number,
  title: string,
  shortName: string,
  scriptureRef: string,
  scriptureText: string,
  fruit: string,
): Mystery => ({
  id: `${group}-${order}`,
  group,
  order,
  title,
  shortName,
  scriptureRef,
  scriptureText,
  meditation: null,
  fruit,
  suggestedIntention: null,
  healingPrayer: null,
  imageUrl: mysteryImageFor(group, order),
  readingAudioId: null,
  meditationAudioId: null,
  estimatedMinutes: 4,
  published: true,
  contentVersion: "1.0.0-es",
  provisional: false,
});

export const mysteryRepresentativeVerses: Record<MysteryGroupId, { reference: string; text: string }> = {
  gozosos: { reference: "Lucas 1, 38", text: "He aquí la esclava del Señor; hágase en mí según tu palabra." },
  luminosos: { reference: "Mateo 3, 17", text: "Este es mi Hijo amado, en quien me complazco." },
  dolorosos: { reference: "Lucas 22, 44", text: "Y, sumido en agonía, insistía más en su oración." },
  gloriosos: { reference: "Marcos 16, 6", text: "Ha resucitado, no está aquí. Mirad el sitio donde lo pusieron." },
};

export const mysteryGroups: Record<MysteryGroupId, MysteryGroup> = {
  gozosos: {
    id: "gozosos", name: "Misterios Gozosos", description: "Contempla con María los primeros acontecimientos de la vida de Jesucristo.",
    palette: { base: "40 25% 78%", active: "45 90% 65%", completed: "42 60% 62%", accent: "45 85% 68%" },
    mysteries: [
      m("gozosos", 1, "La Encarnación del Hijo de Dios", "La Encarnación", "Lucas 1, 38", "María contestó: «He aquí la esclava del Señor; hágase en mí según tu palabra».", "Humildad"),
      m("gozosos", 2, "La Visitación de Nuestra Señora", "La Visitación", "Lucas 1, 42", "¡Bendita tú entre las mujeres, y bendito el fruto de tu vientre!", "Amor al Prójimo"),
      m("gozosos", 3, "El Nacimiento del Hijo de Dios", "El Nacimiento", "Lucas 2, 7", "Y dio a luz a su hijo primogénito, lo envolvió en pañales y lo recostó en un pesebre.", "Pobreza de Espíritu"),
      m("gozosos", 4, "La Presentación en el Templo", "La Presentación", "Lucas 2, 30-31", "Porque mis ojos han visto a tu Salvador, a quien has presentado ante todos los pueblos.", "Obediencia"),
      m("gozosos", 5, "El Niño Perdido y Hallado en el Templo", "Jesús en el Templo", "Lucas 2, 46", "A los tres días, lo encontraron en el templo, sentado en medio de los maestros, escuchándolos y haciéndoles preguntas.", "Gozo en las cosas del Señor"),
    ],
  },
  luminosos: {
    id: "luminosos", name: "Misterios Luminosos", description: "Contempla la vida pública de Jesús y la luz de su Reino.",
    palette: { base: "42 35% 72%", active: "45 95% 68%", completed: "38 75% 58%", accent: "40 90% 62%" },
    mysteries: [
      m("luminosos", 1, "El Bautismo en el Jordán", "El Bautismo", "Mateo 3, 17", "Y una voz que salía de los cielos decía: «Este es mi Hijo amado, en quien me complazco».", "Apertura al Espíritu Santo"),
      m("luminosos", 2, "Las Bodas de Caná", "Bodas de Caná", "Juan 2, 5", "Su madre dice a los sirvientes: «Haced lo que él os diga».", "A Jesús por María"),
      m("luminosos", 3, "El Anuncio del Reino de Dios", "El Reino", "Marcos 1, 15", "Se ha cumplido el tiempo y está cerca el reino de Dios. Convertíos y creed en el Evangelio.", "Conversión"),
      m("luminosos", 4, "La Transfiguración", "La Transfiguración", "Mateo 17, 2", "Y se transfiguró delante de ellos, y su rostro resplandecía como el sol, y sus vestidos se volvieron blancos como la luz.", "Deseo de Santidad"),
      m("luminosos", 5, "La Institución de la Eucaristía", "La Eucaristía", "Mateo 26, 26", "Tomad, comed: esto es mi cuerpo.", "Adoración Eucarística"),
    ],
  },
  dolorosos: {
    id: "dolorosos", name: "Misterios Dolorosos", description: "Acompaña a Jesús en su Pasión redentora.",
    palette: { base: "0 30% 55%", active: "45 85% 62%", completed: "355 55% 42%", accent: "350 60% 45%" },
    mysteries: [
      m("dolorosos", 1, "La Oración en el Huerto", "En el Huerto", "Lucas 22, 44", "Y, sumido en agonía, insistía más en su oración. Su sudor se hizo como gotas espesas de sangre que caían en tierra.", "Dolor de los pecados"),
      m("dolorosos", 2, "La Flagelación del Señor", "La Flagelación", "Juan 19, 1", "Entonces Pilato tomó a Jesús y lo mandó azotar.", "Pureza y mortificación"),
      m("dolorosos", 3, "La Coronación de Espinas", "Coronación de espinas", "Marcos 15, 17", "Lo vistieron de púrpura, trenzaron una corona de espinas y se la ciñeron.", "Fortaleza moral"),
      m("dolorosos", 4, "Jesús con la Cruz a Cuestas", "El Camino de la Cruz", "Juan 19, 17", "Y él, cargando con la cruz, salió al sitio llamado «de la Calavera».", "Paciencia"),
      m("dolorosos", 5, "La Crucifixión y Muerte", "La Crucifixión", "Lucas 23, 46", "Jesús, clamando con voz potente, dijo: «Padre, a tus manos encomiendo mi espíritu». Y, dicho esto, expiró.", "Perseverancia final"),
    ],
  },
  gloriosos: {
    id: "gloriosos", name: "Misterios Gloriosos", description: "Contempla la victoria de Cristo y la gloria de María.",
    palette: { base: "220 30% 68%", active: "45 90% 66%", completed: "222 55% 52%", accent: "220 60% 58%" },
    mysteries: [
      m("gloriosos", 1, "La Resurrección del Hijo de Dios", "La Resurrección", "Marcos 16, 6", "Ha resucitado, no está aquí. Mirad el sitio donde lo pusieron.", "Fe"),
      m("gloriosos", 2, "La Ascensión del Señor", "La Ascensión", "Marcos 16, 19", "El Señor Jesús, después de hablarles, ascendió al cielo y se sentó a la derecha de Dios.", "Esperanza"),
      m("gloriosos", 3, "La Venida del Espíritu Santo", "Pentecostés", "Hechos 2, 4", "Se llenaron todos de Espíritu Santo y empezaron a hablar en otras lenguas.", "Caridad y Dones del Espíritu"),
      m("gloriosos", 4, "La Asunción de María", "La Asunción", "Judit 15, 9", "¡Tú eres el orgullo de Jerusalén! ¡Tú la alegría de Israel! ¡Tú el honor de nuestra raza!", "Gracia de una Buena Muerte"),
      m("gloriosos", 5, "La Coronación de María", "La Coronación", "Apocalipsis 12, 1", "Apareció una figura portentosa en el cielo: una mujer vestida de sol, la luna por pedestal, coronada con doce estrellas.", "Confianza en María"),
    ],
  },
};

export const allGroups = Object.values(mysteryGroups);