import {
  CalendarDays,
  ChevronRight,
  Headphones,
  Play,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cathedralBg from "@/assets/cathedral-bg.jpg";
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
import {
  getConsecrationPodcast,
  type PodcastSeries,
} from "@/modules/podcast/services/podcastService";
import { EXTERNAL_PODCASTS } from "@/modules/podcast/services/externalPodcastService";
import "@/modules/podcast/podcast-home.css";

export default function PodcastHome() {
  const [series, setSeries] = useState<PodcastSeries | null>(null);
  const [availableEpisodes, setAvailableEpisodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getConsecrationPodcast();
      setSeries(data.series);
      setAvailableEpisodes(data.episodes.length);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los podcasts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <PodcastLayout>
      <section className="pb-5 pt-6">
        <h1 className="font-display text-[3.35rem] font-semibold leading-[0.9] tracking-[-0.03em] text-[#F8F5EA]">
          Podcast
        </h1>
        <p className="mt-3 text-[1.05rem] text-[#F8F5EA]/62">Escucha y fortalece tu fe.</p>
      </section>

      {loading && (
        <section className="flex min-h-[18rem] items-center justify-center rounded-[1.35rem] border border-[#D4AF37]/20 bg-[#0A0A0A]">
          <div className="text-center text-[#F8F5EA]/55">
            <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-[#D4AF37]" />
            <p className="text-sm">Cargando series...</p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="rounded-[1.35rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-7 text-center">
          <Headphones className="mx-auto h-10 w-10 text-[#D4AF37]" />
          <h2 className="mt-4 font-display text-2xl">No pudimos cargar la serie propia</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#F8F5EA]/55">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-5 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-5 py-2.5 text-sm font-bold text-[#050505]"
          >
            Reintentar
          </button>
        </section>
      )}

      {!loading && series && (
        <>
          <section className="mb-3 mt-1 flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
              Producción LVJ
            </div>
            <span className="text-[11px] text-[#F8F5EA]/38">LVJPRAYER</span>
          </section>

          <Link to="/podcast/santos-arcangeles-33-dias" className="podcast-feature-card group">
            <div className="podcast-feature-cover">
              <img src={cathedralBg} alt="33 Días con los Santos Arcángeles" />
              <div className="absolute inset-x-2 bottom-2 z-10 text-center">
                <span className="font-display text-[1rem] leading-none text-[#F2D27A]">33 Días</span>
              </div>
            </div>

            <div className="podcast-feature-content">
              <span className="podcast-eyebrow">
                <Sparkles className="h-3 w-3" />
                Serie espiritual
              </span>
              <h2 className="podcast-feature-title">33 Días con los Santos Arcángeles</h2>
              <p className="podcast-feature-subtitle">
                {series.subtitle || "San Miguel · San Gabriel · San Rafael"}
              </p>
              <div className="podcast-feature-meta">
                <span>
                  <Headphones className="h-3.5 w-3.5 text-[#D4AF37]" />
                  {availableEpisodes} enseñanzas
                </span>
                <span>
                  <CalendarDays className="h-3.5 w-3.5 text-[#D4AF37]" />
                  {series.duration_days} días
                </span>
              </div>
              <span className="podcast-feature-action">
                <Play className="h-4 w-4 fill-current" />
                Ver serie
              </span>
            </div>
          </Link>
        </>
      )}

      <section className="mt-7 pb-3">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]/72">
              Biblioteca católica
            </p>
            <h2 className="mt-1 font-display text-2xl text-[#F8F5EA]">Podcasts recomendados</h2>
          </div>
          <span className="text-[11px] text-[#F8F5EA]/38">{EXTERNAL_PODCASTS.length} fuentes RSS</span>
        </div>

        <div className="podcast-list">
          {EXTERNAL_PODCASTS.map((podcast, index) => (
            <Link
              key={podcast.slug}
              to={`/podcast/rss/${podcast.slug}`}
              className="podcast-list-card"
              aria-label={`Abrir ${podcast.title}`}
            >
              <div className="podcast-list-cover relative">
                <Headphones className="h-7 w-7" strokeWidth={1.35} />
                <span className="absolute bottom-1.5 right-1.5 rounded-full bg-[#050505]/85 px-1.5 py-0.5 text-[9px] font-bold text-[#D4AF37]">
                  {index + 1}
                </span>
              </div>
              <div className="podcast-list-copy">
                <h3>{podcast.title}</h3>
                <p>{podcast.subtitle}</p>
                <small>
                  <Headphones className="h-3 w-3" />
                  {podcast.category} · Reproducción en LVJPRAYER
                </small>
              </div>
              <span className="podcast-list-action" aria-hidden="true">
                <ChevronRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PodcastLayout>
  );
}
