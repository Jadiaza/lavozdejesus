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
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
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
    // La reproducción sigue aunque localStorage no esté disponible.
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
    () =>
      sortOrder === "oldest"
        ? chronologicalEpisodes
        : [...chronologicalEpisodes].reverse(),
    [chronologicalEpisodes, sortOrder],
  );

  const firstEpisode = chronologicalEpisodes[0] ?? null;
  const latestEpisode = chronologicalEpisodes[chronologicalEpisodes.length - 1] ?? null;

  const resumeEpisode = useMemo(
    () => episodes.find((episode) => episode.id === resumeEpisodeId) ?? null,
    [episodes, resumeEpisodeId],
  );

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
    setCurrentTime(saved);
    setDuration(episode.duration_seconds || 0);

    audio.src = episode.audio_url;
    audio.load();

    const restore = () => {
      const total = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (saved > 0 && (!total || saved < total - 5)) audio.currentTime = saved;
    };

    audio.addEventListener("loadedmetadata", restore, { once: true });

    try {
      await audio.play();
      savePosition(episode.id, saved);
    } catch {
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (!currentEpisode) return;
    const index = chronologicalEpisodes.findIndex((episode) => episode.id === currentEpisode.id);
    const next = chronologicalEpisodes[index + 1];
    if (next) void playEpisode(next);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;
    const nextTime = audio.currentTime || 0;
    setCurrentTime(nextTime);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : currentEpisode.duration_seconds || 0);
    savePosition(currentEpisode.id, nextTime);
  };

  const progress = duration ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

  return (
    <PodcastLayout backTo="/podcast">
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
          <button
            type="button"
            onClick={() => void load()}
            className="mt-5 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-5 py-2.5 text-sm font-bold text-[#050505]"
          >
            Reintentar
          </button>
        </section>
      )}

      {!loading && !error && series && (
        <>
          <section className="relative -mx-4 min-h-[27rem] overflow-hidden bg-[#070707] px-4 pb-6 pt-6">
            <img
              src={CONSECRATION_COVER}
              alt="Carátula de 33 Días con los Santos Arcángeles"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-42"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.98)_0%,rgba(5,5,5,.88)_46%,rgba(5,5,5,.40)_75%,rgba(5,5,5,.72)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05)_0%,rgba(5,5,5,.18)_58%,rgba(5,5,5,.98)_100%)]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#050505]/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F2D27A] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Serie espiritual
              </div>

              <h1 className="mt-5 max-w-[21rem] font-display text-[2.55rem] font-semibold leading-[0.9] tracking-[-0.025em] text-[#F2D27A]">
                33 Días con los Santos Arcángeles
              </h1>
              <p className="mt-3 text-sm font-medium text-[#F8F5EA]/80">
                {series.subtitle || "San Miguel · San Gabriel · San Rafael"}
              </p>
              <p className="mt-4 max-w-[20rem] text-[13px] leading-relaxed text-[#F8F5EA]/62">
                {series.description}
              </p>

              <div className="mt-5 grid gap-2.5 text-[12px] text-[#F8F5EA]/68">
                <span className="inline-flex items-center gap-2.5">
                  <Headphones className="h-4.5 w-4.5 text-[#D4AF37]" />
                  {episodes.length} enseñanzas disponibles
                </span>
                <span className="inline-flex items-center gap-2.5">
                  <CalendarDays className="h-4.5 w-4.5 text-[#D4AF37]" />
                  {series.duration_days} días de itinerario
                </span>
              </div>

              {(firstEpisode || resumeEpisode) && (
                <div className="mt-5 w-full max-w-[20rem] space-y-2">
                  {resumeEpisode && readSavedPosition(resumeEpisode.id) > 5 && (
                    <button
                      type="button"
                      onClick={() => void playEpisode(resumeEpisode)}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-6 py-3 text-sm font-black text-[#050505] shadow-[0_12px_30px_rgba(212,175,55,0.25)]"
                    >
                      {currentEpisode?.id === resumeEpisode.id && isPlaying ? (
                        <Pause className="h-5 w-5 fill-current" />
                      ) : (
                        <Play className="h-5 w-5 fill-current" />
                      )}
                      Continuar escuchando
                    </button>
                  )}

                  {firstEpisode && (
                    <button
                      type="button"
                      onClick={() => void playEpisode(firstEpisode)}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/65 px-5 py-2.5 text-sm font-bold text-[#F2D27A]"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Reproducir primer capítulo
                    </button>
                  )}

                  {latestEpisode && (
                    <button
                      type="button"
                      onClick={() => void playEpisode(latestEpisode)}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/65 px-5 py-2.5 text-sm font-bold text-[#F2D27A]"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Reproducir capítulo más reciente
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
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">Consagración</p>
                  <h2 className="font-display text-[2rem] font-semibold leading-none">Todos los episodios</h2>
                </div>
                <span className="text-xs text-[#F8F5EA]/42">{episodes.length} disponibles</span>
              </div>

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

              <div className="space-y-3 pb-28">
                {sortedEpisodes.map((episode) => {
                  const active = currentEpisode?.id === episode.id;
                  const saved = readSavedPosition(episode.id);
                  const total = episode.duration_seconds || episode.estimated_minutes * 60;
                  const savedPercent = total ? Math.min(100, Math.round((saved / total) * 100)) : 0;

                  return (
                    <article
                      key={episode.id}
                      className={`flex items-center gap-3 rounded-[1.25rem] border p-3 transition ${
                        active
                          ? "border-[#D4AF37]/65 bg-[#D4AF37]/[0.08]"
                          : "border-white/10 bg-[#0A0A0A]"
                      }`}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.95rem] border border-[#D4AF37]/25 bg-[#080808]">
                        <img
                          src={CONSECRATION_COVER}
                          alt={`Carátula del episodio ${episode.day_number}: ${episode.title}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <span className="absolute bottom-1 right-1 rounded-full bg-[#050505]/92 px-1.5 py-0.5 text-[9px] font-bold text-[#F2D27A] shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                          {episode.day_number}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#D4AF37]">Día {episode.day_number}</p>
                        <h3 className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-[#F8F5EA]">
                          {episode.title}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#F8F5EA]/45">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatEpisodeDuration(episode)}
                        </div>
                        {savedPercent > 0 && (
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37]" style={{ width: `${savedPercent}%` }} />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => void playEpisode(episode)}
                        aria-label={`${active && isPlaying ? "Pausar" : "Reproducir"} día ${episode.day_number}: ${episode.title}`}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                          active
                            ? "border-[#D4AF37] bg-[#D4AF37] text-[#050505]"
                            : "border-[#D4AF37]/60 text-[#F2D27A]"
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
            </section>
          ) : (
            <section className="pt-6 pb-28">
              <div className="rounded-[1.4rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-5">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Info className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">Sobre esta serie</span>
                </div>
                <h2 className="mt-4 font-display text-2xl text-[#F8F5EA]">{series.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#F8F5EA]/62">{series.description}</p>
                {series.motto && (
                  <p className="mt-5 border-l-2 border-[#D4AF37]/70 pl-4 font-display text-xl italic text-[#F2D27A]">
                    {series.motto}
                  </p>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {currentEpisode && (
        <div className="fixed inset-x-0 bottom-[76px] z-[9997] px-3 xl:bottom-5">
          <div className="mx-auto max-w-[430px] rounded-[1.15rem] border border-[#D4AF37]/40 bg-[#070809]/96 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.58)] backdrop-blur-xl md:max-w-3xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void playEpisode(currentEpisode)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] text-[#050505]"
                aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
              >
                {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Día {currentEpisode.day_number}</p>
                    <p className="truncate text-[13px] font-semibold text-[#F8F5EA]">{currentEpisode.title}</p>
                  </div>
                  <Volume2 className="h-4 w-4 shrink-0 text-[#F2D27A]/70" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-8 text-[9px] text-[#F8F5EA]/38">{formatClock(currentTime)}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37]" style={{ width: `${progress}%` }} />
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