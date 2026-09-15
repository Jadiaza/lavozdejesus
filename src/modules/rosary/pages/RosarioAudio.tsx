import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Headphones, Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosaryPrayerScene } from "../components/RosaryPrayerScene";
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

const DAYS_BY_GROUP: Record<MysteryGroupId, string> = {
  gozosos: "Lunes y sábado",
  luminosos: "Jueves",
  dolorosos: "Martes y viernes",
  gloriosos: "Miércoles y domingo",
};

const isGroup = (v: string | null): v is MysteryGroupId =>
  !!v && ["gozosos", "luminosos", "dolorosos", "gloriosos"].includes(v);

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const RosarioAudio = () => {
  const [params] = useSearchParams();
  const group = isGroup(params.get("grupo")) ? (params.get("grupo") as MysteryGroupId) : rosaryTodayService.groupForDate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  const groupData = mysteryGroups[group];
  const featuredMystery = useMemo(() => groupData.mysteries[0] ?? null, [groupData]);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setError(false);
    audioRef.current?.load();
  }, [group]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (audio.paused) await audio.play();
      else audio.pause();
    } catch {
      setError(true);
    }
  };

  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + seconds), audio.duration || 0);
  };

  const seekTo = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = value;
  };

  return (
    <RosaryLayout title="Rosario en audio" subtitle={groupData.name} focus>
      <div className="mx-auto w-full max-w-2xl space-y-5 pb-4">
        <RosaryPrayerScene title={groupData.name} subtitle={DAYS_BY_GROUP[group]} image={mysteryArt[group]} mystery={featuredMystery} />

        <section className="glass gold-border overflow-hidden rounded-3xl p-5 sm:p-7">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/60 text-gold-bright">
              <Headphones className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-3 font-display text-2xl font-semibold text-foreground">{groupData.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">Reza el Santo Rosario acompañado de principio a fin.</p>
          </div>

          <audio ref={audioRef} src={AUDIO_BY_GROUP[group]} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onError={() => setError(true)} />

          <div className="mt-6">
            <input type="range" min={0} max={duration || 0} step={1} value={Math.min(currentTime, duration || 0)} onChange={(event) => seekTo(Number(event.target.value))} aria-label="Progreso del Rosario en audio" className="w-full accent-gold" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-7">
            <button type="button" onClick={() => seekBy(-15)} aria-label="Retroceder 15 segundos" className="flex h-12 w-12 items-center justify-center rounded-full gold-border text-gold-bright"><RotateCcw className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={togglePlayback} aria-label={playing ? "Pausar Rosario" : "Reproducir Rosario"} className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-gold text-navy-deep shadow-lg">{playing ? <Pause className="h-8 w-8" fill="currentColor" aria-hidden="true" /> : <Play className="ml-1 h-8 w-8" fill="currentColor" aria-hidden="true" />}</button>
            <button type="button" onClick={() => seekBy(15)} aria-label="Avanzar 15 segundos" className="flex h-12 w-12 items-center justify-center rounded-full gold-border text-gold-bright"><RotateCw className="h-5 w-5" aria-hidden="true" /></button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Volume2 className="h-4 w-4 text-gold" aria-hidden="true" /><span>Audio completo · {DAYS_BY_GROUP[group]}</span></div>
          {error && <p role="alert" className="mt-4 rounded-2xl border border-gold/30 bg-navy-deep/60 px-4 py-3 text-center text-xs text-muted-foreground">No fue posible cargar el audio. Comprueba tu conexión e inténtalo nuevamente.</p>}
        </section>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Seleccionar misterios para escuchar">
          {(Object.keys(AUDIO_BY_GROUP) as MysteryGroupId[]).map((item) => (
            <a key={item} href={`?grupo=${item}`} aria-current={item === group ? "page" : undefined} className={`rounded-2xl border px-3 py-3 text-center text-xs font-medium transition ${item === group ? "border-gold bg-gold/10 text-gold-bright" : "border-gold/25 text-muted-foreground hover:border-gold/60"}`}>
              {mysteryGroups[item].name.replace("Misterios ", "")}
            </a>
          ))}
        </section>
      </div>
    </RosaryLayout>
  );
};

export default RosarioAudio;
