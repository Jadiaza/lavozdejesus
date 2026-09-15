import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bookmark, ChevronLeft, ChevronRight, RefreshCcw, Volume2, VolumeX } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { PrayerStepCard } from "../components/PrayerStepCard";
import { RosaryProgress } from "../components/RosaryProgress";
import { RosaryBeadRing } from "../components/RosaryBeadRing";
import { RosaryCompletion } from "../components/RosaryCompletion";
import { useRosarySession } from "../hooks/useRosarySession";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { useKeepAwake } from "../hooks/useKeepAwake";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import { rosaryTodayService } from "../services/rosaryTodayService";
import { rosaryAmbientAudioService } from "../services/rosaryAmbientAudioService";
import type { MysteryGroupId } from "../types";

const MYSTERY_GROUPS: MysteryGroupId[] = ["gozosos", "luminosos", "dolorosos", "gloriosos"];
const isGroup = (value: string | null): value is MysteryGroupId => Boolean(value) && MYSTERY_GROUPS.includes(value as MysteryGroupId);
const ORDINALS = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto"];
const GROUP_ADJECTIVES: Record<MysteryGroupId, string> = { gozosos: "gozoso", luminosos: "luminoso", dolorosos: "doloroso", gloriosos: "glorioso" };

export const RosarioDigital = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedGroup = params.get("grupo");
  const group: MysteryGroupId = isGroup(requestedGroup) ? requestedGroup : rosaryTodayService.groupForDate();
  const { prefs, update: updatePrefs } = useRosaryPreferences();
  const { flow } = useRosaryFlow();
  const session = useRosarySession({ group, mode: "digital", intention: flow.intention, haptics: prefs.haptics, decades: flow.scope === "decena" ? 1 : 5, startDecade: flow.startDecade });
  useKeepAwake(prefs.keepAwake && !session.completed);
  const mystery = useMemo(() => !session.section?.mysteryId ? null : mysteryGroups[group].mysteries.find((item) => item.id === session.section?.mysteryId) ?? null, [group, session.section]);
  const decade = useMemo(() => session.section?.type === "decade" ? Number(session.section.id.split("-")[1]) : null, [session.section]);
  const aveMariaBeads = useMemo(() => session.section?.beads.filter((bead) => bead.prayerKey === "avemaria") ?? [], [session.section]);
  const currentAveMariaIndex = useMemo(() => session.bead ? aveMariaBeads.findIndex((bead) => bead.id === session.bead?.id) : -1, [aveMariaBeads, session.bead]);
  const prayerProgressLabel = currentAveMariaIndex >= 0 ? `Ave María ${currentAveMariaIndex + 1} de ${aveMariaBeads.length}` : session.bead?.label ?? "Oración actual";
  const mysteryNumber = decade ?? mystery?.order ?? null;
  const isFinalPrayers = !mystery && (session.section?.title?.toLowerCase().includes("final") || session.bead?.prayerKey === "salve");
  const mysteryHeading = mysteryNumber ? `${ORDINALS[mysteryNumber - 1] ?? "Primer"} misterio ${GROUP_ADJECTIVES[group]}` : isFinalPrayers ? "Oraciones finales" : session.section?.title ?? "Oraciones iniciales";
  const currentMysteryImage = mystery?.imageUrl ?? mysteryArt[group];
  const canGoBack = Boolean(session.session) && ((session.session?.sectionIndex ?? 0) > 0 || (session.session?.beadIndex ?? 0) > 0);
  const toggleAmbient = () => { const next = !prefs.backgroundMusic; updatePrefs({ backgroundMusic: next }); if (next) void rosaryAmbientAudioService.play(prefs.musicVolume); else rosaryAmbientAudioService.pause(); };

  return <RosaryLayout title="" focus fullScreen hideHeader>
    {session.completed ? <div className="h-full overflow-hidden px-3 py-2"><RosaryCompletion onRestart={session.restart} intentionLabel={flow.intention?.label ?? null} group={group} /></div> : !session.definition || !session.section || !session.bead ? <div className="flex h-full items-center justify-center"><RosaryLoading label="Preparando el Rosario" /></div> : <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#020a12]">
      <section className="relative h-[clamp(285px,39dvh,380px)] shrink-0 overflow-hidden">
        <img src={currentMysteryImage} alt={mystery?.title ?? mysteryGroups[group].name} className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,6,12,.08)_0%,rgba(0,6,12,.04)_38%,rgba(0,6,12,.22)_60%,rgba(0,7,13,.86)_91%,#020a12_100%)]" />
        <div className="absolute right-4 top-[max(.85rem,env(safe-area-inset-top))]"><button type="button" onClick={toggleAmbient} aria-label="Música ambiental" className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/75 bg-[#06111c]/72 text-gold-bright shadow-[0_5px_18px_rgba(0,0,0,.65)] backdrop-blur-md">{prefs.backgroundMusic ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}</button></div>
        <div className="absolute inset-x-5 bottom-6 [text-shadow:0_3px_12px_rgba(0,0,0,1),0_1px_4px_rgba(0,0,0,1)]">
          {mystery ? <><span className="inline-flex rounded-full border border-gold/80 bg-[#06111c]/72 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-gold-bright shadow-lg backdrop-blur-sm">{mysteryGroups[group].name}</span><h2 className="mt-2 max-w-[94%] font-display text-[clamp(1.75rem,7.4vw,2.35rem)] font-semibold leading-[1.03] text-white">{mystery.title}</h2>{mystery.scriptureText ? <p className="mt-2 line-clamp-2 max-w-[94%] font-display text-[clamp(.94rem,3.8vw,1.05rem)] italic leading-snug text-white">«{mystery.scriptureText}»</p> : null}<p className="mt-1 text-[0.82rem] text-white/90">{mystery.scriptureRef}</p></> : <h2 className="font-display text-[clamp(1.9rem,7.5vw,2.45rem)] font-semibold text-white">{isFinalPrayers ? "Oraciones finales" : "Oraciones iniciales"}</h2>}
        </div>
      </section>
      <div className="relative z-10 -mt-3 flex min-h-0 flex-1 flex-col gap-2 px-3 pb-1">
        <div className="shrink-0"><RosaryProgress progress={session.progress} mysteryNumber={mysteryNumber} mysteryTotal={flow.scope === "decena" ? 1 : 5} prayerLabel={prayerProgressLabel} sectionLabel={mysteryHeading} /></div>
        <div className="shrink-0 -my-1.5 scale-[0.93] origin-center"><RosaryBeadRing section={session.section} currentBeadId={session.bead.id} onSelect={session.jumpToBead} /></div>
        <div className="min-h-[125px] flex-1 overflow-hidden"><PrayerStepCard bead={session.bead} mystery={mystery} textSize="md" highContrast={prefs.highContrast} compact /></div>
        <div className="grid shrink-0 grid-cols-[48px_1fr] gap-2.5"><button type="button" onClick={session.prev} disabled={!canGoBack} className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/55 text-gold"><ChevronLeft className="h-6 w-6" /></button><button type="button" onClick={session.next} className="flex min-h-12 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#e5a92f] via-[#f7ca59] to-[#d99a28] font-display text-[1.05rem] font-bold uppercase tracking-[0.1em] text-[#11100b]">Continuar<ChevronRight className="h-5 w-5" /></button></div>
        <div className="grid shrink-0 grid-cols-2 gap-2.5"><button type="button" onClick={() => navigate("/rosario")} className="flex min-h-9 items-center justify-center gap-2 rounded-xl border border-gold/30 text-[0.76rem] text-gold"><Bookmark className="h-4 w-4" />Guardar</button><button type="button" onClick={() => navigate("/rosario/seleccionar-misterios")} className="flex min-h-9 items-center justify-center gap-2 rounded-xl border border-gold/30 text-[0.76rem] text-gold"><RefreshCcw className="h-4 w-4" />Cambiar misterio</button></div>
      </div>
    </div>}
  </RosaryLayout>;
};

export default RosarioDigital;