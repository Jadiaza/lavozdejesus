import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ExternalLink,
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
import "@/modules/podcast/podcast-home.css";

const SPOTIFY_BIBLE_365_URL =
  "https://open.spotify.com/show/4y5hjQzj47wTLujQsyGdab?si=2iouVqm8RryYfbCC6mu-qA&utm_source=copy-link";

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
          <h2 className="mt-4 font-display text-2xl">No pudimos cargar el módulo</h2>
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

      {!loading && !error && series && (
        <>
          <section className="mb-3 mt-1 flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
              Serie destacada
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

          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]/72">
                  También puedes escuchar
                </p>
                <h2 className="mt-1 font-display text-2xl text-[#F8F5EA]">Otros podcasts</h2>
              </div>
            </div>

            <div className="podcast-list">
              <a
                href={SPOTIFY_BIBLE_365_URL}
                target="_blank"
                rel="noreferrer"
                className="podcast-list-card"
                aria-label="Abrir La Biblia Católica en 365 días en Spotify"
              >
                <div className="podcast-list-cover">
                  <BookOpen className="h-8 w-8" strokeWidth={1.35} />
                </div>
                <div className="podcast-list-copy">
                  <h3>La Biblia Católica en 365 días</h3>
                  <p>Recorrido diario por la Sagrada Escritura</p>
                  <small>
                    <Headphones className="h-3 w-3" />
                    Spotify · Podcast externo
                  </small>
                </div>
                <span className="podcast-list-action" aria-hidden="true">
                  <ExternalLink className="h-4 w-4" />
                </span>
              </a>

              <div className="podcast-list-card opacity-55" aria-disabled="true">
                <div className="podcast-list-cover">
                  <Headphones className="h-7 w-7" strokeWidth={1.35} />
                </div>
                <div className="podcast-list-copy">
                  <h3>Nuevas series LVJ</h3>
                  <p>Formación, oración y vida espiritual</p>
                  <small>Próximamente</small>
                </div>
                <span className="podcast-list-action" aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </PodcastLayout>
  );
}
