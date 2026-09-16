import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { rosaryRepository } from "../services/rosaryRepository";
import { rosarySessionService } from "../services/rosarySessionService";
import { buildRosaryDefinition, totalBeads } from "../utils/buildRosary";

import type { MysteryGroupId, RosaryBead, RosaryDefinition, RosaryIntention, RosaryModeId, RosarySession, RosarySessionStatus } from "../types";

interface Options {
  group: MysteryGroupId;
  mode: RosaryModeId;
  intention?: RosaryIntention | null;
  haptics?: boolean;
  decades?: number;
  startDecade?: number;
}

const vibrate = (ms = 12) => {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(ms);
  } catch {
    // Dispositivo sin soporte.
  }
};

/**
 * Máquina de avance del Santo Rosario.
 * El avance vive en memoria durante la visita. Solo se conserva para una
 * entrada posterior cuando el usuario pulsa expresamente Guardar.
 */
export const useRosarySession = ({ group, mode, intention = null, haptics = true, decades = 5, startDecade = 1 }: Options) => {
  const [definition, setDefinition] = useState<RosaryDefinition | null>(null);
  const [session, setSession] = useState<RosarySession | null>(null);
  const [completed, setCompleted] = useState(false);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    let active = true;
    startRef.current = Date.now();

    const load = decades === 5
      ? rosaryRepository.getDefinition(group)
      : Promise.resolve(buildRosaryDefinition({ group, groups: decades }));

    load.then((definitionResult) => {
      if (!active) return;
      setDefinition(definitionResult);

      const saved = rosarySessionService.load();
      if (saved && saved.definitionId === definitionResult.id && saved.group === group && saved.mode === mode && saved.status !== "terminado") {
        setSession(saved);
      } else {
        // Si cambió el misterio del día (por ejemplo a medianoche), un progreso
        // guardado de otro grupo no debe imponerse sobre el misterio actualizado.
        if (saved && saved.group !== group) rosarySessionService.clear();
        setSession(rosarySessionService.create(group, mode, definitionResult.id, intention));
      }
    });

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group, mode, decades, startDecade]);

  const withElapsedTime = useCallback((next: RosarySession): RosarySession => {
    const elapsedSinceLastMark = Math.round((Date.now() - startRef.current) / 1000);
    startRef.current = Date.now();
    return { ...next, elapsedSeconds: next.elapsedSeconds + elapsedSinceLastMark };
  }, []);

  const updateInMemory = useCallback((next: RosarySession) => withElapsedTime(next), [withElapsedTime]);

  const saveProgress = useCallback(() => {
    if (!session) return false;
    const saved = withElapsedTime(session);
    rosarySessionService.save(saved);
    setSession(saved);
    return true;
  }, [session, withElapsedTime]);

  const section = definition && session ? definition.sections[session.sectionIndex] ?? null : null;
  const bead: RosaryBead | null = section && session ? section.beads[session.beadIndex] ?? null : null;

  const totals = useMemo(() => {
    if (!definition) return { total: 0, index: 0 };
    return { total: totalBeads(definition), index: bead?.order ?? 0 };
  }, [definition, bead]);

  const progress = totals.total > 1 ? Math.round((totals.index / (totals.total - 1)) * 100) : 0;

  const goTo = useCallback((sectionIndex: number, beadIndex: number) => {
    setSession((previous) => previous ? updateInMemory({ ...previous, sectionIndex, beadIndex, status: "iniciado" }) : previous);
  }, [updateInMemory]);

  const jumpToBead = useCallback((beadIndex: number) => {
    if (!section || !session) return;
    const safeIndex = Math.max(0, Math.min(beadIndex, section.beads.length - 1));
    goTo(session.sectionIndex, safeIndex);
  }, [goTo, section, session]);

  const jumpToOrder = useCallback((order: number) => {
    if (!definition) return;
    for (let sectionIndex = 0; sectionIndex < definition.sections.length; sectionIndex += 1) {
      const beadIndex = definition.sections[sectionIndex].beads.findIndex((item) => item.order === order);
      if (beadIndex >= 0) { goTo(sectionIndex, beadIndex); return; }
    }
  }, [definition, goTo]);

  const next = useCallback(() => {
    if (!definition || !session) return;
    if (haptics) vibrate();
    const currentSection = definition.sections[session.sectionIndex];
    if (session.beadIndex + 1 < currentSection.beads.length) { goTo(session.sectionIndex, session.beadIndex + 1); return; }
    if (session.sectionIndex + 1 < definition.sections.length) { goTo(session.sectionIndex + 1, 0); return; }
    rosarySessionService.registerCompletion();
    rosarySessionService.clear();
    setCompleted(true);
  }, [definition, session, goTo, haptics]);

  const prev = useCallback(() => {
    if (!definition || !session) return;
    if (session.beadIndex > 0) { goTo(session.sectionIndex, session.beadIndex - 1); return; }
    if (session.sectionIndex > 0) {
      const previousSection = definition.sections[session.sectionIndex - 1];
      goTo(session.sectionIndex - 1, previousSection.beads.length - 1);
    }
  }, [definition, session, goTo]);

  const jumpToSection = useCallback((sectionIndex: number) => goTo(sectionIndex, 0), [goTo]);

  const setStatus = useCallback((status: RosarySessionStatus) => {
    setSession((previous) => previous ? updateInMemory({ ...previous, status }) : previous);
  }, [updateInMemory]);

  const pause = useCallback(() => setStatus("pausado"), [setStatus]);
  const resume = useCallback(() => setStatus("iniciado"), [setStatus]);
  const togglePause = useCallback(() => {
    setSession((previous) => previous ? updateInMemory({ ...previous, status: previous.status === "pausado" ? "iniciado" : "pausado" }) : previous);
  }, [updateInMemory]);

  const restart = useCallback(() => {
    if (!definition) return;
    rosarySessionService.clear();
    setCompleted(false);
    startRef.current = Date.now();
    setSession(rosarySessionService.create(group, mode, definition.id, intention));
  }, [definition, group, mode, intention]);

  const setIntention = useCallback((value: RosaryIntention | null) => {
    setSession((previous) => previous ? updateInMemory({ ...previous, intention: value }) : previous);
  }, [updateInMemory]);

  return {
    definition, session, section, bead, progress, completed,
    paused: session?.status === "pausado",
    next, prev, pause, resume, togglePause, jumpToBead, jumpToOrder,
    jumpToSection, restart, setIntention, saveProgress,
  };
};
