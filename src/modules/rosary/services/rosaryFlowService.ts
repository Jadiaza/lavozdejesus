import type { MysteryGroupId, RosaryFlow, RosaryJournalEntry } from "../types";

const FLOW_KEY = "lvj.rosary.flow.v1";
const JOURNAL_KEY = "lvj.rosary.journal.v1";

export const defaultFlow: RosaryFlow = {
  group: null,
  mode: null,
  scope: "completo",
  startDecade: 1,
  intention: null,
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
};

/**
 * Estado del flujo de rezo (misterios elegidos, modalidad, intención) y del
 * diario espiritual. Todo es local al dispositivo: nada se envía a un servidor.
 */
export const rosaryFlowService = {
  load(): RosaryFlow {
    return { ...defaultFlow, ...read<Partial<RosaryFlow>>(FLOW_KEY, {}) };
  },
  save(flow: RosaryFlow) {
    const intention = flow.intention;
    write(FLOW_KEY, {
      ...flow,
      intention: intention && !intention.allowStore ? { ...intention, text: undefined } : intention,
    });
  },
  patch(patch: Partial<RosaryFlow>): RosaryFlow {
    const next = { ...this.load(), ...patch };
    this.save(next);
    return next;
  },
  reset() {
    write(FLOW_KEY, defaultFlow);
  },

  journal(): RosaryJournalEntry[] {
    return read<RosaryJournalEntry[]>(JOURNAL_KEY, []);
  },
  addJournalEntry(text: string, group: MysteryGroupId | null): RosaryJournalEntry[] {
    const clean = text.trim().slice(0, 1000);
    if (!clean) return this.journal();
    const entry: RosaryJournalEntry = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      group,
      text: clean,
    };
    const next = [entry, ...this.journal()].slice(0, 200);
    write(JOURNAL_KEY, next);
    return next;
  },
  removeJournalEntry(id: string): RosaryJournalEntry[] {
    const next = this.journal().filter((e) => e.id !== id);
    write(JOURNAL_KEY, next);
    return next;
  },
};