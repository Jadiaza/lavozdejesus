import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Headphones,
  Info,
  ListMusic,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
import PodcastSortSheet from "@/modules/podcast/components/PodcastSortSheet";
import {
  formatExternalDuration,
  getExternalPodcast,
  getExternalPodcastCatalogItem,
  type ExternalPodcast,
  type ExternalPodcastEpisode,
} from "@/modules/podcast/services/externalPodcastService";
import {
  bogotaCalendarDay,
  calendarDistance,
  formatCalendarDay,
  rssCalendarDay,
  sameCalendarDay,
} from "@/modules/podcast/utils/podcastCalendar";

const formatClock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
};

const episodeTimestamp = (episode: ExternalPodcastEpisode) => {
  const timestamp = Date.parse(episode.pub_date || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const episodeSequence = (episode: ExternalPodcastEpisode) =>
  (episode.season_number ?? 0) * 100000 + (episode.episode_number ?? 0);

const compareEpisodes = (a: ExternalPodcastEpisode, b: ExternalPodcastEpisode) => {
  const dateDiff = episodeTimestamp(a) - episodeTimestamp(b);
  if (dateDiff !== 0) return dateDiff;
  return episodeSequence(a) - episodeSequence(b);
};

const formatDate = (value: string) => {
  const date = rssCalendarDay(value);
  if (!date) return "Fecha no disponible";
  return formatCalendarDay(date);
};

const lastEpisodeKey = (slug: string) => `lvj:podcast:external:${slug}:last-episode`;
const positionKey = (slug: string, id: string) => `lvj:podcast:external:${slug}:position:${id}`;

const readStored = (key: string) => {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
};

const readPosition = (slug: string, id: string) => {
  try {
    return Math.max(0, Number(localStorage.getItem(positionKey(slug, id)) || 0) || 0);
  } catch {
    return 0;
  }
};

const saveProgress = (slug: string, id: string, seconds: number) => {
  try {
    localStorage.setItem(lastEpisodeKey(slug), id);
    localStorage.setItem(positionKey(slug, id), String(Math.max(0, Math.floor(seconds))));
  } catch {
    // El podcast continúa aunque el almacenamiento local no esté disponible.
  }
};

export default function PodcastExternalSeries() {
  const { slug = "" } = useParams();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [podcast, setPodcast] = useState<ExternalPodcast | null>(null);
  const [episodes, setEpisodes] = useState<ExternalPodcastEpisode[]>([]);
  const [current, setCurrent] = useState<ExternalPodcastEpisode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"episodes" | "about">("episodes");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [now, setNow] = useState(() => new Date());
  const catalogItem = useMemo(() => getExternalPodcastCatalogItem(slug), [slug]);
  const playbackMode = catalogItem?.playback_mode ?? "series";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    void getExternalPodcast(slug)
      .then((data) => {
        if (!mounted) return;
        setPodcast(data.podcast);
        setEpisodes(data.episodes);
        setSortOrder("newest");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "No fue posible cargar este podcast.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  const nearestEpisode = useMemo(() => {
    if (!episodes.length) return null;
    const today = bogotaCalendarDay(now);
    return (
      episodes.reduce<ExternalPodcastEpisode | null>((nearest, episode) => {
        const episodeDate = rssCalendarDay(episode.pub_date);
        if (!episodeDate) return nearest;
        if (!nearest) return episode;
        const nearestDate = rssCalendarDay(nearest.pub_date);
        if (!nearestDate) return episode;
        const episodeDistance = calendarDistance(episodeDate, today);
        const nearestDistance = calendarDistance(nearestDate, today);
        if (episodeDistance < nearestDistance) return episode;
        if (episodeDistance > nearestDistance) return nearest;
        return compareEpisodes(episode, nearest) > 0 ? episode : nearest;
      }, null) ?? episodes[0]
    );
  }, [episodes, now]);

  const nearestMatchesToday = useMemo(() => {
    if (!nearestEpisode) return false;
    const date = rssCalendarDay(nearestEpisode.pub_date);
    return date ? sameCalendarDay(date, bogotaCalendarDay(now)) : false;
  }, [nearestEpisode, now]);

  const sortedEpisodes = useMemo(() => {
    const next = [...episodes].sort(compareEpisodes);
    return sortOrder === "oldest" ? next : next.reverse();
  }, [episodes, sortOrder]);

  const chronologicalEpisodes = useMemo(() => [...episodes].sort(compareEpisodes), [episodes]);
  const latestEpisode = chronologicalEpisodes[chronologicalEpisodes.length - 1] ?? null;
  const oldestEpisode = chronologicalEpisodes[0] ?? null;

  const resumeEpisode = useMemo(() => {
    const savedId = readStored(lastEpisodeKey(slug));
    return episodes.find((episode) => episode.id === savedId) ?? null;
  }, [episodes, slug]);

  const playEpisode = async (episode: ExternalPodcastEpisode, openPlayer = true) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (openPlayer) setPlayerOpen(true);
    if (current?.id === episode.id) {
      if (audio.paused) await audio.play().catch(() => undefined);
      else audio.pause();
      return;
    }
    const saved = readPosition(slug, episode.id);
    setCurrent(episode);
    setCurrentTime(saved);
    setDuration(episode.duration_seconds || 0);
    audio.src = episode.audio_url;
    audio.playbackRate = playbackRate;
    audio.load();
    audio.addEventListener("loadedmetadata", () => {
      if (saved > 0 && (!audio.duration || saved < audio.duration - 5)) audio.currentTime = saved;
    }, { once: true });
    await audio.play().catch(() => setPlaying(false));
    saveProgress(slug, episode.id, saved);
  };

  const playNext = () => {
    if (!current || playbackMode !== "series") return;
    const index = chronologicalEpisodes.findIndex((episode) => episode.id === current.id);
    const next = chronologicalEpisodes[index + 1];
    if (next) void playEpisode(next, playerOpen);
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
    const next = Math.min(Math.max(0, seconds), max || seconds);
    audio.currentTime = next;
    setCurrentTime(next);
    if (current) saveProgress(slug, current.id, next);
  };

  const skipBy = (seconds: number) => seekTo(currentTime + seconds);

  const cyclePlaybackRate = () => {
    const values = [1, 1.25, 1.5, 2];
    const index = values.indexOf(playbackRate);
    const next = values[(index + 1) % values.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const shareEpisode = async () => {
    if (!current || !podcast) return;
    const text = `${current.title} · ${podcast.title}`;
    try {
      if (navigator.share) await navigator.share({ title: current.title, text });
      else if (navigator.clipboard) await navigator.clipboard.writeText(text);
    } catch {
      // Compartir es opcional y no debe interrumpir la reproducción.
    }
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <PodcastLayout backTo="/podcast">
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio) return;
          const nextTime = audio.currentTime || 0;
          setCurrentTime(nextTime);
          if (Number.isFinite(audio.duration)) setDuration(audio.duration);
          if (current) saveProgress(slug, current.id, nextTime);
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
            <p className="text-sm">Cargando podcast...</p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="mt-6 rounded-[1.5rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-7 text-center">
          <Headphones className="mx-auto h-10 w-10 text-[#D4AF37]" />
          <h1 className="mt-4 font-display text-2xl">No pudimos cargar el podcast</h1>
          <p className="mt-2 text-sm text-[#F8F5EA]/55">{error}</p>
        </section>
      )}

      {!loading && !error && podcast && (
        <>
          <section className="relative -mx-4 min-h-[27rem] overflow-hidden bg-[#070707] px-4 pb-6 pt-6">
            {podcast.image_url && <img src={podcast.image_url} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center opacity-42" />}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.98)_0%,rgba(5,5,5,.88)_46%,rgba(5,5,5,.40)_75%,rgba(5,5,5,.72)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05)_0%,rgba(5,5,5,.18)_58%,rgba(5,5,5,.98)_100%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#050505]/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F2D27A] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />{podcast.category || "Podcast católico"}
              </div>
              <h1 className="mt-5 max-w-[21rem] font-display text-[2.55rem] font-semibold leading-[0.9] tracking-[-0.025em] text-[#F2D27A]">{podcast.title}</h1>
              {podcast.author && <p className="mt-3 text-sm font-medium text-[#F8F5EA]/80">{podcast.author}</p>}
              <p className="mt-4 max-w-[20rem] line-clamp-5 text-[13px] leading-relaxed text-[#F8F5EA]/62">{podcast.description}</p>
              <div className="mt-5 grid gap-2.5 text-[12px] text-[#F8F5EA]/68">
                <span className="inline-flex items-center gap-2.5"><Headphones className="h-4.5 w-4.5 text-[#D4AF37]" />{episodes.length} episodios disponibles</span>
                {playbackMode === "daily" && nearestEpisode && <span className="inline-flex items-center gap-2.5"><CalendarDays className="h-4.5 w-4.5 text-[#D4AF37]" />{nearestMatchesToday ? "Episodio para hoy" : `Fecha más cercana: ${formatDate(nearestEpisode.pub_date)}`}</span>}
                {playbackMode === "series" && latestEpisode && <span className="inline-flex items-center gap-2.5"><CalendarDays className="h-4.5 w-4.5 text-[#D4AF37]" />Serie disponible desde {formatDate(oldestEpisode?.pub_date || latestEpisode.pub_date)}</span>}
              </div>
              {playbackMode === "daily" && nearestEpisode && (
                <button type="button" onClick={() => void playEpisode(nearestEpisode)} className="mt-5 inline-flex min-h-12 w-full max-w-[20rem] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-6 py-3 text-sm font-black text-[#050505] shadow-[0_12px_30px_rgba(212,175,55,0.25)]">
                  {current?.id === nearestEpisode.id && playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}{nearestMatchesToday ? "Escuchar episodio de hoy" : "Escuchar episodio"}
                </button>
              )}
              {playbackMode === "series" && (resumeEpisode || oldestEpisode) && (
                <div className="mt-5 w-full max-w-[20rem] space-y-2">
                  <button type="button" onClick={() => { const target = resumeEpisode || oldestEpisode; if (target) void playEpisode(target); }} className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-6 py-3 text-sm font-black text-[#050505] shadow-[0_12px_30px_rgba(212,175,55,0.25)]"><Play className="h-5 w-5 fill-current" />{resumeEpisode ? "Continuar escuchando" : "Comenzar desde el inicio"}</button>
                  {latestEpisode && <button type="button" onClick={() => void playEpisode(latestEpisode)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/65 px-5 py-2.5 text-sm font-bold text-[#F2D27A]"><Play className="h-4 w-4 fill-current" />Escuchar el más reciente</button>}
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
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">{podcast.category || "Podcast"}</p>
                  <div className="mt-0.5 flex items-baseline gap-2">
                    <h2 className="font-display text-[1.45rem] font-semibold leading-none">Episodios</h2>
                    <span className="text-[11px] text-[#F8F5EA]/42">{episodes.length}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setSortSheetOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#0A0A0A] px-3.5 text-[12px] font-semibold text-[#F8F5EA]/75">
                  <SlidersHorizontal className="h-4 w-4 text-[#D4AF37]" />{sortOrder === "newest" ? "Más reciente" : "Más antiguo"}
                </button>
              </div>

              <div className="divide-y divide-white/10 pb-32">
                {sortedEpisodes.map((episode) => {
                  const active = current?.id === episode.id;
                  const image = episode.image_url || podcast.image_url;
                  return (
                    <article key={episode.id} className={`py-3 transition ${active ? "bg-[#D4AF37]/[0.035]" : ""}`}>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => void playEpisode(episode)} className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-xl bg-[#111]" aria-label={`Reproducir ${episode.title}`}>
                          {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Headphones className="absolute inset-0 m-auto h-8 w-8 text-[#D4AF37]" />}
                          {active && playing && <span className="absolute inset-0 flex items-center justify-center bg-black/45"><Pause className="h-7 w-7 fill-current text-white" /></span>}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold text-[#D4AF37]">{formatDate(episode.pub_date)}</p>
                          <button type="button" onClick={() => void playEpisode(episode)} className="mt-0.5 block w-full text-left">
                            <h3 className={`line-clamp-2 text-[15px] font-semibold leading-snug ${active ? "text-[#F2D27A]" : "text-[#F8F5EA]"}`}>{episode.title}</h3>
                          </button>
                          {episode.description && <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-[#F8F5EA]/45">{episode.description}</p>}
                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#F8F5EA]/42">
                            <Clock3 className="h-3.5 w-3.5" /><span>{formatExternalDuration(episode.duration_seconds)}</span>{episode.season_number && episode.episode_number ? <span>· T{episode.season_number} E{episode.episode_number}</span> : null}
                          </div>
                        </div>
                        <button type="button" onClick={() => void playEpisode(episode)} className={`mt-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${active ? "bg-[#D4AF37] text-[#050505]" : "bg-[#F8F5EA] text-[#050505]"}`} aria-label={`${active && playing ? "Pausar" : "Reproducir"} ${episode.title}`}>
                          {active && playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="pb-28 pt-6">
              <div className="rounded-[1.4rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-5">
                <div className="flex items-center gap-2 text-[#D4AF37]"><Info className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-[0.2em]">Sobre este podcast</span></div>
                <h2 className="mt-4 font-display text-2xl text-[#F8F5EA]">{podcast.title}</h2>
                {podcast.author && <p className="mt-2 text-sm text-[#F2D27A]/80">{podcast.author}</p>}
                <p className="mt-3 text-sm leading-7 text-[#F8F5EA]/62">{podcast.description}</p>
              </div>
            </section>
          )}
        </>
      )}

      <PodcastSortSheet open={sortSheetOpen} order={sortOrder} onChange={setSortOrder} onClose={() => setSortSheetOpen(false)} />

      {current && !playerOpen && (
        <button type="button" onClick={() => setPlayerOpen(true)} className="fixed inset-x-3 bottom-[78px] z-[9997] mx-auto flex max-w-[430px] items-center gap-3 rounded-[1.05rem] border border-[#D4AF37]/40 bg-[#120F0A]/96 p-2.5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.58)] backdrop-blur-xl xl:bottom-5">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#111]">{(current.image_url || podcast?.image_url) ? <img src={current.image_url || podcast?.image_url} alt="" className="h-full w-full object-cover" /> : <Headphones className="m-3 h-6 w-6 text-[#D4AF37]" />}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold text-[#F8F5EA]">{current.title}</p><p className="truncate text-[11px] text-[#F8F5EA]/50">{podcast?.title}</p><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#D4AF37]" style={{ width: `${progress}%` }} /></div></div>
          <span onClick={(event) => { event.stopPropagation(); void playEpisode(current, false); }} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F5EA] text-[#050505]" role="button" aria-label={playing ? "Pausar" : "Reproducir"}>{playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}</span>
        </button>
      )}

      {current && playerOpen && (
        <div className="fixed inset-0 z-[10050] overflow-y-auto bg-[#070707] text-[#F8F5EA]">
          <div className="mx-auto flex min-h-full w-full max-w-[520px] flex-col bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,.16),transparent_38%),linear-gradient(180deg,#151007_0%,#080808_48%,#050505_100%)] px-5 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setPlayerOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-[#F8F5EA]" aria-label="Minimizar reproductor"><ChevronDown className="h-8 w-8" /></button>
              <div className="min-w-0 flex-1 px-3 text-center"><p className="text-[10px] uppercase tracking-[0.2em] text-[#F8F5EA]/50">Reproduciendo desde el podcast</p><p className="truncate text-sm font-bold">{podcast?.title}</p></div>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full text-[#F8F5EA]" aria-label="Más opciones"><MoreVertical className="h-6 w-6" /></button>
            </div>
            <div className="mt-8 aspect-square w-full overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#111] shadow-[0_24px_70px_rgba(0,0,0,.5)]">{(current.image_url || podcast?.image_url) ? <img src={current.image_url || podcast?.image_url} alt={`Portada de ${current.title}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Headphones className="h-20 w-20 text-[#D4AF37]" /></div>}</div>
            <div className="mt-8 flex items-start gap-4"><div className="min-w-0 flex-1"><h1 className="line-clamp-2 text-[1.35rem] font-bold leading-tight">{current.title}</h1><p className="mt-1 truncate text-sm text-[#F8F5EA]/55">{podcast?.title}</p></div><button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#F8F5EA]/75" aria-label="Agregar episodio"><Plus className="h-6 w-6" /></button></div>
            <div className="mt-7"><input type="range" min={0} max={Math.max(duration, 1)} step={1} value={Math.min(currentTime, Math.max(duration, 1))} onChange={(event) => seekTo(Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-[#D4AF37]" aria-label="Progreso del episodio" /><div className="mt-2 flex justify-between text-xs text-[#F8F5EA]/55"><span>{formatClock(currentTime)}</span><span>{formatClock(duration)}</span></div></div>
            <div className="mt-6 grid grid-cols-5 items-center gap-2">
              <button type="button" onClick={cyclePlaybackRate} className="text-center text-lg font-bold" aria-label="Cambiar velocidad">{playbackRate}×</button>
              <button type="button" onClick={() => skipBy(-15)} className="relative mx-auto flex h-12 w-12 items-center justify-center" aria-label="Retroceder 15 segundos"><RotateCcw className="h-8 w-8" /><span className="absolute text-[10px] font-black">15</span></button>
              <button type="button" onClick={() => void playEpisode(current, false)} className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#F8F5EA] text-[#050505] shadow-lg" aria-label={playing ? "Pausar" : "Reproducir"}>{playing ? <Pause className="h-8 w-8 fill-current" /> : <Play className="ml-1 h-8 w-8 fill-current" />}</button>
              <button type="button" onClick={() => skipBy(15)} className="relative mx-auto flex h-12 w-12 items-center justify-center" aria-label="Adelantar 15 segundos"><RotateCw className="h-8 w-8" /><span className="absolute text-[10px] font-black">15</span></button>
              <div className="mx-auto flex h-12 w-12 items-center justify-center"><Volume2 className="h-6 w-6" /></div>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-[#F8F5EA]/70"><button type="button" className="flex flex-col items-center gap-1 text-[10px]"><ListMusic className="h-6 w-6" /><span>Cola</span></button><button type="button" onClick={() => void shareEpisode()} className="flex flex-col items-center gap-1 text-[10px]"><Share2 className="h-6 w-6" /><span>Compartir</span></button><div className="text-right text-[11px] text-[#F8F5EA]/45">{formatDate(current.pub_date)}</div></div>
            {current.description && <div className="mt-6 rounded-2xl bg-white/[0.06] p-4"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Acerca del episodio</p><p className="mt-2 line-clamp-5 text-sm leading-6 text-[#F8F5EA]/68">{current.description}</p></div>}
          </div>
        </div>
      )}
    </PodcastLayout>
  );
}
