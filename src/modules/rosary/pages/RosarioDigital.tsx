import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  HandHeart,
  RefreshCcw,
} from "lucide-react";

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

const MYSTERY_GROUPS: MysteryGroupId[] = [
  "gozosos",
  "luminosos",
  "dolorosos",
  "gloriosos",
];

const isGroup = (value: string | null): value is MysteryGroupId =>
  Boolean(value) && MYSTERY_GROUPS.includes(value as MysteryGroupId);

const ORDINALS = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto"];

const GROUP_ADJECTIVES: Record<MysteryGroupId, string> = {
  gozosos: "gozoso",
  luminosos: "luminoso",
  dolorosos: "doloroso",
  gloriosos: "glorioso",
};

/** Rosario interactivo con cuentas digitales. */
export const RosarioDigital = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requestedGroup = params.get("grupo");
  const group: MysteryGroupId = isGroup(requestedGroup)
    ? requestedGroup
    : rosaryTodayService.groupForDate();

  const { prefs } = useRosaryPreferences();
  const { flow } = useRosaryFlow();
  const [fullRing, setFullRing] = useState(false);

  const session = useRosarySession({
    group,
    mode: "digital",
    intention: flow.intention,
    haptics: prefs.haptics,
    decades: flow.scope === "decena" ? 1 : 5,
    startDecade: flow.startDecade,
  });

  useKeepAwake(prefs.keepAwake && !session.completed);

  const mystery = useMemo(() => {
    if (!session.section?.mysteryId) return null;

    return (
      mysteryGroups[group].mysteries.find(
        (item) => item.id === session.section?.mysteryId,
      ) ?? null
    );
  }, [group, session.section]);

  const decade = useMemo(() => {
    if (session.section?.type !== "decade") return null;

    const sectionParts = session.section.id.split("-");
    const parsed = Number(sectionParts[1]);
    return Number.isFinite(parsed) ? parsed : null;
  }, [session.section]);

  const aveMariaBeads = useMemo(() => {
    if (!session.section) return [];

    return session.section.beads.filter(
      (bead) => bead.prayerKey === "avemaria",
    );
  }, [session.section]);

  const currentAveMariaIndex = useMemo(() => {
    if (!session.bead) return -1;

    return aveMariaBeads.findIndex(
      (bead) => bead.id === session.bead?.id,
    );
  }, [aveMariaBeads, session.bead]);

  const prayerProgressLabel =
    currentAveMariaIndex >= 0
      ? `Avemaría ${currentAveMariaIndex + 1} de ${aveMariaBeads.length}`
      : session.bead?.label ?? "Oración actual";

  const mysteryNumber = decade ?? mystery?.order ?? null;

  const mysteryHeading = mysteryNumber
    ? `${ORDINALS[mysteryNumber - 1] ?? "Primer"} misterio ${GROUP_ADJECTIVES[group]}`
    : session.section?.title ?? "Oraciones del Rosario";

  const canGoBack =
    Boolean(session.session) &&
    ((session.session?.sectionIndex ?? 0) > 0 ||
      (session.session?.beadIndex ?? 0) > 0);

  const saveAndExit = () => navigate("/rosario");
  const changeMystery = () => navigate("/rosario/seleccionar-misterios");

  return (
    <RosaryLayout
      title="Interactivo"
      focus
      actions={
        <button
          type="button"
          onClick={() => setFullRing((current) => !current)}
          aria-pressed={fullRing}
          aria-label="Ver el Rosario completo"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 bg-navy-deep text-gold transition hover:bg-gold/10"
        >
          <CircleDot className="h-5 w-5" aria-hidden="true" />
        </button>
      }
    >
      {session.completed ? (
        <RosaryCompletion
          onRestart={session.restart}
          intentionLabel={flow.intention?.label ?? null}
          group={group}
        />
      ) : !session.definition || !session.section || !session.bead ? (
        <RosaryLoading label="Preparando el Rosario" />
      ) : (
        <div className="space-y-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {fullRing ? (
            <div className="fixed inset-0 z-[65] overflow-y-auto bg-[#020c16] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[#fff7e8] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_32%,rgba(22,72,105,0.22),transparent_48%)]">
              <div className="relative mx-auto w-full max-w-md">
                <header className="text-center">
                  <div className="pt-1">
                    <h2 className="font-display text-[1.8rem] leading-none">Rosario completo</h2>
                    <p className="mt-2 font-display text-xl text-[#f5c65a]">
                      {mysteryGroups[group].name}
                    </p>
                  </div>
                </header>

                <div className="mx-auto mt-5 flex min-h-12 w-fit items-center gap-3 rounded-full border border-[#c9892e] px-6 font-display text-lg text-[#f5c65a]">
                  <Eye className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                  Vista general del Rosario
                </div>

                <div className="mt-6">
                  <RosaryFullRing
                    definition={session.definition}
                    currentOrder={session.bead.order}
                    centerImage={mysteryArt[group]}
                    onSelectOrder={session.jumpToOrder}
                  />
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl border border-[#9f6928] bg-[#071522]/90 px-4 py-4 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#9f6928]">
                      <CircleDot className="h-7 w-7 text-[#f5c65a]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate font-display text-lg">
                        {mysteryNumber ? `Misterio ${mysteryNumber} de 5` : "Oraciones iniciales"}
                      </strong>
                      <span className="block truncate text-xs text-[#c9bca8]">
                        {mysteryGroups[group].name}
                      </span>
                    </span>
                  </div>

                  <span className="mx-3 h-12 w-px bg-[#9f6928]/55" aria-hidden="true" />

                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-5 w-5 shrink-0 rounded-full border border-[#f5c65a] bg-[#f5c65a] shadow-[0_0_14px_rgba(245,198,90,0.65)]" />
                    <span className="min-w-0">
                      <strong className="block truncate font-display text-lg">{prayerProgressLabel}</strong>
                      <span className="block truncate text-xs text-[#c9bca8]">Cuenta actual resaltada</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFullRing(false)}
                  className="mt-6 flex min-h-16 w-full items-center justify-center gap-4 rounded-full border border-[#ffe18a] bg-gradient-to-r from-[#f1bd46] via-[#ffd96c] to-[#d99a28] px-6 font-display text-xl font-semibold uppercase tracking-[0.06em] text-[#11100b] shadow-[0_0_30px_rgba(231,174,55,0.32)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a310c] text-[#ffe186]">
                    <HandHeart className="h-6 w-6" aria-hidden="true" />
                  </span>
                  Volver a la oración
                </button>

                <button
                  type="button"
                  onClick={changeMystery}
                  className="mx-auto mt-4 flex min-h-12 items-center justify-center gap-3 px-5 font-display text-lg text-[#f5c65a]"
                >
                  <RefreshCcw className="h-5 w-5" aria-hidden="true" />
                  Cambiar de misterio
                </button>
              </div>
            </div>
          ) : (
            <>
              <section className="-mx-4 -mt-4 overflow-hidden border-b border-gold/15 bg-navy-deep">
                <div className="h-[20rem] min-[390px]:h-[23rem] sm:h-[27rem]">
                  <img
                    src={mysteryArt[group]}
                    alt={mystery?.title ?? mysteryGroups[group].name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="border-t border-gold/10 bg-[#020c16] px-5 py-6 text-center">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold/75">
                    Santo Rosario
                  </p>
                  <h2 className="mt-2 font-display text-[clamp(2rem,8.5vw,3rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
                    {mysteryHeading}
                  </h2>
                  {mystery?.title ? (
                    <p className="mx-auto mt-2 max-w-[28rem] font-display text-[clamp(1rem,4vw,1.25rem)] italic leading-tight text-gold-bright">
                      {mystery.title}
                    </p>
                  ) : null}
                </div>
              </section>

              <div className="pt-1">
                <RosaryProgress
                  progress={session.progress}
                  mysteryNumber={mysteryNumber}
                  mysteryTotal={flow.scope === "decena" ? 1 : 5}
                  prayerLabel={prayerProgressLabel}
                  sectionLabel={session.section.title}
                />
              </div>

              <RosaryBeadRing
                section={session.section}
                currentBeadId={session.bead.id}
                onSelect={session.jumpToBead}
              />
            </>
          )}

          <PrayerStepCard
            bead={session.bead}
            mystery={mystery}
            textSize={prefs.textSize}
            highContrast={prefs.highContrast}
          />

          <div className="grid grid-cols-[52px_1fr] items-center gap-3 pt-1">
            <button
              type="button"
              onClick={session.prev}
              disabled={!canGoBack}
              aria-label="Oración anterior"
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-gold/45 bg-navy/60 text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={session.next}
              className="flex min-h-[56px] items-center justify-center gap-3 rounded-full border border-[#ffe18a]/70 bg-gradient-to-r from-[#e5a92f] via-[#f7ca59] to-[#d99a28] px-6 font-display text-[1.05rem] font-bold uppercase tracking-[0.12em] text-[#11100b] shadow-[0_10px_30px_rgba(216,155,38,0.25)] transition hover:brightness-105 active:scale-[0.99]"
            >
              Continuar
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={saveAndExit}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gold/30 bg-navy/65 px-4 text-sm text-gold transition hover:bg-gold/5"
            >
              <Bookmark className="h-5 w-5" aria-hidden="true" />
              Guardar y continuar después
            </button>

            <button
              type="button"
              onClick={changeMystery}
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gold/30 bg-navy/65 px-4 text-sm text-gold transition hover:bg-gold/5"
            >
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
              Cambiar de misterio
            </button>
          </div>

          <Link
            to="/rosario"
            className="mx-auto flex min-h-10 w-fit items-center justify-center px-4 text-xs text-muted-foreground"
          >
            Volver a la portada
          </Link>
        </div>
      )}
    </RosaryLayout>
  );
};

export default RosarioDigital;
