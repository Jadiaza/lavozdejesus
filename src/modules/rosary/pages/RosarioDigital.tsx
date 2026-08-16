import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Bookmark,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  HandHeart,
  RefreshCcw,
  Settings,
  Volume2,
} from "lucide-react";

import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { PrayerStepCard } from "../components/PrayerStepCard";
import { RosaryProgress } from "../components/RosaryProgress";
import { RosaryBeadRing } from "../components/RosaryBeadRing";
import {
  RosaryFullRing,
} from "../components/RosaryFullRing";
import { RosaryPrayerScene } from "../components/RosaryPrayerScene";
import { RosaryCompletion } from "../components/RosaryCompletion";
import { RosarySettingsSheet } from "../components/RosarySettingsSheet";

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

const isGroup = (
  value: string | null,
): value is MysteryGroupId =>
  Boolean(value) &&
  MYSTERY_GROUPS.includes(
    value as MysteryGroupId,
  );

const ORDINALS = [
  "Primer",
  "Segundo",
  "Tercer",
  "Cuarto",
  "Quinto",
];

const GROUP_ADJECTIVES: Record<
  MysteryGroupId,
  string
> = {
  gozosos: "gozoso",
  luminosos: "luminoso",
  dolorosos: "doloroso",
  gloriosos: "glorioso",
};

/**
 * Rosario interactivo con cuentas digitales.
 */
