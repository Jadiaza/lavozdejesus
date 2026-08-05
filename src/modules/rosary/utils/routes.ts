import type { RosaryModeId } from "../types";

/** Ruta de rezo asociada a cada modalidad. */
export const routeForMode = (mode: RosaryModeId | null): string =>
  mode === "audio" ? "/rosario/audio" : mode === "physical" ? "/rosario/fisico" : "/rosario/digital";