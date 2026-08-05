import type {
  MysteryGroupId,
  RosaryIntention,
  RosaryModeId,
  RosaryPreferences,
  RosarySession,
} from "../types";

const SESSION_KEY = "lvj.rosary.session.v1";
const PREFS_KEY = "lvj.rosary.prefs.v1";
const STATS_KEY = "lvj.rosary.stats.v1";

export const defaultPreferences: RosaryPreferences = {
  lastMode: null,
  textSize: "md",
  highContrast: false,
  haptics: true,
  backgroundMusic: false,
  autoAdvance: false,
  voiceVolume: 1,
  musicVolume: 0.35,
  speed: 1,
  keepAwake: true,
  manualCounter: true,
  voice: "femenina1",
  nightMode: true,
  rememberChoice: true,
  crossfade: true,
};

export interface RosaryStats {
  completed: number;
  lastCompletedAt: string | null;
  streak: number;
}

const safeRead = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...(JSON.parse(raw) as T) } as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible: la sesión sigue en memoria */
  }
};

/**
 * Persistencia local de la sesión y preferencias. Las intenciones con texto
 * libre solo se guardan si el usuario dio permiso explícito (allowStore).
 */
export const rosarySessionService = {
  load(): RosarySession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as RosarySession;
      return s?.definitionId ? s : null;
    } catch {
      return null;
    }
  },

  save(session: RosarySession) {
    const intention = session.intention;
    const sanitized: RosarySession = {
      ...session,
      intention:
        intention && !intention.allowStore
          ? { ...intention, text: undefined }
          : intention,
      updatedAt: new Date().toISOString(),
    };
    safeWrite(SESSION_KEY, sanitized);
  },

  clear() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* noop */
    }
  },

  create(
    group: MysteryGroupId,
    mode: RosaryModeId,
    definitionId: string,
    intention: RosaryIntention | null,
  ): RosarySession {
    const now = new Date().toISOString();
    return {
      definitionId,
      group,
      mode,
      sectionIndex: 0,
      beadIndex: 0,
      audioSegmentIndex: 0,
      audioPositionSeconds: 0,
      intention,
      startedAt: now,
      updatedAt: now,
      status: "iniciado",
      elapsedSeconds: 0,
    };
  },

  preferences(): RosaryPreferences {
    return safeRead<RosaryPreferences>(PREFS_KEY, defaultPreferences);
  },

  savePreferences(prefs: RosaryPreferences) {
    safeWrite(PREFS_KEY, prefs);
  },

  stats(): RosaryStats {
    return safeRead<RosaryStats>(STATS_KEY, {
      completed: 0,
      lastCompletedAt: null,
      streak: 0,
    });
  },

  registerCompletion(): RosaryStats {
    const prev = this.stats();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = prev.lastCompletedAt ? new Date(prev.lastCompletedAt) : null;
    if (last) last.setHours(0, 0, 0, 0);
    const dayMs = 86400000;
    const diff = last ? Math.round((today.getTime() - last.getTime()) / dayMs) : null;
    const next: RosaryStats = {
      completed: prev.completed + 1,
      lastCompletedAt: new Date().toISOString(),
      streak: diff === 0 ? prev.streak : diff === 1 ? prev.streak + 1 : 1,
    };
    safeWrite(STATS_KEY, next);
    return next;
  },
};