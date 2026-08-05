import { mysteryGroups } from "../mocks/mysteries";
import { prayers } from "../mocks/prayers";
import { buildRosaryDefinition } from "../utils/buildRosary";
import type {
  AudioManifest,
  MysteryGroup,
  MysteryGroupId,
  Prayer,
  RosaryDefinition,
} from "../types";
import { apiRequest, isSafeMediaUrl } from "./http";

export interface RosaryRepository {
  getDefinition(group: MysteryGroupId, signal?: AbortSignal): Promise<RosaryDefinition>;
  getMysteries(group: MysteryGroupId, signal?: AbortSignal): Promise<MysteryGroup>;
  getPrayers(signal?: AbortSignal): Promise<Record<string, Prayer>>;
  getAudioManifest(
    group: MysteryGroupId,
    variant: "completo" | "participativo",
    signal?: AbortSignal,
  ): Promise<AudioManifest>;
}

/** MOCK — activo mientras las APIs PHP no existan. Reemplazable por ApiRosaryRepository. */
export class MockRosaryRepository implements RosaryRepository {
  async getDefinition(group: MysteryGroupId): Promise<RosaryDefinition> {
    return buildRosaryDefinition({ group });
  }
  async getMysteries(group: MysteryGroupId): Promise<MysteryGroup> {
    return mysteryGroups[group];
  }
  async getPrayers(): Promise<Record<string, Prayer>> {
    return prayers;
  }
  async getAudioManifest(
    group: MysteryGroupId,
    variant: "completo" | "participativo",
  ): Promise<AudioManifest> {
    // No se simulan audios: sin archivos reales el manifiesto queda vacío.
    return { group, variant, available: false, totalBytes: null, segments: [] };
  }
}

/** Adaptador real contra las APIs PHP propuestas (aún no implementadas). */
export class ApiRosaryRepository implements RosaryRepository {
  getDefinition(group: MysteryGroupId, signal?: AbortSignal) {
    return apiRequest<RosaryDefinition>(`/rosario/definicion.php?grupo=${group}`, { signal });
  }
  getMysteries(group: MysteryGroupId, signal?: AbortSignal) {
    return apiRequest<MysteryGroup>(`/rosario/misterios.php?grupo=${group}`, { signal });
  }
  getPrayers(signal?: AbortSignal) {
    return apiRequest<Record<string, Prayer>>(`/rosario/oraciones.php`, { signal });
  }
  async getAudioManifest(
    group: MysteryGroupId,
    variant: "completo" | "participativo",
    signal?: AbortSignal,
  ) {
    const manifest = await apiRequest<AudioManifest>(
      `/rosario/audio.php?grupo=${group}&modo=${variant}`,
      { signal },
    );
    return {
      ...manifest,
      segments: manifest.segments.map((s) => ({
        ...s,
        url: isSafeMediaUrl(s.url) ? s.url : null,
      })),
    };
  }
}

/** Cambiar a ApiRosaryRepository cuando los endpoints PHP estén desplegados. */
export const rosaryRepository: RosaryRepository = new MockRosaryRepository();