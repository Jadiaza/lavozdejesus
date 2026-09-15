import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt, mysteryDays } from "../mocks/mysteryArt";
import { rosaryTodayService } from "../services/rosaryTodayService";
import { rosaryAmbientAudioService } from "../services/rosaryAmbientAudioService";
import type { MysteryGroupId } from "../types";

const GROUPS: MysteryGroupId[] = ["gozosos", "luminosos", "dolorosos", "gloriosos"];
const isGroup = (value: string | null): value is MysteryGroupId =>
  Boolean(value) && GROUPS.includes(value as MysteryGroupId);

/** Modo manual: acompaña a quien ya tiene su rosario físico, sin pasos interactivos. */
export const RosarioFisico = () => {
  const [params, setParams] = useSearchParams();
  const todayGroup = rosaryTodayService.groupForDate();
  const requested = params.get("grupo");
  const group: MysteryGroupId = isGroup(requested) ? requested : todayGroup;
  const [showGroups, setShowGroups] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const { prefs, update: updatePrefs } = useRosaryPreferences();
  const data = mysteryGroups[group];

  const toggleAmbient = () => {
    const next = !prefs.backgroundMusic;
    updatePrefs({ backgroundMusic: next });
    if (next) void rosaryAmbientAudioService.play(prefs.musicVolume);
    else rosaryAmbientAudioService.pause();
  };

  const chooseGroup = (nextGroup: MysteryGroupId) => {
    setParams({ grupo: nextGroup });
    setShowGroups(false);
    setExpanded(null);
  };

  return (
    <RosaryLayout title="Con mi Rosario" subtitle="Reza a tu ritmo" focus actions={
      <button type="button" onClick={toggleAmbient} aria-pressed={prefs.backgroundMusic} aria-label={prefs.backgroundMusic ? "Silenciar música de fondo" : "Activar música de fondo"} className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${prefs.backgroundMusic ? "border-gold/55 bg-gold/10 text-gold-bright" : "border-gold/25 bg-navy-deep text-foreground/55"}`}>
        {prefs.backgroundMusic ? <Volume2 className="h-5 w-5" aria-hidden="true" /> : <VolumeX className="h-5 w-5" aria-hidden="true" />}
      </button>
    }>
      <div className="space-y-4 pb-4">
        <section className="overflow-hidden rounded-[1.6rem] border border-gold/30 bg-navy-deep shadow-[0_16px_40px_rgba(0,0,0,0.24)]">
          <div className="relative h-44 overflow-hidden">
            <img src={mysteryArt[group]} alt={data.name} className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/20 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-4 text-center">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-gold">{group === todayGroup ? "Misterios de hoy" : "Misterios seleccionados"}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">{data.name}</h2>
              <p className="mt-1 font-display text-sm italic text-gold-bright">{mysteryDays[group]}</p>
            </div>
          </div>
        </section>

        <button type="button" onClick={() => setShowGroups((current) => !current)} aria-expanded={showGroups} className="flex min-h-12 w-full items-center justify-between rounded-2xl border border-gold/30 bg-navy/55 px-4 text-left">
          <span><span className="block text-sm font-medium text-foreground">¿Quieres rezar otros misterios?</span><span className="mt-0.5 block text-xs text-gold/80">Cambiar misterios</span></span>
          <ChevronDown className={`h-5 w-5 text-gold transition-transform ${showGroups ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>

        {showGroups ? (
          <div className="grid grid-cols-2 gap-2">
            {GROUPS.map((item) => (
              <button key={item} type="button" onClick={() => chooseGroup(item)} className={`rounded-2xl border p-2 text-left transition ${item === group ? "border-gold/70 bg-gold/10" : "border-gold/20 bg-secondary/35"}`}>
                <img src={mysteryArt[item]} alt="" className="h-20 w-full rounded-xl object-cover" />
                <span className="mt-2 block text-sm font-medium text-foreground">{mysteryGroups[item].name.replace("Misterios ", "")}</span>
                <span className="block text-[0.68rem] text-gold/75">{mysteryDays[item]}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div>
          <p className="mb-2 px-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gold/85">Los cinco misterios</p>
          <ol className="space-y-2">
            {data.mysteries.map((m) => (
              <li key={m.id} className="overflow-hidden rounded-2xl border border-gold/20 bg-secondary/35">
                <button type="button" onClick={() => setExpanded(expanded === m.order ? null : m.order)} aria-expanded={expanded === m.order} className="flex w-full items-center gap-3 p-2 text-left">
                  <img src={m.imageUrl ?? mysteryArt[group]} alt={`Imagen de ${m.title}`} loading="lazy" className="h-[4.4rem] w-[4.4rem] shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xs text-gold">{["I", "II", "III", "IV", "V"][m.order - 1]}</span>
                    <span className="mt-0.5 block font-display text-[1rem] leading-tight text-foreground">{m.title}</span>
                  </span>
                  <ChevronRight className={`h-5 w-5 shrink-0 text-gold/80 transition-transform ${expanded === m.order ? "rotate-90" : ""}`} aria-hidden="true" />
                </button>
                {expanded === m.order ? (
                  <div className="border-t border-gold/10 px-4 pb-4 pt-3">
                    <p className="text-xs font-medium text-gold">{m.scriptureRef}</p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground/75">{m.meditation ?? "Contempla este misterio en silencio mientras rezas con tu rosario."}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Fruto espiritual: {m.fruit}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </RosaryLayout>
  );
};

export default RosarioFisico;