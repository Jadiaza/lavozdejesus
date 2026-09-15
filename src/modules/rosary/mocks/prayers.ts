import type { Prayer } from "../types";

/**
 * Textos del Santo Rosario en español.
 * Base: Guía del Rosario (España), traducción CEE suministrada para el proyecto.
 */
export const prayers: Record<string, Prayer> = {
  senal_cruz: {
    key: "senal_cruz",
    title: "Señal de la Cruz",
    body: ["En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén."],
  },
  credo: {
    key: "credo",
    title: "Credo de los Apóstoles",
    body: [
      "Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra. Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos.",
      "Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.",
    ],
  },
  padrenuestro: {
    key: "padrenuestro",
    title: "Padre Nuestro",
    body: ["Padre nuestro, que estás en el cielo, santificado sea tu nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén."],
  },
  avemaria: {
    key: "avemaria",
    title: "Ave María",
    body: ["Dios te salve, María, llena eres de gracia; el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén."],
  },
  gloria: {
    key: "gloria",
    title: "Gloria",
    body: ["Gloria al Padre y al Hijo y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén."],
  },
  fatima: {
    key: "fatima",
    title: "Jaculatoria de Fátima",
    body: ["¡Oh Jesús mío!, perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia."],
  },
  salve: {
    key: "salve",
    title: "La Salve",
    body: [
      "Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra; Dios te salve. A ti llamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando, en este valle de lágrimas. Ea, pues, Señora, abogada nuestra, vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clementísima, oh piadosa, oh dulce Virgen María!",
      "V. Ruega por nosotros, Santa Madre de Dios.",
      "R. Para que seamos dignos de alcanzar las promesas de Nuestro Señor Jesucristo.",
    ],
  },
  oracion_final: {
    key: "oracion_final",
    title: "Oración Final",
    body: ["Oremos. Oh Dios, cuyo Unigénito Hijo, con su vida, muerte y resurrección, nos alcanzó el premio de la vida eterna: concédenos, a los que meditamos estos misterios del Santísimo Rosario de la Bienaventurada Virgen María, imitar lo que contienen y alcanzar lo que prometen. Por el mismo Jesucristo Nuestro Señor. Amén."],
  },
  anuncio: {
    key: "anuncio",
    title: "Anuncio del misterio y lectura",
    body: ["Contemplemos este misterio con María a la luz de la Palabra de Dios."],
  },
  pausa: {
    key: "pausa",
    title: "Pausa contemplativa",
    body: ["Guarda un momento de silencio para contemplar el misterio anunciado y acoger la Palabra de Dios."],
  },
};

export const getPrayer = (key: string): Prayer =>
  prayers[key] ?? { key, title: key, body: ["Contenido no disponible."], provisional: true };