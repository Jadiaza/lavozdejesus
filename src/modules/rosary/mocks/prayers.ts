import type { Prayer } from "../types";

/**
 * CONTENIDO PROVISIONAL — reemplazar por GET /api/rosario/definicion.php
 * Oraciones tradicionales de dominio público. Todo texto es plano.
 */
export const prayers: Record<string, Prayer> = {
  senal_cruz: {
    key: "senal_cruz",
    title: "Señal de la Cruz",
    body: ["Por la señal de la Santa Cruz, de nuestros enemigos líbranos, Señor, Dios nuestro. En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén."],
  },
  espiritu_santo: {
    key: "espiritu_santo",
    title: "Invocación al Espíritu Santo",
    body: ["Ven, Espíritu Santo, llena los corazones de tus fieles y enciende en ellos el fuego de tu amor."],
  },
  ofrecimiento: {
    key: "ofrecimiento",
    title: "Ofrecimiento del Rosario",
    body: ["Santísima Virgen María, te ofrecemos este Santo Rosario por las intenciones de tu Corazón Inmaculado."],
    provisional: true,
  },
  contricion: {
    key: "contricion",
    title: "Acto de contrición",
    body: ["Señor mío Jesucristo, Dios y Hombre verdadero, me pesa de todo corazón haberte ofendido. Propongo firmemente enmendarme y confiar en tu misericordia."],
    provisional: true,
  },
  credo: {
    key: "credo",
    title: "Credo",
    body: ["Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra; y en Jesucristo, su único Hijo, nuestro Señor… Amén."],
    provisional: true,
  },
  padrenuestro: {
    key: "padrenuestro",
    title: "Padrenuestro",
    body: ["Padre nuestro, que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu reino; hágase tu voluntad en la tierra como en el cielo. Amén."],
    provisional: true,
  },
  avemaria: {
    key: "avemaria",
    title: "Avemaría",
    body: ["Dios te salve, María, llena eres de gracia, el Señor es contigo. Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén."],
    provisional: true,
  },
  gloria: {
    key: "gloria",
    title: "Gloria",
    body: ["Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén."],
  },
  fatima: {
    key: "fatima",
    title: "Oración de Fátima",
    body: ["Oh Jesús mío, perdona nuestras culpas, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia."],
  },
  jaculatoria: {
    key: "jaculatoria",
    title: "Jaculatoria",
    body: ["María, Madre de gracia, Madre de misericordia, defiéndenos de nuestros enemigos y ampáranos ahora y en la hora de nuestra muerte."],
  },
  salve: {
    key: "salve",
    title: "Salve",
    body: ["Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra; Dios te salve. Amén."],
    provisional: true,
  },
  letanias: {
    key: "letanias",
    title: "Letanías lauretanas",
    body: ["Señor, ten piedad. Cristo, ten piedad. Santa María, ruega por nosotros…"],
    provisional: true,
  },
  oracion_final: {
    key: "oracion_final",
    title: "Oración final",
    body: ["Te rogamos, Señor, que la intercesión de la Virgen María nos alcance los frutos de los misterios contemplados. Amén."],
    provisional: true,
  },
  consagracion: {
    key: "consagracion",
    title: "Consagración mariana (opcional)",
    body: ["Oh Señora mía, oh Madre mía, yo me ofrezco enteramente a Ti."],
    provisional: true,
  },
  anuncio: {
    key: "anuncio",
    title: "Anuncio del misterio",
    body: ["Contemplemos este misterio con María."],
  },
  pausa: {
    key: "pausa",
    title: "Pausa contemplativa",
    body: ["Guarda un momento de silencio ante el misterio contemplado."],
  },
};

export const getPrayer = (key: string): Prayer =>
  prayers[key] ?? { key, title: key, body: ["Contenido no disponible."], provisional: true };