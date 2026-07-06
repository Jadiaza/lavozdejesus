export interface Evangelio {
  fecha: string;
  cita: string;
  extracto: string;
}

/**
 * Servicio legado conservado para compatibilidad.
 * El contenido del evangelio ahora debe llegar desde las APIs MySQL.
 */
export async function getEvangelios(): Promise<Evangelio[]> {
  return [];
}
