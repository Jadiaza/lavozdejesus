import {
  CalendarDays,
  Clock3,
  Headphones,
  Info,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
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
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const episodeTimestamp = (episode: ExternalPodcastEpisode) => {
  const timestamp = Date.parse(episode.pub_date || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
        setSortOrder((catalogItem?.playback_mode ?? "series") === "daily" ? "newest" : "newest");
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
  }, [slug, catalogItem?.playback_mode]);

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
        return episodeTimestamp(episode) > episodeTimestamp(nearest) ? episode : nearest;
      }, null) ?? episodes[0]
    );
  }, [episodes, now]);

  const nearestMatchesToday = useMemo(() => {
    if (!nearestEpisode) return false;
    const date = rssCalendarDay(nearestEpisode.pub_date);
    return date ? sameCalendarDay(date, bogotaCalendarDay(now)) : false;
  }, [nearestEpisode, now]);

  const sortedEpisodes = useMemo(() => {
    const next = [...episodes];
    next.sort((a, b) => {
      const diff = episodeTimestamp(a) - episodeTimestamp(b);
      return sortOrder === "oldest" ? diff : -diff;
    });
    return next;
  }, [episodes, sortOrder]);

  const latestEpisode = useMemo(
    () => [...episodes].sort((a, b) => episodeTimestamp(b) - episodeTimestamp(a))[0] ?? null,
    [episodes],
  );

  const oldestEpisode = useMemo(
    () => [...episodes].sort((a, b) => episodeTimestamp(a) - episodeTimestamp(b))[0] ?? null,
    [episodes],
  );

  const resumeEpisode = useMemo(() => {
    const savedId = readStored(lastEpisodeKey(slug));
    return episodes.find((episode) => episode.id === savedId) ?? null;
  }, [episodes, slug]);

  const playEpisode = async (episode: ExternalPodcastEpisode) => {
    const audio = audioRef.current;
    if (!audio) return;

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
    audio.load();

    audio.addEventListener(
      "loadedmetadata",
      () => {
        if (saved > 0 && (!audio.duration || saved < audio.duration - 5)) {
          audio.currentTime = saved;
        }
      },
      { once: true },
    );

    await audio.play().catch(() => setPlaying(false));
    saveProgress(slug, episode.id, saved);
  };

  const playNext = () => {
    if (!current) return;
    const list = playbackMode === "series" ? sortedEpisodes : episodes;
    const index = list.findIndex((episode) => episode.id === current.id);
    const next = list[index + 1];
    if (next) void playEpisode(next);
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
            {podcast.image_url && (
              <img
                src={podcast.image_url}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-center opacity-42"
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.98)_0%,rgba(5,5,5,.88)_46%,rgba(5,5,5,.40)_75%,rgba(5,5,5,.72)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05)_0%,rgba(5,5,5,.18)_58%,rgba(5,5,5,.98)_100%)]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#050505]/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F2D27A] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {podcast.category || "Podcast católico"}
              </div>

              <h1 className="mt-5 max-w-[21rem] font-display text-[2.55rem] font-semibold leading-[0.9] tracking-[-0.025em] text-[#F2D27A]">
                {podcast.title}
              </h1>
              {podcast.author && (
                <p className="mt-3 text-sm font-medium text-[#F8F5EA]/80">{podcast.author}</p>
              )}
              <p className="mt-4 max-w-[20rem] line-clamp-5 text-[13px] leading-relaxed text-[#F8F5EA]/62">
                {podcast.description}
              </p>

              <div className="mt-5 grid gap-2.5 text-[12px] text-[#F8F5EA]/68">
                <span className="inline-flex items-center gap-2.5">
                  <Headphones className="h-4.5 w-4.5 text-[#D4AF37]" />
                  {episodes.length} episodios disponibles
                </span>
                {playbackMode === "daily" && nearestEpisode && (
                  <span className="inline-flex items-center gap-2.5">
                    <CalendarDays className="h-4.5 w-4.5 text-[#D4AF37]" />
                    {nearestMatchesToday ? "Episodio para hoy" : `Fecha más cercana: ${formatDate(nearestEpisode.pub_date)}`}
                  </span>
                )}
                {playbackMode === "series" && latestEpisode && (
                  <span className="inline-flex items-center gap-2.5">
                    <CalendarDays className="h-4.5 w-4.5 text-[#D4AF37]" />
                    Serie disponible desde {formatDate(oldestEpisode?.pub_date || latestEpisode.pub_date)}
                  </span>
                )}
              </div>

              {playbackMode === "daily" && nearestEpisode && (
                <button
                  type="button"
                  onClick={() => void playEpisode(nearestEpisode)}
                  className="mt-5 inline-flex min-h-12 w-full max-w-[20rem] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-6 py-3 text-sm font-black text-[#050505] shadow-[0_12px_30px_rgba(212,175,55,0.25)]"
                >
                  {current?.id === nearestEpisode.id && playing ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current" />
                  )}
                  {nearestMatchesToday ? "Escuchar episodio de hoy" : "Escuchar episodio"}
                </button>
              )}

              {playbackMode === "series" && (resumeEpisode || oldestEpisode) && (
                <div className="mt-5 w-full max-w-[20rem] space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = resumeEpisode || oldestEpisode;
                      if (target) void playEpisode(target);
                    }}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-6 py-3 text-sm font-black text-[#050505] shadow-[0_12px_30px_rgba(212,175,55,0.25)]"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    {resumeEpisode ? "Continuar escuchando" : "Comenzar desde el inicio"}
                  </button>
                  {latestEpisode && (
                    <button
                      type="button"
                      onClick={() => void playEpisode(latestEpisode)}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/65 px-5 py-2.5 text-sm font-bold text-[#F2D27A]"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Escuchar el más reciente
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="-mx-4 border-b border-[#D4AF37]/15 bg-[#080808] px-4">
            <div className="grid grid-cols-2">
              <button
                type="button"
                onClick={() => setTab("episodes")}
                className={`border-b-2 px-2 py-3 text-sm font-semibold ${
                  tab === "episodes"
                    ? "border-[#D4AF37] text-[#F2D27A]"
                    : "border-transparent text-[#F8F5EA]/48"
                }`}
              >
                Episodios
              </button>
              <button
                type="button"
                onClick={() => setTab("about")}
                className={`border-b-2 px-2 py-3 text-sm font-semibold ${
                  tab === "about"
                    ? "border-[#D4AF37] text-[#F2D27A]"
                    : "border-transparent text-[#F8F5EA]/48"
                }`}
              >
                Acerca de la serie
              </button>
            </div>
          </div>

          {tab === "episodes" ? (
            <section className="pt-5">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">
                    {podcast.category || "Podcast"}
                  </p>
                  <h2 className="font-display text-[2rem] font-semibold leading-none">Todos los episodios</h2>
                </div>
                <span className="text-xs text-[#F8F5EA]/42">{episodes.length} disponibles</span>
              </div>

              {playbackMode === "series" && (
                <div className="mb-4 grid grid-cols-2 rounded-full border border-[#D4AF37]/20 bg-[#0A0A0A] p-1">
                  <button
                    type="button"
                    onClick={() => setSortOrder("newest")}
                    className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                      sortOrder === "newest" ? "bg-[#D4AF37] text-[#050505]" : "text-[#F8F5EA]/55"
                    }`}
                  >
                    Más recientes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortOrder("oldest")}
                    className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                      sortOrder === "oldest" ? "bg-[#D4AF37] text-[#050505]" : "text-[#F8F5EA]/55"
                    }`}
                  >
                    Más antiguos
                  </button>
                </div>
              )}

              <div className="space-y-3 pb-28">
                {(playbackMode === "series" ? sortedEpisodes : episodes).map((episode) => {
                  const active = current?.id === episode.id;
                  return (
                    <article
                      key={episode.id}
                      className={`flex items-center gap-3 rounded-[1.25rem] border p-3 transition ${
                        active
                          ? "border-[#D4AF37]/65 bg-[#D4AF37]/[0.08]"
                          : "border-white/10 bg-[#0A0A0A]"
                      }`}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.95rem] border border-[#D4AF37]/25 bg-[#111]">
                        {episode.image_url || podcast.image_url ? (
                          <img
                            src={episode.image_url || podcast.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Headphones className="h-7 w-7 text-[#D4AF37]" strokeWidth={1.45} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#D4AF37]">{formatDate(episode.pub_date)}</p>
                        <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-[#F8F5EA]">
                          {episode.title}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#F8F5EA]/45">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatExternalDuration(episode.duration_seconds)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void playEpisode(episode)}
                        aria-label={`${active && playing ? "Pausar" : "Reproducir"} ${episode.title}`}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                          active
                            ? "border-[#D4AF37] bg-[#D4AF37] text-[#050505]"
                            : "border-[#D4AF37]/60 text-[#F2D27A]"
                        }`}
                      >
                        {active && playing ? (
                          <Pause className="h-5 w-5 fill-current" />
                        ) : (
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="pb-28 pt-6">
              <div className="rounded-[1.4rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-5">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Info className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">Sobre este podcast</span>
                </div>
                <h2 className="mt-4 font-display text-2xl text-[#F8F5EA]">{podcast.title}</h2>
                {podcast.author && <p className="mt-2 text-sm text-[#F2D27A]/80">{podcast.author}</p>}
                <p className="mt-3 text-sm leading-7 text-[#F8F5EA]/62">{podcast.description}</p>
              </div>
            </section>
          )}
        </>
      )}

      {current && (
        <div className="fixed inset-x-0 bottom-[76px] z-[9997] px-3 xl:bottom-5">
          <div className="mx-auto max-w-[430px] rounded-[1.15rem] border border-[#D4AF37]/40 bg-[#070809]/96 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.58)] backdrop-blur-xl md:max-w-3xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void playEpisode(current)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] text-[#050505]"
                aria-label={playing ? "Pausar audio" : "Reproducir audio"}
              >
                {playing ? (
                  <Pause className="h-4.5 w-4.5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">
                      {podcast?.title || "Podcast"}
                    </p>
                    <p className="truncate text-[13px] font-semibold text-[#F8F5EA]">{current.title}</p>
                  </div>
                  <Volume2 className="h-4 w-4 shrink-0 text-[#F2D27A]/70" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-8 text-[9px] text-[#F8F5EA]/38">{formatClock(currentTime)}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[9px] text-[#F8F5EA]/38">{formatClock(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PodcastLayout>
  );
}
