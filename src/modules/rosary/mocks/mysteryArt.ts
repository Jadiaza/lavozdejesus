import type { MysteryGroupId } from "../types";

const R2_MYSTERIES_BASE =
  "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/lvjplayer/rosario/images/mysteries";

/** Imágenes oficiales de cada uno de los 20 misterios, alojadas en Cloudflare R2. */
export const mysteryImages: Record<MysteryGroupId, readonly string[]> = {
  gozosos: [
    `${R2_MYSTERIES_BASE}/gozosos/joyful_1_annunciation.webp`,
    `${R2_MYSTERIES_BASE}/gozosos/joyful_2_visitation.webp`,
    `${R2_MYSTERIES_BASE}/gozosos/joyful_3_nativity.webp`,
    `${R2_MYSTERIES_BASE}/gozosos/joyful_4_presentation.webp`,
    `${R2_MYSTERIES_BASE}/gozosos/joyful_5_finding.webp`,
  ],
  luminosos: [
    `${R2_MYSTERIES_BASE}/luminosos/luminous_1_baptism.webp`,
    `${R2_MYSTERIES_BASE}/luminosos/luminous_2_wedding.webp`,
    `${R2_MYSTERIES_BASE}/luminosos/luminous_3_proclamation.webp`,
    `${R2_MYSTERIES_BASE}/luminosos/luminous_4_transfiguration.webp`,
    `${R2_MYSTERIES_BASE}/luminosos/luminous_5_institution.webp`,
  ],
  dolorosos: [
    `${R2_MYSTERIES_BASE}/dolorosos/sorrowful_1_agony.webp`,
    `${R2_MYSTERIES_BASE}/dolorosos/sorrowful_2_scourging.webp`,
    `${R2_MYSTERIES_BASE}/dolorosos/sorrowful_3_crowning.webp`,
    `${R2_MYSTERIES_BASE}/dolorosos/sorrowful_4_carrying.webp`,
    `${R2_MYSTERIES_BASE}/dolorosos/sorrowful_5_crucifixion.webp`,
  ],
  gloriosos: [
    `${R2_MYSTERIES_BASE}/gloriosos/glorious_1_resurrection.webp`,
    `${R2_MYSTERIES_BASE}/gloriosos/glorious_2_ascension.webp`,
    `${R2_MYSTERIES_BASE}/gloriosos/glorious_3_descent.webp`,
    `${R2_MYSTERIES_BASE}/gloriosos/glorious_4_assumption.webp`,
    `${R2_MYSTERIES_BASE}/gloriosos/glorious_5_coronation.webp`,
  ],
};

/**
 * Arte representativo por grupo. Se usa el primer misterio como portada cuando
 * una pantalla representa el grupo completo y no un misterio individual.
 */
export const mysteryArt: Record<MysteryGroupId, string> = {
  gozosos: mysteryImages.gozosos[0],
  luminosos: mysteryImages.luminosos[0],
  dolorosos: mysteryImages.dolorosos[0],
  gloriosos: mysteryImages.gloriosos[0],
};

export const mysteryImageFor = (group: MysteryGroupId, order: number): string =>
  mysteryImages[group][Math.max(0, Math.min(4, order - 1))] ?? mysteryArt[group];

/** Días en que se rezan tradicionalmente cada grupo. */
export const mysteryDays: Record<MysteryGroupId, string> = {
  gozosos: "Lunes y Sábado",
  luminosos: "Jueves",
  dolorosos: "Martes y Viernes",
  gloriosos: "Miércoles y Domingo",
};
