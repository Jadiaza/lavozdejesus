import {
  Clock3,
  Headphones,
  Pause,
  Play,
  RefreshCw,
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
const PODCAST_HERO_BG =
  "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/modulos/consagraciones/san-miguel/imagenes/dias/dia-03.webp";
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

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-40 pt-[max(2.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-7 lg:px-8 xl:pb-12">
        <header className="flex items-start justify-between gap-3">
          <Logo size="sm" />
          <div className="max-w-[145px] text-right sm:max-w-none">
            <p className="font-serif text-[12px] italic leading-tight text-gold sm:text-base">
              “Tu Palabra ilumina mi camino”
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-foreground/45 sm:text-[10px]">
              Salmo 119, 105
            </p>
          </div>
        </header>

        <section className="pb-5 pt-6 sm:pb-7 sm:pt-8">
          <h1 className="font-display text-[clamp(3.15rem,14vw,4.6rem)] font-semibold leading-[0.82] tracking-[-0.025em]">
            Podcast
          </h1>
          <p className="mt-4 text-[15px] text-foreground/66 sm:text-lg">Escucha y fortalece tu fe.</p>
        </section>

        {loading && (
          <section className="flex min-h-[300px] items-center justify-center rounded-[26px] border border-gold/15 bg-black/25">
            <div className="text-center text-foreground/60">
              <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-gold" />
              <p>Cargando enseñanzas...</p>
            </div>
          </section>
        )}

        {!loading && error && (
          <section className="rounded-[26px] border border-gold/20 bg-black/35 p-7 text-center">
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
            <section className="mb-3 mt-1 flex items-center gap-3">
              <Star className="h-6 w-6 shrink-0 fill-gold text-gold" />
              <h2 className="font-serif text-[28px] font-semibold leading-none sm:text-3xl">Serie destacada</h2>
            </section>

            <section className="relative min-h-[405px] overflow-hidden rounded-[28px] border border-gold/45 bg-[#080909] shadow-deep sm:min-h-[390px]">
              <img
                src={PODCAST_HERO_BG}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-[0.72] sm:object-center sm:opacity-[0.64]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,5,6,.98)_0%,rgba(4,5,6,.90)_42%,rgba(4,5,6,.42)_72%,rgba(4,5,6,.62)_100%)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,5,6,.12)_0%,rgba(4,5,6,.18)_38%,rgba(4,5,6,.93)_100%)]" />
              <div className="pointer-events-none absolute -right-10 top-12 h-60 w-60 rounded-full bg-gold/[0.10] blur-3xl" />

              <div className="relative z-10 flex min-h-[405px] flex-col p-5 sm:min-h-[390px] sm:p-7">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/25 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Serie espiritual · Consagración
                </div>

                <div className="mt-5 max-w-[78%] sm:max-w-[62%]">
                  <h3 className="font-display text-[clamp(2rem,8.5vw,3.25rem)] font-semibold leading-[0.9] tracking-[-0.02em] text-gold">
                    33 Días con los Santos Arcángeles
                  </h3>
                  <p className="mt-3 text-[13px] font-medium leading-snug text-foreground/90 sm:text-base">
                    {series.subtitle || "San Miguel · San Gabriel · San Rafael"}
                  </p>
                  <p className="mt-3 line-clamp-3 max-w-[95%] text-[12px] leading-relaxed text-foreground/70 sm:text-sm">
                    {series.description}
                  </p>
                </div>

                <div className="mt-auto max-w-[95%] sm:max-w-xl">
                  <div className="mb-4 flex items-center gap-4 text-[11px] text-foreground/72 sm:text-xs">
                    <span className="inline-flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-gold" />
                      {episodes.length} enseñanzas
                    </span>
                    <span>{series.duration_days} días</span>
                  </div>

                  {resumeEpisode && (
                    <>
                      <button
                        type="button"
                        onClick={() => void playEpisode(resumeEpisode)}
                        className="inline-flex min-h-11 w-full max-w-[295px] items-center justify-center gap-3 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-bold text-black shadow-gold transition hover:brightness-110"
                      >
                        {currentEpisode?.id === resumeEpisode.id && isPlaying ? (
                          <Pause className="h-4.5 w-4.5 fill-current" />
                        ) : (
                          <Play className="h-4.5 w-4.5 fill-current" />
                        )}
                        {resumeSeconds > 5 ? "Continuar escuchando" : "Comenzar a escuchar"}
                      </button>

                      <div className="mt-3 flex max-w-[330px] items-center gap-2.5 text-[10px] text-foreground/70 sm:text-xs">
                        <span className="whitespace-nowrap">Día {resumeEpisode.day_number} de {series.duration_days}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-gold transition-[width]"
                            style={{ width: `${resumePercent}%` }}
                          />
                        </div>
                        <span>{resumePercent}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Headphones className="h-6 w-6 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold/70">Consagración</p>
                    <h2 className="whitespace-nowrap font-serif text-[25px] font-semibold leading-tight sm:text-3xl">Todos los episodios</h2>
                  </div>
                </div>
                <span className="shrink-0 text-right text-[10px] leading-tight text-foreground/42 sm:text-xs">
                  {episodes.length}<br className="sm:hidden" /> disponibles
                </span>
              </div>

              <div className="grid gap-2.5 md:grid-cols-2">
                {episodes.map((episode) => {
                  const active = currentEpisode?.id === episode.id;
                  return (
                    <article
                      key={episode.id}
                      className={`group flex min-h-[96px] items-center gap-3 rounded-[22px] border px-3 py-2.5 transition sm:min-h-[104px] sm:px-4 ${
                        active
                          ? "border-gold/55 bg-gold/[0.075] shadow-gold"
                          : "border-white/10 bg-black/35 hover:border-gold/25 hover:bg-black/50"
                      }`}
                    >
                      <div className="relative flex h-[66px] w-[66px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-gold/18 bg-[radial-gradient(circle_at_45%_35%,rgba(212,165,76,.32),rgba(8,9,11,.96)_72%)] sm:h-[74px] sm:w-[74px]">
                        <Headphones className="h-8 w-8 text-gold/80 sm:h-9 sm:w-9" strokeWidth={1.7} />
                        <span className="absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/85 px-1 text-[9px] font-bold text-gold">
                          {episode.day_number}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="text-[11px] font-semibold text-gold/85">Día {episode.day_number}</p>
                        <h3 className="mt-0.5 line-clamp-2 text-[14px] font-semibold leading-[1.22] text-foreground sm:text-[15px]">
                          {episode.title}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-foreground/46 sm:text-[11px]">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatEpisodeDuration(episode)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void playEpisode(episode)}
                        aria-label={`${active && isPlaying ? "Pausar" : "Reproducir"} día ${episode.day_number}: ${episode.title}`}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition sm:h-12 sm:w-12 ${
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
          <div className="mx-auto max-w-[430px] overflow-hidden rounded-[20px] border border-gold/35 bg-[rgba(6,7,9,.97)] px-3 py-2.5 shadow-deep backdrop-blur-xl sm:max-w-3xl sm:px-4 sm:py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void playEpisode(currentEpisode)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-black shadow-gold sm:h-12 sm:w-12"
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
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold/78">
                      Día {currentEpisode.day_number}
                    </p>
                    <p className="truncate text-[13px] font-semibold sm:text-sm">{currentEpisode.title}</p>
                  </div>
                  <Volume2 className="h-4 w-4 shrink-0 text-gold/70" />
                </div>

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="w-8 text-[9px] text-foreground/42">{formatClock(currentTime)}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-gold transition-[width]"
                      style={{ width: `${currentPercent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[9px] text-foreground/42">{formatClock(duration)}</span>
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
