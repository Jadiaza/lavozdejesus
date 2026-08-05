import { mysteryGroups } from "../mocks/mysteries";
import type {
  MysteryGroupId,
  RosaryBead,
  RosaryDefinition,
  RosarySection,
} from "../types";

export interface RosaryEngineConfig {
  group: MysteryGroupId;
  /** número de decenas */
  groups?: number;
  /** avemarías por decena */
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
 * Motor configurable de cuentas: la estructura del Rosario se genera desde
 * datos, no desde JSX. Reutilizable para coronillas y otras devociones.
 */
export const buildRosaryDefinition = (
  config: RosaryEngineConfig,
): RosaryDefinition => {
  const {
    group,
    groups = 5,
    beadsPerGroup = 10,
    includeSpiritInvocation = true,
    includeOffering = true,
    includeContrition = true,
    includeFatima = true,
    includeJaculatory = true,
    includeLitanies = false,
    includeConsecration = false,
  } = config;

  const groupData = mysteryGroups[group];
  const palette = groupData.palette;
  let order = 0;
  const next = () => order++;
  const sections: RosarySection[] = [];

  // 1. Apertura
  const openingKeys: Array<[string, string, RosaryBead["type"]]> = [
    ["senal_cruz", "Señal de la Cruz", "cross"],
    ...(includeSpiritInvocation
      ? ([["espiritu_santo", "Invocación al Espíritu Santo", "separator"]] as Array<[string, string, RosaryBead["type"]]>)
      : []),
    ...(includeOffering
      ? ([["ofrecimiento", "Ofrecimiento del Rosario", "separator"]] as Array<[string, string, RosaryBead["type"]]>)
      : []),
    ...(includeContrition
      ? ([["contricion", "Acto de contrición", "separator"]] as Array<[string, string, RosaryBead["type"]]>)
      : []),
    ["credo", "Credo", "medal"],
    ["padrenuestro", "Padrenuestro", "large"],
    ["avemaria", "Avemaría 1 de 3", "small"],
    ["avemaria", "Avemaría 2 de 3", "small"],
    ["avemaria", "Avemaría 3 de 3", "small"],
    ["gloria", "Gloria", "separator"],
  ];

  sections.push({
    id: "opening",
    type: "opening",
    order: sections.length,
    title: "Oraciones iniciales",
    beads: openingKeys.map(([prayerKey, label, type], i) =>
      bead(
        {
          id: `opening-${i}`,
          order: next(),
          group: null,
          type,
          prayerKey,
          label,
          audioSegmentId: `seg-${prayerKey}`,
        },
        palette,
      ),
    ),
  });

  // 2. Decenas
  for (let d = 1; d <= groups; d++) {
    const mystery = groupData.mysteries[d - 1];
    const beads: RosaryBead[] = [];
    beads.push(
      bead(
        {
          id: `d${d}-anuncio`,
          order: next(),
          group: d,
          type: "separator",
          prayerKey: "anuncio",
          label: `${d}º misterio: ${mystery?.shortName ?? ""}`,
          audioSegmentId: `seg-lectura-${d}`,
        },
        palette,
        false,
      ),
      bead(
        {
          id: `d${d}-pausa`,
          order: next(),
          group: d,
          type: "separator",
          prayerKey: "pausa",
          label: "Pausa contemplativa",
          audioSegmentId: `seg-meditacion-${d}`,
        },
        palette,
        false,
      ),
      bead(
        {
          id: `d${d}-pn`,
          order: next(),
          group: d,
          type: "large",
          prayerKey: "padrenuestro",
          label: "Padrenuestro",
          audioSegmentId: "seg-padrenuestro",
        },
        palette,
      ),
    );
    for (let a = 1; a <= beadsPerGroup; a++) {
      beads.push(
        bead(
          {
            id: `d${d}-ave${a}`,
            order: next(),
            group: d,
            type: "small",
            prayerKey: "avemaria",
            label: `Avemaría ${a} de ${beadsPerGroup}`,
            audioSegmentId: "seg-avemaria",
          },
          palette,
        ),
      );
    }
    beads.push(
      bead(
        {
          id: `d${d}-gloria`,
          order: next(),
          group: d,
          type: "separator",
          prayerKey: "gloria",
          label: "Gloria",
          audioSegmentId: "seg-gloria",
        },
        palette,
      ),
    );
    if (includeFatima) {
      beads.push(
        bead(
          {
            id: `d${d}-fatima`,
            order: next(),
            group: d,
            type: "separator",
            prayerKey: "fatima",
            label: "Oración de Fátima",
          },
          palette,
        ),
      );
    }
    if (includeJaculatory) {
      beads.push(
        bead(
          {
            id: `d${d}-jac`,
            order: next(),
            group: d,
            type: "separator",
            prayerKey: "jaculatoria",
            label: "Jaculatoria",
          },
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

  // 3. Cierre
  const closingKeys: Array<[string, string]> = [
    ["salve", "Salve"],
    ...(includeLitanies ? ([["letanias", "Letanías lauretanas"]] as Array<[string, string]>) : []),
    ["oracion_final", "Oración final"],
    ...(includeConsecration ? ([["consagracion", "Consagración mariana"]] as Array<[string, string]>) : []),
    ["senal_cruz", "Señal de la Cruz"],
  ];
  sections.push({
    id: "closing",
    type: "closing",
    order: sections.length,
    title: "Oraciones finales",
    beads: closingKeys.map(([prayerKey, label], i) =>
      bead(
        {
          id: `closing-${i}`,
          order: next(),
          group: null,
          type: "closing",
          prayerKey,
          label,
          audioSegmentId: `seg-${prayerKey}`,
        },
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
    version: "1.0.0",
  };
};

export const totalBeads = (def: RosaryDefinition) =>
  def.sections.reduce((n, s) => n + s.beads.length, 0);