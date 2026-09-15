import { mysteryGroups } from "../mocks/mysteries";
import type {
  MysteryGroupId,
  RosaryBead,
  RosaryDefinition,
  RosarySection,
} from "../types";

export interface RosaryEngineConfig {
  group: MysteryGroupId;
  groups?: number;
  beadsPerGroup?: number;
  includeSpiritInvocation?: boolean;
  includeOffering?: boolean;
  includeContrition?: boolean;
  includeFatima?: boolean;
  includeJaculatory?: boolean;
  includeLitanies?: boolean;
  includeConsecration?: boolean;
}

const bead = (
  partial: Omit<RosaryBead, "baseColor" | "activeColor" | "completedColor">,
  palette: { base: string; active: string; completed: string },
  haptic = true,
): RosaryBead => ({
  ...partial,
  haptic,
  baseColor: palette.base,
  activeColor: palette.active,
  completedColor: palette.completed,
});

/**
 * Secuencia del Santo Rosario en español:
 * Señal de la Cruz, Credo, Padre Nuestro, tres Ave Marías y Gloria;
 * cinco misterios con Padre Nuestro, diez Ave Marías, Gloria y Fátima;
 * Salve, oración final y Señal de la Cruz.
 */
export const buildRosaryDefinition = (
  config: RosaryEngineConfig,
): RosaryDefinition => {
  const {
    group,
    groups = 5,
    beadsPerGroup = 10,
    includeFatima = true,
  } = config;

  const groupData = mysteryGroups[group];
  const palette = groupData.palette;
  let order = 0;
  const next = () => order++;
  const sections: RosarySection[] = [];

  const openingKeys: Array<[string, string, RosaryBead["type"]]> = [
    ["senal_cruz", "Señal de la Cruz", "cross"],
    ["credo", "Credo de los Apóstoles", "medal"],
    ["padrenuestro", "Padre Nuestro", "large"],
    ["avemaria", "Ave María 1 de 3 · por la Fe", "small"],
    ["avemaria", "Ave María 2 de 3 · por la Esperanza", "small"],
    ["avemaria", "Ave María 3 de 3 · por la Caridad", "small"],
    ["gloria", "Gloria", "separator"],
  ];

  sections.push({
    id: "opening",
    type: "opening",
    order: sections.length,
    title: "Oraciones iniciales",
    beads: openingKeys.map(([prayerKey, label, type], i) =>
      bead(
        { id: `opening-${i}`, order: next(), group: null, type, prayerKey, label, audioSegmentId: `seg-${prayerKey}` },
        palette,
      ),
    ),
  });

  for (let d = 1; d <= groups; d++) {
    const mystery = groupData.mysteries[d - 1];
    const beads: RosaryBead[] = [];
    beads.push(
      bead(
        { id: `d${d}-anuncio`, order: next(), group: d, type: "separator", prayerKey: "anuncio", label: `${d}º misterio: ${mystery?.shortName ?? ""}`, audioSegmentId: `seg-lectura-${d}` },
        palette,
        false,
      ),
      bead(
        { id: `d${d}-pausa`, order: next(), group: d, type: "separator", prayerKey: "pausa", label: "Contemplación", audioSegmentId: `seg-meditacion-${d}` },
        palette,
        false,
      ),
      bead(
        { id: `d${d}-pn`, order: next(), group: d, type: "large", prayerKey: "padrenuestro", label: "Padre Nuestro", audioSegmentId: "seg-padrenuestro" },
        palette,
      ),
    );
    for (let a = 1; a <= beadsPerGroup; a++) {
      beads.push(
        bead(
          { id: `d${d}-ave${a}`, order: next(), group: d, type: "small", prayerKey: "avemaria", label: `Ave María ${a} de ${beadsPerGroup}`, audioSegmentId: "seg-avemaria" },
          palette,
        ),
      );
    }
    beads.push(
      bead(
        { id: `d${d}-gloria`, order: next(), group: d, type: "separator", prayerKey: "gloria", label: "Gloria", audioSegmentId: "seg-gloria" },
        palette,
      ),
    );
    if (includeFatima) {
      beads.push(
        bead(
          { id: `d${d}-fatima`, order: next(), group: d, type: "separator", prayerKey: "fatima", label: "Jaculatoria de Fátima" },
          palette,
        ),
      );
    }

    sections.push({
      id: `decade-${d}`,
      type: "decade",
      order: sections.length,
      title: mystery ? `${d}º misterio — ${mystery.title}` : `Decena ${d}`,
      mysteryId: mystery?.id,
      beads,
    });
  }

  const closingKeys: Array<[string, string]> = [
    ["salve", "La Salve"],
    ["oracion_final", "Oración Final"],
    ["senal_cruz", "Señal de la Cruz"],
  ];
  sections.push({
    id: "closing",
    type: "closing",
    order: sections.length,
    title: "Oraciones finales",
    beads: closingKeys.map(([prayerKey, label], i) =>
      bead(
        { id: `closing-${i}`, order: next(), group: null, type: "closing", prayerKey, label, audioSegmentId: `seg-${prayerKey}` },
        palette,
        false,
      ),
    ),
  });

  return {
    id: `rosario-${group}`,
    slug: `santo-rosario-${group}`,
    title: `Santo Rosario — ${groupData.name}`,
    mysteryGroup: group,
    sections,
    version: "1.1.0-es",
  };
};

export const totalBeads = (def: RosaryDefinition) =>
  def.sections.reduce((n, s) => n + s.beads.length, 0);