export const RosarioDigital = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requestedGroup = params.get("grupo");

  const group: MysteryGroupId = isGroup(
    requestedGroup,
  )
    ? requestedGroup
    : rosaryTodayService.groupForDate();

  const { prefs, update } =
    useRosaryPreferences();

  const { flow } = useRosaryFlow();

  const [showSettings, setShowSettings] =
    useState(false);

  const [fullRing, setFullRing] =
    useState(false);

  const session = useRosarySession({
    group,
    mode: "digital",
    intention: flow.intention,
    haptics: prefs.haptics,
    decades:
      flow.scope === "decena" ? 1 : 5,
    startDecade: flow.startDecade,
  });

  useKeepAwake(
    prefs.keepAwake && !session.completed,
  );

  const mystery = useMemo(() => {
    if (!session.section?.mysteryId) {
      return null;
    }

    return (
      mysteryGroups[group].mysteries.find(
        (item) =>
          item.id ===
          session.section?.mysteryId,
      ) ?? null
    );
  }, [group, session.section]);

  const decade = useMemo(() => {
    if (
      session.section?.type !== "decade"
    ) {
      return null;
    }

    const sectionParts =
      session.section.id.split("-");

    const parsed = Number(sectionParts[1]);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }, [session.section]);

  const aveMariaBeads = useMemo(() => {
    if (!session.section) {
      return [];
    }

    return session.section.beads.filter(
      (bead) =>
        bead.prayerKey === "avemaria",
    );
  }, [session.section]);

  const currentAveMariaIndex =
    useMemo(() => {
      if (!session.bead) {
        return -1;
      }

      return aveMariaBeads.findIndex(
        (bead) =>
          bead.id === session.bead?.id,
      );
    }, [aveMariaBeads, session.bead]);

  const prayerProgressLabel =
    currentAveMariaIndex >= 0
      ? `Avemaría ${
          currentAveMariaIndex + 1
        } de ${aveMariaBeads.length}`
      : session.bead?.label ??
        "Oración actual";

  const mysteryNumber =
    decade ?? mystery?.order ?? null;

  const mysteryHeading = mysteryNumber
    ? `${
        ORDINALS[mysteryNumber - 1] ??
        "Primer"
      } misterio ${GROUP_ADJECTIVES[group]}`
    : session.section?.title ??
      "Oraciones del Rosario";

  const canGoBack =
    Boolean(session.session) &&
    ((session.session?.sectionIndex ?? 0) >
      0 ||
      (session.session?.beadIndex ?? 0) >
        0);

  const saveAndExit = () => {
    navigate("/rosario");
  };

  const changeMystery = () => {
    navigate(
      "/rosario/seleccionar-misterios",
    );
  };

  return (
    <RosaryLayout
      title="Rosario interactivo"
      subtitle={
        prefs.backgroundMusic
          ? "Modo interactivo · Audio activado"
          : "Modo interactivo"
      }
      focus
      actions={
        <>
          <button
            type="button"
            onClick={() =>
              setFullRing(
                (current) => !current,
              )
            }
            aria-pressed={fullRing}
            aria-label="Ver el Rosario completo"
            className="
              flex h-11 w-11 items-center
              justify-center rounded-full
              border border-gold/35
              bg-navy-deep text-gold
              transition hover:bg-gold/10
            "
          >
            <CircleDot
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              setShowSettings(
                (current) => !current,
              )
            }
            aria-expanded={showSettings}
            aria-label="Ajustes del Rosario"
            className="
              flex h-11 w-11 items-center
              justify-center rounded-full
              border border-gold/35
              bg-navy-deep text-gold
              transition hover:bg-gold/10
            "
          >
            <Settings
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </>
      }
    >
      {showSettings ? (
        <div className="mb-4">
          <RosarySettingsSheet
            prefs={prefs}
            update={update}
            onClose={() =>
              setShowSettings(false)
            }
          />
        </div>
      ) : null}

      {session.completed ? (
        <RosaryCompletion
          onRestart={session.restart}
          intentionLabel={
            flow.intention?.label ?? null
          }
          group={group}
        />
      ) : !session.definition ||
        !session.section ||
        !session.bead ? (
        <RosaryLoading label="Preparando el Rosario" />
      ) : (
        <div className="space-y-4">
          {/* Indicador del modo */}
          <div
            className="
              mx-auto flex min-h-10 w-fit
              items-center justify-center gap-2
              rounded-full border border-gold/25
              bg-navy/70 px-4
              text-xs text-gold
            "
          >
            <Volume2
              className="h-4 w-4"
              aria-hidden="true"
            />

            Modo interactivo
          </div>

          {fullRing ? (
            <div className="fixed inset-0 z-[65] overflow-y-auto bg-[#020c16] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[#fff7e8] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_32%,rgba(22,72,105,0.22),transparent_48%)]">
              <div className="relative mx-auto w-full max-w-md">
                <header className="grid grid-cols-[3rem_1fr_3rem] items-start">
                  <button type="button" onClick={() => setFullRing(false)} className="flex h-12 w-12 items-center justify-center text-[#f5c65a]" aria-label="Volver a la oración">
                    <ArrowLeft className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <div className="pt-1 text-center">
                    <h2 className="font-display text-[1.8rem] leading-none">Rosario completo</h2>
                    <p className="mt-2 font-display text-xl text-[#f5c65a]">{mysteryGroups[group].name}</p>
                  </div>
                  <button type="button" onClick={() => { setFullRing(false); setShowSettings(true); }} className="flex h-12 w-12 items-center justify-center text-[#f5c65a]" aria-label="Ajustes del Rosario">
                    <Settings className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </header>

                <div className="mx-auto mt-5 flex min-h-12 w-fit items-center gap-3 rounded-full border border-[#c9892e] px-6 font-display text-lg text-[#f5c65a]">
                  <Eye className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                  Vista general del Rosario
                </div>

                <div className="mt-6">
              <RosaryFullRing
                definition={
                  session.definition
                }
                currentOrder={
                  session.bead.order
                }
                centerImage={mysteryArt[group]}
                onSelectOrder={session.jumpToOrder}
              />
                </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl border border-[#9f6928] bg-[#071522]/90 px-4 py-4 shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#9f6928]">
                    <CircleDot className="h-7 w-7 text-[#f5c65a]" aria-hidden="true" />
                  </span>
                  <span className="min-w-0"><strong className="block truncate font-display text-lg">{mysteryNumber ? `Misterio ${mysteryNumber} de 5` : "Oraciones iniciales"}</strong><span className="block truncate text-xs text-[#c9bca8]">{mysteryGroups[group].name}</span></span>
                </div>
                <span className="mx-3 h-12 w-px bg-[#9f6928]/55" aria-hidden="true" />
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-5 w-5 shrink-0 rounded-full border border-[#f5c65a] bg-[#f5c65a] shadow-[0_0_14px_rgba(245,198,90,0.65)]" />
                  <span className="min-w-0"><strong className="block truncate font-display text-lg">{prayerProgressLabel}</strong><span className="block truncate text-xs text-[#c9bca8]">Cuenta actual resaltada</span></span>
                </div>
              </div>

              <button type="button" onClick={() => setFullRing(false)} className="mt-6 flex min-h-16 w-full items-center justify-center gap-4 rounded-full border border-[#ffe18a] bg-gradient-to-r from-[#f1bd46] via-[#ffd96c] to-[#d99a28] px-6 font-display text-xl font-semibold uppercase tracking-[0.06em] text-[#11100b] shadow-[0_0_30px_rgba(231,174,55,0.32)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4a310c] text-[#ffe186]"><HandHeart className="h-6 w-6" aria-hidden="true" /></span>
                Volver a la oración
              </button>
              <button type="button" onClick={changeMystery} className="mx-auto mt-4 flex min-h-12 items-center justify-center gap-3 px-5 font-display text-lg text-[#f5c65a]">
                <RefreshCcw className="h-5 w-5" aria-hidden="true" />
                Cambiar de misterio
              </button>
              </div>
            </div>
          ) : (
            <>
              <RosaryPrayerScene
                title={mysteryHeading}
                subtitle={mystery?.title}
                image={mysteryArt[group]}
                mystery={mystery}
              />

              <RosaryProgress
                progress={session.progress}
                mysteryNumber={
                  mysteryNumber
                }
                mysteryTotal={
                  flow.scope === "decena"
                    ? 1
                    : 5
                }
                prayerLabel={
                  prayerProgressLabel
                }
                sectionLabel={
                  session.section.title
                }
              />

              <RosaryBeadRing
                section={session.section}
                currentBeadId={
                  session.bead.id
                }
                onSelect={session.jumpToBead}
              />
            </>
          )}

          <PrayerStepCard
            bead={session.bead}
            mystery={mystery}
            textSize={prefs.textSize}
            highContrast={
              prefs.highContrast
            }
          />

          {/* Controles de avance */}
          <div className="grid grid-cols-[72px_1fr_72px] items-center gap-3">
            <button
              type="button"
              onClick={session.prev}
              disabled={!canGoBack}
              aria-label="Oración anterior"
              className="
                flex h-16 w-16 items-center
                justify-center rounded-full
                border border-gold/70
                text-gold transition
                hover:bg-gold/10
                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >
              <ChevronLeft
                className="h-7 w-7"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={session.next}
              className="
                flex min-h-14 items-center
                justify-center gap-2
                rounded-full bg-gradient-gold
                px-5 font-semibold
                text-navy-deep shadow-gold
                transition hover:brightness-105
                active:scale-[0.99]
              "
            >
              Siguiente

              <ChevronRight
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={session.next}
              aria-label="Siguiente oración"
              className="
                flex h-16 w-16 items-center
                justify-center rounded-full
                border border-gold/70
                text-gold transition
                hover:bg-gold/10
              "
            >
              <ChevronRight
                className="h-7 w-7"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Acciones inferiores */}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={saveAndExit}
              className="
                flex min-h-12 items-center
                justify-center gap-2
                rounded-xl border
                border-gold/35
                bg-navy/70 px-4
                text-sm text-gold
                transition hover:bg-gold/5
              "
            >
              <Bookmark
                className="h-5 w-5"
                aria-hidden="true"
              />

              Guardar y continuar después
            </button>

            <button
              type="button"
              onClick={changeMystery}
              className="
                flex min-h-12 items-center
                justify-center gap-2
                rounded-xl border
                border-gold/35
                bg-navy/70 px-4
                text-sm text-gold
                transition hover:bg-gold/5
              "
            >
              <RefreshCcw
                className="h-5 w-5"
                aria-hidden="true"
              />

              Cambiar de misterio
            </button>
          </div>

          <Link
            to="/rosario"
            className="
              mx-auto flex min-h-10 w-fit
              items-center justify-center
              px-4 text-xs
              text-muted-foreground
            "
          >
            Volver a la portada
          </Link>
        </div>
      )}
    </RosaryLayout>
  );
};

export default RosarioDigital;
