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
const ROMAN = ["I", "II", "III", "IV", "V"];
const isGroup = (value: string | null): value is MysteryGroupId => Boolean(value) && GROUPS.includes(value as MysteryGroupId);
const shortGroupName = (name: string) => name.replace(/^Misterios\s+/i, "").replace(/os$/i, "o");

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
    setParams({ grupo: nextGroup }); setShowGroups(false); setExpanded(null);
  };

  return (
    <RosaryLayout title="" focus hideHeader>
      <div className="-mx-4 -mt-4 pb-4">
        <section className="relative min-h-[clamp(31rem,78vh,43rem)] w-full overflow-hidden border-b border-gold/25">
          <img src={mysteryArt[group]} alt={data.name} className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-navy-deep" aria-hidden="true" />
          <div className="relative z-10 flex min-h-[clamp(31rem,78vh,43rem)] flex-col px-5 pb-9 pt-[calc(1.25rem+env(safe-area-inset-top))] text-white [text-shadow:0_2px_12px_rgba(0,0,0,.95)]">
            <div className="flex justify-end">
              <button type="button" onClick={toggleAmbient} aria-pressed={prefs.backgroundMusic} aria-label={prefs.backgroundMusic ? "Silenciar música de fondo" : "Activar música de fondo"} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-black/25 text-white backdrop-blur-sm">
                {prefs.backgroundMusic ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </button>
            </div>
            <div className="mt-auto text-center">
              <p className="text-[.7rem] font-semibold uppercase tracking-[.3em] text-gold-bright">{group === todayGroup ? "Misterios de hoy" : "Misterios seleccionados"}</p>
              <h2 className="mt-2 font-display text-[clamp(2.1rem,8vw,2.9rem)] font-medium leading-tight">{shortGroupName(data.name)}</h2>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-2xl space-y-4 px-4 pt-5">
          <button type="button" onClick={() => setShowGroups(v => !v)} aria-expanded={showGroups} className="flex min-h-[58px] w-full items-center justify-between rounded-[1.35rem] border border-gold/30 bg-navy/55 px-5 text-left">
            <span><span className="block text-[clamp(.9rem,3.8vw,1.05rem)] font-medium text-foreground">¿Quieres rezar otros misterios?</span><span className="mt-1 block text-sm text-gold/80">Cambiar misterios</span></span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-gold transition-transform ${showGroups ? "rotate-180" : ""}`} />
          </button>

          {showGroups ? <div className="grid grid-cols-2 gap-2">{GROUPS.map(item => <button key={item} type="button" onClick={() => chooseGroup(item)} className={`rounded-2xl border p-2 text-left ${item === group ? "border-gold/70 bg-gold/10" : "border-gold/20 bg-secondary/35"}`}><img src={mysteryArt[item]} alt="" className="h-20 w-full rounded-xl object-cover" /><span className="mt-2 block text-sm font-medium text-foreground">{mysteryGroups[item].name.replace("Misterios ", "")}</span><span className="block text-[.68rem] text-gold/75">{mysteryDays[item]}</span></button>)}</div> : null}

          <div className="pt-1">
            <p className="mb-3 px-1 text-[.7rem] font-semibold uppercase tracking-[.28em] text-gold/90">Los cinco misterios</p>
            <ol className="space-y-2.5">{data.mysteries.map(m => <li key={m.id} className="overflow-hidden rounded-[1.35rem] border border-gold/20 bg-secondary/30">
              <button type="button" onClick={() => setExpanded(expanded === m.order ? null : m.order)} aria-expanded={expanded === m.order} className="flex min-h-[92px] w-full items-center gap-4 p-2.5 pr-4 text-left">
                <img src={m.imageUrl ?? mysteryArt[group]} alt={`Imagen de ${m.title}`} loading="lazy" className="h-[4.8rem] w-[4.8rem] shrink-0 rounded-[1rem] object-cover" />
                <span className="min-w-0 flex-1"><span className="block font-display text-xs text-gold">{ROMAN[m.order - 1]}</span><span className="mt-1 block font-display text-[clamp(1rem,4.3vw,1.25rem)] leading-tight text-foreground">{m.title}</span></span>
                <ChevronRight className={`h-5 w-5 shrink-0 text-gold/85 transition-transform ${expanded === m.order ? "rotate-90" : ""}`} />
              </button>
              {expanded === m.order ? <div className="border-t border-gold/10 px-4 pb-4 pt-3"><p className="text-xs font-medium text-gold">{m.scriptureRef}</p><p className="mt-2 text-sm leading-relaxed text-foreground/75">{m.meditation ?? "Contempla este misterio en silencio mientras rezas con tu rosario."}</p><p className="mt-2 text-xs text-muted-foreground">Fruto espiritual: {m.fruit}</p></div> : null}
            </li>)}</ol>
          </div>
        </div>
      </div>
    </RosaryLayout>
  );
};

export default RosarioFisico;