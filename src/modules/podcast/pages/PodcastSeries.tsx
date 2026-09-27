import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Headphones,
  Info,
  ListMusic,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
import PodcastSortSheet from "@/modules/podcast/components/PodcastSortSheet";
import {
  formatEpisodeDuration,
  getConsecrationPodcast,
  type PodcastEpisode,
  type PodcastSeries,
} from "@/modules/podcast/services/podcastService";

const CONSECRATION_COVER =
  "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/modulos/consagraciones/san-miguel/imagenes/dias/dia-03.webp";
const LAST_EPISODE_KEY = "lvj:podcast:consecration:last-episode";
const positionKey = (id: string) => `lvj:podcast:consecration:position:${id}`;

const readSavedPosition = (id: string) => {
  try {
    return Math.max(0, Number(localStorage.getItem(positionKey(id)) ?? 0) || 0);
  } catch {
    return 0;
  }
};

const savePosition = (id: string, seconds: number) => {
  try {
    localStorage.setItem(positionKey(id), String(Math.max(0, Math.floor(seconds))));
    localStorage.setItem(LAST_EPISODE_KEY, id);
  } catch {
    // La reproducción continúa aunque localStorage no esté disponible.
  }
};

const getLastEpisodeId = () => {
  try {
    return localStorage.getItem(LAST_EPISODE_KEY) ?? "";
  } catch {
    return "";
  }
};

const formatClock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
};

