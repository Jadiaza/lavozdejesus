import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bookmark, ChevronLeft, ChevronRight, CircleDot, Eye, HandHeart, RefreshCcw } from "lucide-react";

import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { PrayerStepCard } from "../components/PrayerStepCard";
import { RosaryProgress } from "../components/RosaryProgress";
import { RosaryBeadRing } from "../components/RosaryBeadRing";
import { RosaryFullRing } from "../components/RosaryFullRing";
import { RosaryCompletion } from "../components/RosaryCompletion";
import { useRosarySession } from "../hooks/useRosarySession";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { useKeepAwake } from "../hooks/useKeepAwake";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import { rosaryTodayService } from "../services/rosaryTodayService";
import type { MysteryGroupId } from "../types";

const MYSTERY_GROUPS: MysteryGroupId[] = ["gozosos", "luminosos", "dolorosos", "gloriosos"];
const isGroup = (value: string | null): value is MysteryGroupId => Boolean(value) && MYSTERY_GROUPS.includes(value as MysteryGroupId);
const ORDINALS = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto"];
const GROUP_ADJECTIVES: Record<MysteryGroupId, string> = { gozosos: "gozoso", luminosos: "luminoso", dolorosos: "doloroso", gloriosos: "glorioso" };

/** Rosario interactivo con cuentas digitales. */
export const RosarioDigital = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedGroup = params.get("grupo");
  const group: MysteryGroupId = isGroup(requestedGroup) ? requestedGroup : rosaryTodayService.groupForDate();
  const { prefs } = useRosaryPreferences();
  const { flow } = useRosaryFlow();
  const [fullRing, setFullRing] = useState(false);
  const session = useRosarySession({ group, mode: "digital", intention: flow.intention, haptics: prefs.haptics, decades: flow.scope === "decena" ? 1 : 5, startDecade: flow.startDecade });
  useKeepAwake(prefs.keepAwake && !session.completed);

  const mystery = useMemo(() => {
    if (!session.section?.mysteryId) return null;
    return mysteryGroups[group].mysteries.find((item) => item.id === session.section?.mysteryId) ?? null;
  }, [group, session.section]);
  const decade = useMemo(() => {
    if (session.section?.type !== "decade") return null;
    const parsed = Number(session.section.id.split("-")[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }, [session.section]);
  const aveMariaBeads = useMemo(() => session.section?.beads.filter((bead) => bead.prayerKey === "avemaria") ?? [], [session.section]);
  const currentAveMariaIndex = useMemo(() => session.bead ? aveMariaBeads.findIndex((bead) => bead.id === session.bead?.id) : -1, [aveMariaBeads, session.bead]);
  const prayerProgressLabel = currentAveMariaIndex >= 0 ? `Avemaría ${currentAveMariaIndex + 1} de ${aveMariaBeads.length}` : session.bead?.label ?? "Oración actual";
  const mysteryNumber = decade ?? mystery?.order ?? null;
  const mysteryHeading = mysteryNumber ? `${ORDINALS[mysteryNumber - 1] ?? "Primer"} misterio ${GROUP_ADJECTIVES[group]}` : session.section?.title ?? "Oraciones del Rosario";
  const canGoBack = Boolean(session.session) && ((session.session?.sectionIndex ?? 0) > 0 || (session.session?.beadIndex ?? 0) > 0);
  const saveAndExit = () => navigate("/rosario");
  const changeMystery = () => navigate("/rosario/seleccionar-misterios");

  return (
    <RosaryLayout title="Interactivo" focus fullScreen compactHeader actions={
      <button type="button" onClick={() => setFullRing((current) => !current)} aria-pressed={fullRing} aria-label="Ver el Rosario completo" className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/35 bg-navy-deep text-gold transition hover:bg-gold/10">
        <CircleDot className="h-5 w-5" aria-hidden="true" />
      </button>
    }>
      {session.completed ? (
        <div className="h-full overflow-hidden px-3 py-2"><RosaryCompletion onRestart={session.restart} intentionLabel={flow.intention?.label ?? null} group={group} /></div>
      ) : !session.definition || !session.section || !session.bead ? (
        <div className="flex h-full items-center justify-center"><RosaryLoading label="Preparando el Rosario" /></div>
      ) : fullRing ? (
        <div className="fixed inset-0 z-[65] flex h-dvh flex-col overflow-hidden bg-[#020c16] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] text-[#fff7e8]">
          <div className="mx-auto flex h-full w-full max-w-md flex-col">
            <header className="shrink-0 text-center"><h2 className="font-display text-[1.45rem] leading-none">Rosario completo</h2><p className="mt-1 font-display text-base text-[#f5c65a]">{mysteryGroups[group].name}</p></header>
            <div className="mx-auto mt-2 flex min-h-9 w-fit shrink-0 items-center gap-2 rounded-full border border-[#c9892e] px-4 font-display text-sm text-[#f5c65a]"><Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />Vista general</div>
            <div className="min-h-0 flex-1 py-2"><RosaryFullRing definition={session.definition} currentOrder={session.bead.order} centerImage={mysteryArt[group]} onSelectOrder={session.jumpToOrder} /></div>
            <button type="button" onClick={() => setFullRing(false)} className="flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full border border-[#ffe18a] bg-gradient-to-r from-[#f1bd46] via-[#ffd96c] to-[#d99a28] px-5 font-display text-base font-semibold uppercase tracking-[0.06em] text-[#11100b]"><HandHeart className="h-5 w-5" aria-hidden="true" />Volver a la oración</button>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col gap-[clamp(0.3rem,0.75dvh,0.45rem)] overflow-hidden px-3 pb-1 pt-1">
          <section className="shrink-0 overflow-hidden rounded-[1.2rem] border border-gold/20 bg-[#06131f] shadow-[0_14px_34px_rgba(0,0,0,0.2)]">
            <div className="h-[clamp(125px,17.5dvh,172px)] w-full overflow-hidden"><img src={mysteryArt[group]} alt={mystery?.title ?? mysteryGroups[group].name} className="h-full w-full object-cover object-center" /></div>
            <div className="border-t border-gold/10 bg-[#020c16] px-4 py-[clamp(0.48rem,0.9dvh,0.68rem)] text-center">
              <h2 className="font-display text-[clamp(1.35rem,5.9vw,1.9rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-foreground">{mysteryHeading}</h2>
              {mystery?.title ? <p className="mt-1 line-clamp-1 font-display text-[clamp(0.84rem,3.2vw,1rem)] italic leading-tight text-gold-bright">{mystery.title}</p> : null}
            </div>
          </section>

          <div className="shrink-0"><RosaryProgress progress={session.progress} mysteryNumber={mysteryNumber} mysteryTotal={flow.scope === "decena" ? 1 : 5} prayerLabel={prayerProgressLabel} sectionLabel={session.section.title} /></div>
          <div className="shrink-0 -my-1 scale-[0.94] origin-center"><RosaryBeadRing section={session.section} currentBeadId={session.bead.id} onSelect={session.jumpToBead} /></div>
          <div className="min-h-[120px] flex-1 overflow-hidden"><PrayerStepCard bead={session.bead} mystery={mystery} textSize={prefs.textSize} highContrast={prefs.highContrast} compact /></div>

          <div className="grid shrink-0 grid-cols-[46px_1fr] items-center gap-2.5">
            <button type="button" onClick={session.prev} disabled={!canGoBack} aria-label="Oración anterior" className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-gold/45 bg-navy/60 text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-25"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={session.next} className="flex min-h-[48px] items-center justify-center gap-2.5 rounded-full border border-[#ffe18a]/70 bg-gradient-to-r from-[#e5a92f] via-[#f7ca59] to-[#d99a28] px-5 font-display text-[1rem] font-bold uppercase tracking-[0.12em] text-[#11100b] shadow-[0_8px_22px_rgba(216,155,38,0.22)] transition hover:brightness-105 active:scale-[0.99]">Continuar<ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2.5">
            <button type="button" onClick={saveAndExit} className="flex min-h-9 items-center justify-center gap-2 rounded-xl border border-gold/25 bg-navy/55 px-2 text-[10px] text-gold/90"><Bookmark className="h-4 w-4" aria-hidden="true" />Guardar</button>
            <button type="button" onClick={changeMystery} className="flex min-h-9 items-center justify-center gap-2 rounded-xl border border-gold/25 bg-navy/55 px-2 text-[10px] text-gold/90"><RefreshCcw className="h-4 w-4" aria-hidden="true" />Cambiar misterio</button>
          </div>
        </div>
      )}
    </RosaryLayout>
  );
};

export default RosarioDigital;
