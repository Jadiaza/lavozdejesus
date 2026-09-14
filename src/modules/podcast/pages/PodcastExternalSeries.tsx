import { ArrowLeft, Clock3, Headphones, Pause, Play, RefreshCw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
import {
  formatExternalDuration,
  getExternalPodcast,
  type ExternalPodcast,
  type ExternalPodcastEpisode,
} from "@/modules/podcast/services/externalPodcastService";

const formatClock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
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

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    void getExternalPodcast(slug)
      .then((data) => {
        if (!mounted) return;
        setPodcast(data.podcast);
        setEpisodes(data.episodes);
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

  const playEpisode = async (episode: ExternalPodcastEpisode) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (current?.id === episode.id) {
      if (audio.paused) await audio.play().catch(() => undefined);
      else audio.pause();
      return;
    }

    setCurrent(episode);
    setCurrentTime(0);
    setDuration(episode.duration_seconds || 0);
    audio.src = episode.audio_url;
    audio.load();
    await audio.play().catch(() => setPlaying(false));
  };

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <PodcastLayout>
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio) return;
          setCurrentTime(audio.currentTime || 0);
          if (Number.isFinite(audio.duration)) setDuration(audio.duration);
        }}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
        }}
      />

      <div className="pt-4">
        <Link
          to="/podcast"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#D4AF37]"
        >
          <ArrowLeft className="h-4 w-4" />
          Podcast
        </Link>
      </div>

      {loading && (
        <div className="flex min-h-[22rem] items-center justify-center">
          <RefreshCw className="h-7 w-7 animate-spin text-[#D4AF37]" />
        </div>
      )}

      {!loading && error && (
        <section className="mt-5 rounded-[1.35rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-7 text-center">
          <Headphones className="mx-auto h-9 w-9 text-[#D4AF37]" />
          <h1 className="mt-4 font-display text-2xl">No pudimos cargar el podcast</h1>
          <p className="mt-2 text-sm text-[#F8F5EA]/55">{error}</p>
        </section>
      )}

      {!loading && !error && podcast && (
        <>
          <section className="mt-4 flex gap-4 rounded-[1.4rem] border border-[#D4AF37]/25 bg-[#0A0A0A] p-4">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[1rem] border border-[#D4AF37]/25 bg-[#111]">
              {podcast.image_url ? (
                <img src={podcast.image_url} alt={podcast.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Headphones className="h-9 w-9 text-[#D4AF37]" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">
                {podcast.category} · RSS
              </p>
              <h1 className="mt-1 font-display text-[1.75rem] leading-[0.95] text-[#F8F5EA]">
                {podcast.title}
              </h1>
              {podcast.author && <p className="mt-2 text-xs text-[#F8F5EA]/55">{podcast.author}</p>}
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#F8F5EA]/50">
                {podcast.description}
              </p>
            </div>
          </section>

          <div className="mb-3 mt-6 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[#F8F5EA]">Episodios</h2>
            <span className="text-xs text-[#F8F5EA]/40">{episodes.length} recientes</span>
          </div>

          <div className="space-y-2.5 pb-28">
            {episodes.map((episode) => {
              const active = current?.id === episode.id;
              return (
                <article
                  key={episode.id}
                  className={`flex items-center gap-3 rounded-[1rem] border p-3 ${
                    active ? "border-[#D4AF37]/55 bg-[#15120A]" : "border-white/8 bg-[#0B0C0E]"
                  }`}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[0.8rem] bg-[#111]">
                    {episode.image_url || podcast.image_url ? (
                      <img
                        src={episode.image_url || podcast.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Headphones className="h-6 w-6 text-[#D4AF37]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[#F8F5EA]">
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
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                      active ? "border-[#D4AF37] bg-[#D4AF37] text-black" : "border-[#D4AF37]/60 text-[#D4AF37]"
                    }`}
                    aria-label={`${active && playing ? "Pausar" : "Reproducir"} ${episode.title}`}
                  >
                    {active && playing ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="ml-0.5 h-4 w-4 fill-current" />
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}

      {current && (
        <div className="fixed inset-x-0 bottom-[76px] z-[9997] px-3 xl:bottom-5">
          <div className="mx-auto max-w-[430px] rounded-[1rem] border border-[#D4AF37]/35 bg-[#090A0D]/95 p-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void playEpisode(current)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-black"
              >
                {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-[#F8F5EA]">{current.title}</p>
                  <Volume2 className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="w-9 text-[10px] text-[#F8F5EA]/40">{formatClock(currentTime)}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="w-9 text-right text-[10px] text-[#F8F5EA]/40">{formatClock(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PodcastLayout>
  );
}