export default function PodcastSeries() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [series, setSeries] = useState<PodcastSeries | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [resumeEpisodeId, setResumeEpisodeId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"episodes" | "about">("episodes");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getConsecrationPodcast();
      setSeries(data.series);
      setEpisodes(data.episodes);
      const lastId = getLastEpisodeId();
      const resume = data.episodes.find((episode) => episode.id === lastId) ?? data.episodes[0] ?? null;
      if (resume) setResumeEpisodeId(resume.id);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar la serie.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const chronologicalEpisodes = useMemo(
    () => [...episodes].sort((a, b) => a.day_number - b.day_number),
    [episodes],
  );

  const sortedEpisodes = useMemo(
    () => (sortOrder === "oldest" ? chronologicalEpisodes : [...chronologicalEpisodes].reverse()),
    [chronologicalEpisodes, sortOrder],
  );

  const firstEpisode = chronologicalEpisodes[0] ?? null;
  const latestEpisode = chronologicalEpisodes[chronologicalEpisodes.length - 1] ?? null;
  const resumeEpisode = useMemo(
    () => episodes.find((episode) => episode.id === resumeEpisodeId) ?? null,
    [episodes, resumeEpisodeId],
  );

  const playEpisode = async (episode: PodcastEpisode, expand = true) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentEpisode?.id === episode.id) {
      if (audio.paused) await audio.play().catch(() => setIsPlaying(false));
      else audio.pause();
      if (expand) setPlayerExpanded(true);
      return;
    }
    const saved = readSavedPosition(episode.id);
    setCurrentEpisode(episode);
    setResumeEpisodeId(episode.id);
    setCurrentTime(saved);
    setDuration(episode.duration_seconds || episode.estimated_minutes * 60 || 0);
    if (expand) setPlayerExpanded(true);
    audio.src = episode.audio_url;
    audio.playbackRate = playbackRate;
    audio.load();
    audio.addEventListener("loadedmetadata", () => {
      if (saved > 0 && (!audio.duration || saved < audio.duration - 5)) audio.currentTime = saved;
    }, { once: true });
    await audio.play().catch(() => setIsPlaying(false));
    savePosition(episode.id, saved);
  };

  const playNext = () => {
    if (!currentEpisode) return;
    const index = chronologicalEpisodes.findIndex((episode) => episode.id === currentEpisode.id);
    const next = chronologicalEpisodes[index + 1];
    if (next) void playEpisode(next, false);
  };

  const seekBy = (amount: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = Number.isFinite(audio.duration) ? audio.duration : duration;
    audio.currentTime = Math.max(0, Math.min(max || Infinity, audio.currentTime + amount));
  };

  const seekTo = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const shareEpisode = async () => {
    if (!currentEpisode) return;
    const shareData = {
      title: currentEpisode.title,
      text: `Escucha ${currentEpisode.title} en La Voz de Jesús`,
      url: window.location.href,
    };
    if (navigator.share) await navigator.share(shareData).catch(() => undefined);
    else await navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <PodcastLayout backTo="/podcast">
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio || !currentEpisode) return;
          const nextTime = audio.currentTime || 0;
          setCurrentTime(nextTime);
          if (Number.isFinite(audio.duration)) setDuration(audio.duration);
          savePosition(currentEpisode.id, nextTime);
        }}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
        }}
        onEnded={playNext}
      />

      {loading && (
        <section className="flex min-h-[30rem] items-center justify-center">
          <div className="text-center text-[#F8F5EA]/55">
            <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-[#D4AF37]" />
            <p className="text-sm">Cargando serie...</p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="mt-6 rounded-[1.5rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-7 text-center">
          <Headphones className="mx-auto h-10 w-10 text-[#D4AF37]" />
          <h1 className="mt-4 font-display text-2xl">No pudimos cargar la serie</h1>
          <p className="mt-2 text-sm text-[#F8F5EA]/55">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-5 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-5 py-2.5 text-sm font-bold text-[#050505]">Reintentar</button>
        </section>
      )}

      {!loading && !error && series && (
        <>
          <section className="relative -mx-4 min-h-[27rem] overflow-hidden bg-[#070707] px-4 pb-6 pt-6">
            <img src={CONSECRATION_COVER} alt="Carátula de 33 Días con los Santos Arcángeles" className="absolute inset-0 h-full w-full object-cover object-center opacity-42" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.98)_0%,rgba(5,5,5,.88)_46%,rgba(5,5,5,.40)_75%,rgba(5,5,5,.72)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05)_0%,rgba(5,5,5,.18)_58%,rgba(5,5,5,.98)_100%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#050505]/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F2D27A] backdrop-blur-sm"><Sparkles className="h-3.5 w-3.5" />Serie espiritual</div>
              <h1 className="mt-5 max-w-[21rem] font-display text-[2.55rem] font-semibold leading-[0.9] tracking-[-0.025em] text-[#F2D27A]">33 Días con los Santos Arcángeles</h1>
              <p className="mt-3 text-sm font-medium text-[#F8F5EA]/80">{series.subtitle || "San Miguel · San Gabriel · San Rafael"}</p>
              <p className="mt-4 max-w-[20rem] text-[13px] leading-relaxed text-[#F8F5EA]/62">{series.description}</p>
              <div className="mt-5 grid gap-2.5 text-[12px] text-[#F8F5EA]/68">
                <span className="inline-flex items-center gap-2.5"><Headphones className="h-4.5 w-4.5 text-[#D4AF37]" />{episodes.length} enseñanzas disponibles</span>
                <span className="inline-flex items-center gap-2.5"><CalendarDays className="h-4.5 w-4.5 text-[#D4AF37]" />{series.duration_days} días de itinerario</span>
              </div>
              {firstEpisode && (
                <div className="mt-5 w-full max-w-[20rem] space-y-2">
                  <button type="button" onClick={() => void playEpisode(resumeEpisode && readSavedPosition(resumeEpisode.id) > 5 ? resumeEpisode : firstEpisode)} className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-6 py-3 text-sm font-black text-[#050505]"><Play className="h-5 w-5 fill-current" />{resumeEpisode && readSavedPosition(resumeEpisode.id) > 5 ? "Continuar escuchando" : "Comenzar desde el primer episodio"}</button>
                  {latestEpisode && <button type="button" onClick={() => void playEpisode(latestEpisode)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/65 px-5 py-2.5 text-sm font-bold text-[#F2D27A]"><Play className="h-4 w-4 fill-current" />Escuchar episodio más reciente</button>}
                </div>
              )}
            </div>
          </section>

          <div className="-mx-4 border-b border-[#D4AF37]/15 bg-[#080808] px-4">
            <div className="grid grid-cols-2">
              <button type="button" onClick={() => setTab("episodes")} className={`border-b-2 px-2 py-3 text-sm font-semibold ${tab === "episodes" ? "border-[#D4AF37] text-[#F2D27A]" : "border-transparent text-[#F8F5EA]/48"}`}>Episodios</button>
              <button type="button" onClick={() => setTab("about")} className={`border-b-2 px-2 py-3 text-sm font-semibold ${tab === "about" ? "border-[#D4AF37] text-[#F2D27A]" : "border-transparent text-[#F8F5EA]/48"}`}>Acerca de la serie</button>
            </div>
          </div>

          {tab === "episodes" ? (
            <section className="pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Consagración</p>
                  <div className="mt-0.5 flex items-baseline gap-2"><h2 className="font-display text-[1.45rem] font-semibold leading-none">Episodios</h2><span className="text-[11px] text-[#F8F5EA]/42">{episodes.length}</span></div>
                </div>
                <button type="button" onClick={() => setSortSheetOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#0A0A0A] px-3.5 text-[12px] font-semibold text-[#F8F5EA]/75">
                  <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" />{sortOrder === "newest" ? "Más reciente" : "Más antiguo"}
                </button>
              </div>

              <div className="space-y-2 pb-28">
                {sortedEpisodes.map((episode) => {
                  const active = currentEpisode?.id === episode.id;
                  const saved = readSavedPosition(episode.id);
                  const total = episode.duration_seconds || episode.estimated_minutes * 60;
                  const savedPercent = total ? Math.min(100, Math.round((saved / total) * 100)) : 0;
                  return (
                    <article key={episode.id} className={`grid grid-cols-[64px_1fr_42px] gap-3 rounded-[1rem] border p-2.5 ${active ? "border-[#D4AF37]/65 bg-[#D4AF37]/[0.08]" : "border-white/10 bg-[#0A0A0A]"}`}>
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[#D4AF37]/20"><img src={episode.image_url || CONSECRATION_COVER} alt="" className="h-full w-full object-cover" /><span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[8px] font-bold text-[#F2D27A]">D{episode.day_number}</span></div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-[#D4AF37]">Día {episode.day_number}</p>
                        <h3 className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-snug text-[#F8F5EA]">{episode.title}</h3>
                        {(episode.summary || episode.subtitle) && <p className="mt-1 line-clamp-1 text-[10px] leading-4 text-[#F8F5EA]/45">{episode.summary || episode.subtitle}</p>}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#F8F5EA]/45"><Clock3 className="h-3.5 w-3.5" />{formatEpisodeDuration(episode)}</div>
                        {savedPercent > 0 && <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#D4AF37]" style={{ width: `${savedPercent}%` }} /></div>}
                      </div>
                      <button type="button" onClick={() => void playEpisode(episode)} aria-label={`${active && isPlaying ? "Pausar" : "Reproducir"} ${episode.title}`} className={`mt-2 flex h-10 w-10 items-center justify-center rounded-full border ${active ? "border-[#D4AF37] bg-[#D4AF37] text-[#050505]" : "border-[#D4AF37]/60 text-[#F2D27A]"}`}>{active && isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />}</button>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="pb-28 pt-6"><div className="rounded-[1.4rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-5"><div className="flex items-center gap-2 text-[#D4AF37]"><Info className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-[0.2em]">Sobre esta serie</span></div><h2 className="mt-4 font-display text-2xl text-[#F8F5EA]">{series.title}</h2><p className="mt-3 text-sm leading-7 text-[#F8F5EA]/62">{series.description}</p>{series.motto && <p className="mt-5 border-l-2 border-[#D4AF37]/70 pl-4 font-display text-xl italic text-[#F2D27A]">{series.motto}</p>}</div></section>
          )}
        </>
      )}

      <PodcastSortSheet open={sortSheetOpen} order={sortOrder} onChange={setSortOrder} onClose={() => setSortSheetOpen(false)} />

      {currentEpisode && playerExpanded && (
        <div className="fixed inset-0 z-[10020] overflow-y-auto bg-[linear-gradient(180deg,#18110A_0%,#0A0908_46%,#050505_100%)] text-[#F8F5EA]">
          <div className="mx-auto flex min-h-full w-full max-w-[520px] flex-col px-5 pb-8 pt-[max(20px,env(safe-area-inset-top))]">
            <div className="flex items-center justify-between gap-4 py-2"><button type="button" onClick={() => setPlayerExpanded(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-[#F8F5EA]" aria-label="Minimizar reproductor"><ChevronDown className="h-8 w-8" /></button><div className="min-w-0 text-center"><p className="text-xs text-[#F8F5EA]/65">Reproduciendo desde el podcast</p><p className="truncate text-sm font-bold">33 Días con los Santos Arcángeles</p></div><div className="h-11 w-11" /></div>
            <div className="mx-auto mt-8 aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl shadow-[0_22px_60px_rgba(0,0,0,.45)]"><img src={currentEpisode.image_url || CONSECRATION_COVER} alt={`Carátula de ${currentEpisode.title}`} className="h-full w-full object-cover" /></div>
            <div className="mt-8"><h2 className="text-[1.55rem] font-bold leading-tight">{currentEpisode.title}</h2><p className="mt-1 text-sm text-[#F8F5EA]/60">Día {currentEpisode.day_number} · 33 Días con los Santos Arcángeles</p></div>
            <div className="mt-7"><input type="range" min={0} max={Math.max(duration, 1)} step={1} value={Math.min(currentTime, Math.max(duration, 1))} onChange={(e) => seekTo(Number(e.target.value))} className="w-full accent-[#D4AF37]" aria-label="Progreso del episodio" /><div className="mt-1 flex justify-between text-xs text-[#F8F5EA]/55"><span>{formatClock(currentTime)}</span><span>{formatClock(duration)}</span></div></div>
            <div className="mt-5 grid grid-cols-5 items-center gap-2"><button type="button" onClick={cycleRate} className="text-sm font-bold">{playbackRate}x</button><button type="button" onClick={() => seekBy(-15)} className="flex justify-center" aria-label="Retroceder 15 segundos"><RotateCcw className="h-7 w-7" /></button><button type="button" onClick={() => void playEpisode(currentEpisode, false)} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F8F5EA] text-[#050505]" aria-label={isPlaying ? "Pausar" : "Reproducir"}>{isPlaying ? <Pause className="h-8 w-8 fill-current" /> : <Play className="ml-1 h-8 w-8 fill-current" />}</button><button type="button" onClick={() => seekBy(15)} className="flex justify-center" aria-label="Adelantar 15 segundos"><RotateCw className="h-7 w-7" /></button><button type="button" onClick={() => setTab("episodes")} className="flex justify-center" aria-label="Ver episodios"><ListMusic className="h-7 w-7" /></button></div>
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5"><button type="button" onClick={() => void shareEpisode()} className="inline-flex items-center gap-2 text-sm font-semibold text-[#F8F5EA]/75"><Share2 className="h-5 w-5" />Compartir</button><Volume2 className="h-5 w-5 text-[#F8F5EA]/55" /></div>
            {(currentEpisode.summary || currentEpisode.subtitle) && <div className="mt-7 rounded-2xl bg-white/[0.06] p-4"><p className="text-sm leading-6 text-[#F8F5EA]/72">{currentEpisode.summary || currentEpisode.subtitle}</p></div>}
          </div>
        </div>
      )}

      {currentEpisode && !playerExpanded && (
        <button type="button" onClick={() => setPlayerExpanded(true)} className="fixed inset-x-3 bottom-[76px] z-[9997] mx-auto flex max-w-[520px] items-center gap-3 rounded-[1.05rem] border border-[#D4AF37]/40 bg-[#100D09]/96 p-3 text-left shadow-[0_18px_45px_rgba(0,0,0,.58)] backdrop-blur-xl xl:bottom-5">
          <img src={currentEpisode.image_url || CONSECRATION_COVER} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">33 Días con los Santos Arcángeles</p><p className="truncate text-[13px] font-semibold">{currentEpisode.title}</p><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#D4AF37]" style={{ width: `${progress}%` }} /></div></div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[#050505]">{isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />}</span>
        </button>
      )}
    </PodcastLayout>
  );
}
