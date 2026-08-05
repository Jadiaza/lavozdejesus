import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { rosaryRepository } from "../services/rosaryRepository";
import { rosarySessionService } from "../services/rosarySessionService";
import { buildRosaryDefinition, totalBeads } from "../utils/buildRosary";
import type {
  MysteryGroupId,
  RosaryBead,
  RosaryDefinition,
  RosaryIntention,
  RosaryModeId,
  RosarySession,
} from "../types";

interface Options {
  group: MysteryGroupId;
  mode: RosaryModeId;
  intention?: RosaryIntention | null;
  haptics?: boolean;
  /** Número de decenas: 5 (rosario) o 1 (una sola decena). */
  decades?: number;
  /** Decena inicial cuando se reza una sola. */
  startDecade?: number;
}

const vibrate = (ms = 12) => {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(ms);
  } catch {
    /* dispositivo sin soporte */
  }
};

/**
 * Máquina de avance del Rosario: posición, progreso, persistencia y
 * reanudación. No conoce la UI ni el transporte de datos.
 */
export const useRosarySession = ({
  group,
  mode,
  intention = null,
  haptics = true,
  decades = 5,
  startDecade = 1,
}: Options) => {
  const [definition, setDefinition] = useState<RosaryDefinition | null>(null);
  const [session, setSession] = useState<RosarySession | null>(null);
  const [completed, setCompleted] = useState(false);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    let active = true;
    const load =
      decades === 5
        ? rosaryRepository.getDefinition(group)
        : Promise.resolve(buildRosaryDefinition({ group, groups: decades }));
    load.then((def) => {
      if (!active) return;
      setDefinition(def);
      const saved = rosarySessionService.load();
      if (saved && saved.definitionId === def.id && saved.mode === mode && saved.status !== "terminado") {
        setSession(saved);
      } else {
        setSession(rosarySessionService.create(group, mode, def.id, intention));
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, mode, decades, startDecade]);

  const persist = useCallback((next: RosarySession) => {
    const withTime: RosarySession = {
      ...next,
      elapsedSeconds: Math.round((Date.now() - startRef.current) / 1000) + next.elapsedSeconds,
    };
    startRef.current = Date.now();
    rosarySessionService.save(withTime);
    return withTime;
  }, []);

  const section = definition && session ? definition.sections[session.sectionIndex] : null;
  const bead: RosaryBead | null = section && session ? section.beads[session.beadIndex] ?? null : null;

  const totals = useMemo(() => {
    if (!definition) return { total: 0, index: 0 };
    const total = totalBeads(definition);
    const index = bead ? bead.order : 0;
    return { total, index };
  }, [definition, bead]);

  const progress = totals.total ? Math.round((totals.index / (totals.total - 1)) * 100) : 0;

  const goTo = useCallback(
    (sectionIndex: number, beadIndex: number) => {
      setSession((prev) => (prev ? persist({ ...prev, sectionIndex, beadIndex }) : prev));
    },
    [persist],
  );

  const next = useCallback(() => {
    if (!definition || !session) return;
    if (haptics) vibrate();
    const sec = definition.sections[session.sectionIndex];
    if (session.beadIndex + 1 < sec.beads.length) {
      goTo(session.sectionIndex, session.beadIndex + 1);
    } else if (session.sectionIndex + 1 < definition.sections.length) {
      goTo(session.sectionIndex + 1, 0);
    } else {
      rosarySessionService.registerCompletion();
      rosarySessionService.clear();
      setCompleted(true);
    }
  }, [definition, session, goTo, haptics]);

  const prev = useCallback(() => {
    if (!definition || !session) return;
    if (session.beadIndex > 0) {
      goTo(session.sectionIndex, session.beadIndex - 1);
    } else if (session.sectionIndex > 0) {
      const prevSection = definition.sections[session.sectionIndex - 1];
      goTo(session.sectionIndex - 1, prevSection.beads.length - 1);
    }
  }, [definition, session, goTo]);

  const jumpToSection = useCallback(
    (sectionIndex: number) => goTo(sectionIndex, 0),
    [goTo],
  );

  const restart = useCallback(() => {
    if (!definition) return;
    rosarySessionService.clear();
    setCompleted(false);
    setSession(rosarySessionService.create(group, mode, definition.id, intention));
  }, [definition, group, mode, intention]);

  const setIntention = useCallback(
    (value: RosaryIntention | null) => {
      setSession((prev) => (prev ? persist({ ...prev, intention: value }) : prev));
    },
    [persist],
  );

  return {
    definition,
    session,
    section,
    bead,
    progress,
    completed,
    next,
    prev,
    jumpToSection,
    restart,
    setIntention,
  };
};