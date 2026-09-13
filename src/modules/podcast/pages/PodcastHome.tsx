import {
  Clock3,
  Headphones,
  Pause,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BottomNav } from "@/components/lvdj/BottomNav";
import { Logo } from "@/components/lvdj/Logo";
import {
  formatEpisodeDuration,
  getConsecrationPodcast,
  type PodcastEpisode,
  type PodcastSeries,
} from "@/modules/podcast/services/podcastService";

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
    // La reproducción continúa aunque el almacenamiento local no esté disponible.
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
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const PodcastHome = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [series, setSeries] = useState<PodcastSeries | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumeEpisodeId, setResumeEpisodeId] = useState("");
  const [resumeSeconds, setResumeSeconds] = useState(0);

  const loadPodcast = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getConsecrationPodcast();
      setSeries(data.series);
      setEpisodes(data.episodes);

      const lastId = getLastEpisodeId();
      const lastEpisode = data.episodes.find((episode) => episode.id === lastId);
      const resumeEpisode = lastEpisode ?? data.episodes[0] ?? null;

      if (resumeEpisode) {
        setResumeEpisodeId(resumeEpisode.id);
        setResumeSeconds(readSavedPosition(resumeEpisode.id));
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar los audios.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPodcast();
  }, []);

  const resumeEpisode = useMemo(
    () =>
      episodes.find((episode) => episode.id === resumeEpisodeId) ??
      episodes[0] ??
      null,
    [episodes, resumeEpisodeId],
  );

  const resumeDuration = resumeEpisode
    ? resumeEpisode.duration_seconds || resumeEpisode.estimated_minutes * 60
    : 0;
  const resumePercent = resumeDuration
    ? Math.min(100, Math.round((resumeSeconds / resumeDuration) * 100))
    : 0;

  const playEpisode = async (episode: PodcastEpisode) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentEpisode?.id === episode.id) {
      if (audio.paused) {
        try {
          await audio.play();
        } catch {
          setIsPlaying(false);
        }
      } else {
        audio.pause();
      }
      return;
    }

    const saved = readSavedPosition(episode.id);
    setCurrentEpisode(episode);
    setResumeEpisodeId(episode.id);
    setResumeSeconds(saved);
    setCurrentTime(saved);
    setDuration(episode.duration_seconds || 0);

    audio.src = episode.audio_url;
    audio.load();

    const applySavedPosition = () => {
      const usableDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (saved > 0 && (!usableDuration || saved < usableDuration - 5)) {
        audio.currentTime = saved;
      }
    };

    applySavedPosition();
    audio.addEventListener("loadedmetadata", applySavedPosition, { once: true });

    try {
      await audio.play();
      savePosition(episode.id, saved);
    } catch {
      setIsPlaying(false);
    }
  };

  const playNextEpisode = () => {
    if (!currentEpisode) return;
    const index = episodes.findIndex((episode) => episode.id === currentEpisode.id);
    const next = episodes[index + 1];
    if (next) void playEpisode(next);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    const nextTime = audio.currentTime || 0;
    setCurrentTime(nextTime);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : currentEpisode.duration_seconds || 0);
    setResumeEpisodeId(currentEpisode.id);
    setResumeSeconds(nextTime);
    savePosition(currentEpisode.id, nextTime);
  };

  const currentPercent = duration
    ? Math.min(100, Math.round((currentTime / duration) * 100))
    : 0;

  return (
    <div className="lvj-sacred-page min-h-screen bg-background text-foreground">
      <div className="lvj-sacred-backdrop" />

      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
        }}
        onEnded={playNextEpisode}
      />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-44 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 xl:pb-12">
        <header className="flex items-center justify-between gap-4">
          <Logo size="md" />
          <div className="hidden text-right sm:block">
            <p className="font-serif text-lg italic text-gold">La fe también se escucha</p>
            <p className="text-xs uppercase tracking-[0.24em] text-foreground/45">La Voz de Jesús</p>
          </div>
        </header>

        <section className="pb-5 pt-7 sm:pt-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold/80">
            Escucha · medita · vive
          </p>
          <h1 className="font-display text-5xl font-semibold leading-none sm:text-7xl">Podcast</h1>
          <p className="mt-3 text-base text-foreground/65 sm:text-lg">Escucha y fortalece tu fe.</p>
        </section>

        {loading && (
          <section className="flex min-h-[360px] items-center justify-center rounded-[28px] border border-gold/15 bg-black/25">
            <div className="text-center text-foreground/60">
              <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-gold" />
              <p>Cargando enseñanzas...</p>
            </div>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-[28px] border border-gold/20 bg-black/35 p-7 text-center">
            <Headphones className="mx-auto h-10 w-10 text-gold" />
            <h2 className="mt-4 font-serif text-2xl font-semibold">No pudimos cargar los audios</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-foreground/60">{error}</p>
            <button type="button" onClick={() => void loadPodcast()} className="lvj-sacred-button mt-5">
              Reintentar
            </button>
          </section>
        )}

        {!loading && !error && series && (
          <>
            <section className="mb-4 mt-2 flex items-center gap-3">
              <Star className="h-6 w-6 fill-gold text-gold" />
              <h2 className="font-serif text-3xl font-semibold">Serie destacada</h2>
            </section>

            <section className="relative overflow-hidden rounded-[30px] border border-gold/45 bg-[linear-gradient(135deg,rgba(24,20,14,.96),rgba(4,5,7,.98))] p-5 shadow-deep sm:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-full w-2/5 bg-[radial-gradient(circle_at_70%_45%,rgba(212,165,76,.2),transparent_58%)]" />
              <Shield className="pointer-events-none absolute -bottom-12 -right-7 h-64 w-64 text-gold/[0.06]" strokeWidth={1} />
              <img
                src="/icons/podcast.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-6 hidden h-24 w-24 opacity-20 sm:block"
              />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                  <Sparkles className="h-3.5 w-3.5" />
                  Serie espiritual · Consagración
                </div>

                <h3 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[0.95] text-gold sm:text-6xl">
                  33 Días con los Santos Arcángeles
                </h3>
                <p className="mt-3 text-sm font-medium text-foreground/75 sm:text-base">
                  {series.subtitle || "San Miguel · San Gabriel · San Rafael"}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/65 sm:text-base">
                  {series.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-foreground/60 sm:text-sm">
                  <span className="inline-flex items-center gap-2">
                    <Headphones className="h-4 w-4 text-gold" />
                    {episodes.length} enseñanzas disponibles
                  </span>
                  <span>{series.duration_days} días de itinerario</span>
                </div>

                {resumeEpisode && (
                  <div className="mt-6 max-w-xl">
                    <button
                      type="button"
                      onClick={() => void playEpisode(resumeEpisode)}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-gold px-6 py-3 font-bold text-black shadow-gold transition hover:brightness-110 sm:w-auto"
                    >
                      {currentEpisode?.id === resumeEpisode.id && isPlaying ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="h-5 w-5 fill-current" />
                      )}
                      {resumeSeconds > 5 ? "Continuar escuchando" : "Comenzar a escuchar"}
                    </button>

                    <div className="mt-4 flex items-center gap-3 text-xs text-foreground/65">
                      <span>Día {resumeEpisode.day_number} de {series.duration_days}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-gold transition-[width]"
                          style={{ width: `${resumePercent}%` }}
                        />
                      </div>
                      <span>{resumePercent}%</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Headphones className="h-7 w-7 text-gold" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/70">Consagración</p>
                    <h2 className="font-serif text-3xl font-semibold">Todos los episodios</h2>
                  </div>
                </div>
                <span className="text-xs text-foreground/45">{episodes.length} disponibles</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {episodes.map((episode) => {
                  const active = currentEpisode?.id === episode.id;
                  return (
                    <article
                      key={episode.id}
                      className={`group flex items-center gap-3 rounded-[22px] border p-3 transition sm:p-4 ${
                        active
                          ? "border-gold/55 bg-gold/[0.08] shadow-gold"
                          : "border-white/10 bg-black/35 hover:border-gold/25 hover:bg-black/50"
                      }`}
                    >
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gold/15 bg-[radial-gradient(circle_at_50%_35%,rgba(212,165,76,.3),rgba(10,10,12,.95)_68%)] sm:h-20 sm:w-20">
                        <img src="/icons/podcast.png" alt="" className="h-9 w-9 opacity-75 sm:h-11 sm:w-11" />
                        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-gold">
                          {episode.day_number}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gold/80">Día {episode.day_number}</p>
                        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground sm:text-base">
                          {episode.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-foreground/50 sm:text-xs">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatEpisodeDuration(episode)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void playEpisode(episode)}
                        aria-label={`${active && isPlaying ? "Pausar" : "Reproducir"} día ${episode.day_number}: ${episode.title}`}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                          active
                            ? "border-gold bg-gold text-black"
                            : "border-gold/55 text-gold hover:bg-gold hover:text-black"
                        }`}
                      >
                        {active && isPlaying ? (
                          <Pause className="h-5 w-5 fill-current" />
                        ) : (
                          <Play className="ml-0.5 h-5 w-5 fill-current" />
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>

              {episodes.length === 0 && (
                <div className="rounded-[24px] border border-gold/15 bg-black/30 p-7 text-center text-sm text-foreground/55">
                  Todavía no hay enseñanzas de audio publicadas para esta serie.
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {currentEpisode && (
        <div className="fixed inset-x-0 bottom-[76px] z-[9997] px-3 xl:bottom-5">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-[22px] border border-gold/35 bg-[rgba(7,8,10,.96)] p-3 shadow-deep backdrop-blur-xl sm:p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void playEpisode(currentEpisode)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-black shadow-gold"
                aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold/75">
                      Día {currentEpisode.day_number}
                    </p>
                    <p className="truncate text-sm font-semibold">{currentEpisode.title}</p>
                  </div>
                  <Volume2 className="h-4 w-4 shrink-0 text-gold/70" />
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="w-9 text-[10px] text-foreground/45">{formatClock(currentTime)}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-gold transition-[width]"
                      style={{ width: `${currentPercent}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[10px] text-foreground/45">{formatClock(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeLabel="Podcast" />
    </div>
  );
};

export default PodcastHome;
