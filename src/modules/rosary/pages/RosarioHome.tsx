import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryLoading } from "../components/RosaryStateViews";
import { useRosaryToday } from "../hooks/useRosaryToday";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import { rosarySessionService } from "../services/rosarySessionService";
import { rosaryTodayService } from "../services/rosaryTodayService";
import { routeForMode } from "../utils/routes";
import type { MysteryGroupId, RosarySession } from "../types";

export const RosarioHome = () => {
  const today = useRosaryToday();
  const navigate = useNavigate();
  const { update } = useRosaryFlow();
  const [resume, setResume] = useState<RosarySession | null>(null);
  useEffect(() => { setResume(rosarySessionService.load()); }, []);
  const group: MysteryGroupId = today.status === "ready" ? today.data.recommendedGroup : rosaryTodayService.groupForDate();
  const groupData = mysteryGroups[group];
  const groupShortName = groupData.name.replace(/^Misterios\s+/i, "");
  const hasPendingSession = resume !== null && resume.status !== "terminado";
  const startFlow = () => { update({ group }); navigate("/rosario/modalidad"); };
  const startTodayRosary = () => {
    if (hasPendingSession) {
      const confirmed = window.confirm("Se descartará el progreso del Rosario pendiente. ¿Deseas comenzar el Rosario de hoy?");
      if (!confirmed) return;
      rosarySessionService.clear(); setResume(null);
    }
    update({ group }); navigate("/rosario/modalidad");
  };

  return <RosaryLayout title="" fullScreen hideHeader>
    {today.status === "loading" ? <div className="flex h-full items-center justify-center"><RosaryLoading label="Preparando los misterios de hoy" /></div> : (
      <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-navy-deep" aria-label={`Portada de ${groupData.name}`}>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <img src={mysteryArt[group]} alt={`Representación artística de los ${groupData.name}`} width={1024} height={1200} className="absolute inset-0 h-full w-full scale-[1.01] object-cover object-center" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/60 via-black/18 to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-navy-deep via-navy-deep/58 to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,transparent_32%,hsl(var(--navy-deep)/0.10)_64%,hsl(var(--navy-deep)/0.42)_100%)]" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 z-10 px-6 pt-[max(1.25rem,env(safe-area-inset-top))] [text-shadow:0_3px_12px_rgba(0,0,0,.95),0_1px_4px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold-bright">La Voz de Jesús</p>
            <h1 className="mt-1.5 font-display text-[clamp(2rem,8vw,2.6rem)] font-semibold leading-none text-white">Santo Rosario</h1>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 text-center min-[390px]:px-6 [text-shadow:0_3px_12px_rgba(0,0,0,.95)]">
            <p className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-gold-bright/90">Misterio de hoy</p>
            <h2 className="mt-1.5 font-display text-[clamp(1.7rem,7vw,2.2rem)] font-semibold leading-tight text-white">{groupShortName}</h2>
          </div>
        </div>
        <div className="relative z-20 shrink-0 bg-navy-deep px-5 pb-3 pt-3 min-[390px]:px-6">
          {hasPendingSession && resume ? <><Link to={`${routeForMode(resume.mode)}?grupo=${resume.group}`} className="relative flex min-h-[64px] w-full items-center justify-center overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold whitespace-nowrap px-12 font-sans text-[clamp(0.9rem,4.2vw,1.12rem)] font-bold uppercase tracking-[0.045em] text-navy-deep shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)]"><img src="/icons/rosario.png" alt="" className="absolute left-5 h-9 w-9 object-contain brightness-0" />Continuar Rosario<ChevronRight className="absolute right-5 h-5 w-5" /></Link><button type="button" onClick={startTodayRosary} className="mx-auto mt-2 flex min-h-8 items-center justify-center rounded-xl px-3 text-[11px] font-medium tracking-wide text-gold/75">Comenzar el Rosario de hoy</button></> : <button type="button" onClick={startFlow} className="relative flex min-h-[64px] w-full items-center justify-center overflow-hidden rounded-[1.15rem] border border-gold-bright/55 bg-gradient-gold whitespace-nowrap px-12 font-sans text-[clamp(0.9rem,4.2vw,1.12rem)] font-bold uppercase tracking-[0.045em] text-navy-deep shadow-[0_14px_40px_-12px_hsl(var(--gold)/0.65)]"><img src="/icons/rosario.png" alt="" className="absolute left-5 h-9 w-9 object-contain brightness-0" />Comenzar el Rosario<ChevronRight className="absolute right-5 h-5 w-5" /></button>}
          <Link to="/rosario/seleccionar-misterios" className="mx-auto mt-2 flex min-h-9 w-fit items-center justify-center gap-1.5 border-b border-gold/30 px-1 font-display text-[13px] text-gold/85">Elegir otros misterios<ChevronRight className="h-4 w-4" /></Link>
        </div>
      </section>
    )}
  </RosaryLayout>;
};

export default RosarioHome;