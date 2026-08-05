// Tipos del módulo Santo Rosario. Contratos compartidos entre servicios,
// adaptadores (API PHP / mock) y componentes de UI.

export type MysteryGroupId = "gozosos" | "luminosos" | "dolorosos" | "gloriosos";

export type RosaryModeId = "digital" | "physical" | "audio";

export type RosaryBeadType =
  | "cross"
  | "medal"
  | "large"
  | "small"
  | "separator"
  | "closing";

export interface RosaryBead {
  id: string;
  order: number;
  group: number | null;
  type: RosaryBeadType;
  prayerKey: string;
  label: string;
  baseColor: string;
  activeColor: string;
  completedColor: string;
  audioSegmentId?: string;
  haptic?: boolean;
}

export interface RosarySection {
  id: string;
  type: "opening" | "mystery" | "decade" | "jaculatory" | "closing";
  order: number;
  title: string;
  mysteryId?: string;
  beads: RosaryBead[];
}

export interface RosaryDefinition {
  id: string;
  slug: string;
  title: string;
  mysteryGroup: MysteryGroupId;
  sections: RosarySection[];
  version: string;
}

export interface Prayer {
  key: string;
  title: string;
  /** Texto en párrafos. Solo texto plano: nunca se inyecta como HTML. */
  body: string[];
  provisional?: boolean;
}

export interface Mystery {
  id: string;
  group: MysteryGroupId;
  order: number;
  title: string;
  shortName: string;
  scriptureRef: string;
  scriptureText: string | null;
  meditation: string | null;
  fruit: string;
  suggestedIntention: string | null;
  healingPrayer?: string | null;
  imageUrl: string | null;
  readingAudioId?: string | null;
  meditationAudioId?: string | null;
  estimatedMinutes: number;
  published: boolean;
  contentVersion: string;
  /** true = contenido temporal, pendiente de reemplazo por contenido oficial. */
  provisional: boolean;
}

export interface MysteryGroup {
  id: MysteryGroupId;
  name: string;
  description: string;
  palette: {
    base: string;
    active: string;
    completed: string;
    accent: string;
  };
  mysteries: Mystery[];
}

export interface LiturgicalSeason {
  nombre: string;
  color: string;
}

/** Respuesta de GET /api/rosario/hoy.php (contrato propuesto, aún no implementado). */
export interface RosaryTodayDto {
  ok: boolean;
  fecha: string;
  dia_semana: string;
  tiempo_liturgico: LiturgicalSeason | null;
  celebracion: string | null;
  misterios_recomendados: MysteryGroupId;
  motivo: "distribucion_semanal" | "celebracion" | string;
}

export interface RosaryToday {
  date: string;
  weekday: string;
  season: LiturgicalSeason | null;
  celebration: string | null;
  recommendedGroup: MysteryGroupId;
  reasonLabel: string;
  /** true cuando el dato proviene de la regla semanal local (sin conexión). */
  offlineFallback: boolean;
}

export type RosaryIntentionKind =
  | "personal"
  | "familia"
  | "enfermo"
  | "difunto"
  | "iglesia"
  | "sacerdotes"
  | "paz"
  | "virgen"
  | "otra"
  | "ninguna";

export interface RosaryIntention {
  kind: RosaryIntentionKind;
  label: string;
  /** Texto libre. Privado por defecto; solo se persiste si allowStore = true. */
  text?: string;
  allowStore: boolean;
}

export type RosarySessionStatus = "iniciado" | "pausado" | "terminado";

export interface RosarySession {
  definitionId: string;
  group: MysteryGroupId;
  mode: RosaryModeId;
  sectionIndex: number;
  beadIndex: number;
  audioSegmentIndex: number;
  audioPositionSeconds: number;
  intention: RosaryIntention | null;
  startedAt: string;
  updatedAt: string;
  status: RosarySessionStatus;
  elapsedSeconds: number;
}

export type TextSize = "sm" | "md" | "lg";

export interface RosaryPreferences {
  lastMode: RosaryModeId | null;
  textSize: TextSize;
  highContrast: boolean;
  haptics: boolean;
  backgroundMusic: boolean;
  autoAdvance: boolean;
  voiceVolume: number;
  musicVolume: number;
  speed: number;
  keepAwake: boolean;
  manualCounter: boolean;
  voice: RosaryVoiceId;
  nightMode: boolean;
  rememberChoice: boolean;
  crossfade: boolean;
}

/** Voz de la guía en el modo audio. */
export type RosaryVoiceId = "femenina1" | "femenina2" | "masculina1";

/** Alcance del rezo: rosario completo (20 misterios) o una sola decena. */
export type RosaryScope = "completo" | "decena";

/** Configuración transitoria del flujo de rezo (portada → modalidad → rezo). */
export interface RosaryFlow {
  group: MysteryGroupId | null;
  mode: RosaryModeId | null;
  scope: RosaryScope;
  startDecade: number;
  intention: RosaryIntention | null;
}

export interface RosaryJournalEntry {
  id: string;
  date: string;
  group: MysteryGroupId | null;
  text: string;
}

export interface RosaryDownloadItem {
  id: string;
  group: MysteryGroupId;
  label: string;
  sizeLabel: string;
  downloaded: boolean;
}

export type AudioSegmentKind =
  | "introduccion"
  | "senal_cruz"
  | "contricion"
  | "credo"
  | "lectura"
  | "meditacion"
  | "padrenuestro"
  | "avemaria"
  | "gloria"
  | "jaculatoria"
  | "salve"
  | "letanias"
  | "final";

export interface AudioSegment {
  id: string;
  kind: AudioSegmentKind;
  title: string;
  /** URL validada (https). null => audio no disponible. */
  url: string | null;
  durationSeconds: number | null;
  transcript?: string[];
}

export interface AudioManifest {
  group: MysteryGroupId;
  variant: "completo" | "participativo";
  available: boolean;
  totalBytes: number | null;
  segments: AudioSegment[];
}

export type DownloadState =
  | { status: "idle" }
  | { status: "unsupported"; reason: string }
  | { status: "downloading"; progress: number }
  | { status: "downloaded"; bytes: number }
  | { status: "error"; message: string };

export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; message: string; offline: boolean }
  | { status: "empty" }
  | { status: "ready"; data: T };