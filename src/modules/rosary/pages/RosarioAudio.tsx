import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Headphones, Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { mysteryGroups } from "../mocks/mysteries";
import { mysteryArt } from "../mocks/mysteryArt";
import { rosaryTodayService } from "../services/rosaryTodayService";
import type { MysteryGroupId } from "../types";

const AUDIO_BY_GROUP: Record<MysteryGroupId, string> = {
  dolorosos: "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/lvjplayer/rosario/audio/mysteries/dolorosos/Misterios%20Dolorosos%20(Martes%20y%20Viernes).mp3",
  gloriosos: "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/lvjplayer/rosario/audio/mysteries/gloriosos/Misterios%20Gloriosos%20(Domingo%20y%20Mi%C3%A9rcoles).mp3",
  gozosos: "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/lvjplayer/rosario/audio/mysteries/gozosos/Misterios%20Gozosos%20(Lunes%20y%20S%C3%A1bado).mp3",
  luminosos: "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/lvjplayer/rosario/audio/mysteries/luminosos/Misterios%20Luminosos%20(Jueves).mp3",
};

const isGroup = (v: string | null): v is MysteryGroupId => !!v && ["gozosos", "luminosos", "dolorosos", "gloriosos"].includes(v);
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const RosarioAudio = () => {
  const [params] = useSearchParams();
  const todayGroup = rosaryTodayService.groupForDate();
  const group = isGroup(params.get("grupo")) ? (params.get("grupo") as MysteryGroupId) : todayGroup;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const groupData = mysteryGroups[group];

  useEffect(() => { setPlaying(false); setCurrentTime(0); setDuration(0); setError(false); audioRef.current?.load(); }, [group]);
  const togglePlayback = async () => { const audio = audioRef.current; if (!audio) return; try { if (audio.paused) await audio.play(); else audio.pause(); } catch { setError(true); } };
  const seekBy = (seconds: number) => { const audio = audioRef.current; if (!audio) return; audio.currentTime = Math.min(Math.max(0, audio.currentTime + seconds), audio.duration || 0); };
  const seekTo = (value: number) => { const audio = audioRef.current; if (!audio || !Number.isFinite(audio.duration)) return; audio.currentTime = value; };

  return (
    <RosaryLayout title="" focus fullScreen hideHeader>
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#020a12]">
        <section className="relative h-[clamp(300px,43dvh,410px)] shrink-0 overflow-hidden">
          <img src={mysteryArt[group]} alt={groupData.name} className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,6,12,.08)_0%,rgba(0,6,12,.03)_38%,rgba(0,6,12,.18)_58%,rgba(0,7,13,.88)_92%,#020a12_100%)]" />
          <div className="absolute inset-x-5 bottom-5 [text-shadow:0_3px_12px_rgba(0,0,0,1),0_1px_4px_rgba(0,0,0,1)]">
            <span className="inline-flex rounded-full border border-gold/80 bg-[#06111c]/72 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-bright shadow-lg backdrop-blur-sm">{group === todayGroup ? "Misterios de hoy" : "Santo Rosario"}</span>
            <h1 className="mt-1.5 font-display text-[clamp(1.85rem,8vw,2.45rem)] font-semibold leading-none text-white">{groupData.name}</h1>
          </div>
        </section>

        <div className="relative z-10 -mt-8 min-h-0 flex-1 px-3 pb-1">
          <section className="flex h-full min-h-0 flex-col justify-center overflow-hidden rounded-[1.65rem] border border-gold/45 bg-[linear-gradient(145deg,rgba(12,31,47,.98),rgba(5,19,31,.98))] px-5 py-3 shadow-[0_18px_45px_rgba(0,0,0,.3)]">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold/60 text-gold-bright"><Headphones className="h-5 w-5" aria-hidden="true" /></div>
              <p className="mt-1.5 font-display text-[1.2rem] font-semibold text-foreground">{groupData.name}</p>
              <p className="mt-0.5 text-[0.72rem] text-muted-foreground">Reza el Santo Rosario acompañado de principio a fin.</p>
            </div>
            <audio ref={audioRef} src={AUDIO_BY_GROUP[group]} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onError={() => setError(true)} />
            <div className="mt-2.5"><input type="range" min={0} max={duration || 0} step={1} value={Math.min(currentTime, duration || 0)} onChange={(event) => seekTo(Number(event.target.value))} aria-label="Progreso del Rosario en audio" className="w-full accent-gold" /><div className="mt-0.5 flex justify-between text-[0.68rem] text-muted-foreground"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div></div>
            <div className="mt-2 flex items-center justify-center gap-7"><button type="button" onClick={() => seekBy(-15)} aria-label="Retroceder 15 segundos" className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/45 text-gold-bright"><RotateCcw className="h-5 w-5" /></button><button type="button" onClick={togglePlayback} aria-label={playing ? "Pausar Rosario" : "Reproducir Rosario"} className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-gold text-navy-deep shadow-[0_8px_24px_rgba(219,163,47,.28)]">{playing ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="ml-1 h-6 w-6" fill="currentColor" />}</button><button type="button" onClick={() => seekBy(15)} aria-label="Avanzar 15 segundos" className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/45 text-gold-bright"><RotateCw className="h-5 w-5" /></button></div>
            <div className="mt-1.5 flex items-center justify-center gap-2 text-[0.68rem] text-muted-foreground"><Volume2 className="h-3.5 w-3.5 text-gold" /><span>Audio completo</span></div>
            {error ? <p role="alert" className="mt-2 rounded-2xl border border-gold/30 bg-navy-deep/60 px-3 py-2 text-center text-xs text-muted-foreground">No fue posible cargar el audio. Comprueba tu conexión e inténtalo nuevamente.</p> : null}
            <div className="mt-1 text-center"><button type="button" onClick={() => setShowGroups((value) => !value)} aria-expanded={showGroups} className="inline-flex min-h-8 items-center gap-2 px-2 text-[0.72rem] text-gold-bright">¿Quieres rezar otros misterios? <span className="font-semibold">Cambiar</span>{showGroups ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}</button>{showGroups ? <div className="mt-1 grid grid-cols-2 gap-1.5" aria-label="Seleccionar otros misterios para escuchar">{(Object.keys(AUDIO_BY_GROUP) as MysteryGroupId[]).map((item) => <a key={item} href={`?grupo=${item}`} aria-current={item === group ? "page" : undefined} className={`rounded-xl border px-2 py-2 text-center text-[0.68rem] font-medium ${item === group ? "border-gold bg-gold/10 text-gold-bright" : "border-gold/25 text-muted-foreground"}`}>{mysteryGroups[item].name.replace("Misterios ", "")}</a>)}</div> : null}</div>
          </section>
        </div>
      </div>
    </RosaryLayout>
  );
};

export default RosarioAudio;
