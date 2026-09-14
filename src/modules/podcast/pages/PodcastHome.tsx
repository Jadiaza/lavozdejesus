import {
  BookOpen,
  CalendarDays,
  Headphones,
  Play,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
import {
  getConsecrationPodcast,
  type PodcastSeries,
} from "@/modules/podcast/services/podcastService";
import {
  EXTERNAL_PODCASTS,
  getExternalPodcastMetadata,
} from "@/modules/podcast/services/externalPodcastService";
import "@/modules/podcast/podcast-home.css";

const CONSECRATION_COVER =
  "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/modulos/consagraciones/san-miguel/imagenes/dias/dia-03.webp";

export default function PodcastHome() {
  const [series, setSeries] = useState<PodcastSeries | null>(null);
  const [availableEpisodes, setAvailableEpisodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coverMap, setCoverMap] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getConsecrationPodcast();
      setSeries(data.series);
      setAvailableEpisodes(data.episodes.length);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar la producción LVJ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    let mounted = true;

    void Promise.allSettled(
      EXTERNAL_PODCASTS.map(async (podcast) => {
        const metadata = await getExternalPodcastMetadata(podcast.slug);
        return { slug: podcast.slug, image_url: metadata.image_url };
      }),
    ).then((results) => {
      if (!mounted) return;
      const next: Record<string, string> = {};
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.image_url) {
          next[result.value.slug] = result.value.image_url;
        }
      });
      setCoverMap(next);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PodcastLayout>
      <section className="pb-5 pt-6">
        <p className="text-[1.05rem] text-[#F8F5EA]/62">Escucha y fortalece tu fe.</p>
      </section>

      <section className="mb-3 mt-1 flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
          Producción LVJ
        </div>
        <span className="text-[11px] text-[#F8F5EA]/38">Serie destacada</span>
      </section>

      {loading && (
        <section className="podcast-feature-card podcast-feature-loading">
          <RefreshCw className="h-7 w-7 animate-spin text-[#D4AF37]" />
          <span>Cargando serie...</span>
        </section>
      )}

      {!loading && error && (
        <section className="rounded-[1.25rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-5 text-center">
          <Headphones className="mx-auto h-8 w-8 text-[#D4AF37]" />
          <p className="mt-3 text-sm text-[#F8F5EA]/55">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-5 py-2 text-xs font-bold text-[#050505]"
          >
            Reintentar
          </button>
        </section>
      )}

      {!loading && series && (
        <Link to="/podcast/santos-arcangeles-33-dias" className="podcast-feature-card group">
          <div className="podcast-feature-cover">
            <img src={CONSECRATION_COVER} alt="33 Días con los Santos Arcángeles" />
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
      )}

      <section className="mt-8 pb-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]/72">
              Biblioteca católica
            </p>
            <h2 className="mt-1 font-display text-[1.75rem] leading-none text-[#F8F5EA]">Para escuchar</h2>
          </div>
          <span className="text-[11px] text-[#F8F5EA]/38">{EXTERNAL_PODCASTS.length} podcasts</span>
        </div>

        <div className="podcast-shelf" aria-label="Podcasts recomendados">
          {EXTERNAL_PODCASTS.map((podcast, index) => {
            const cover = coverMap[podcast.slug];
            return (
              <Link
                key={podcast.slug}
                to={`/podcast/rss/${podcast.slug}`}
                className="podcast-tile"
                aria-label={`Abrir ${podcast.title}`}
              >
                <div className="podcast-tile-cover">
                  {cover ? (
                    <img
                      src={cover}
                      alt={`Carátula de ${podcast.title}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <>
                      <div className="podcast-tile-glow" />
                      {podcast.category === "Biblia" ? (
                        <BookOpen className="relative z-10 h-10 w-10 text-[#F2D27A]" strokeWidth={1.25} />
                      ) : (
                        <Headphones className="relative z-10 h-10 w-10 text-[#F2D27A]" strokeWidth={1.25} />
                      )}
                    </>
                  )}
                  <span className="podcast-tile-number">{index + 1}</span>
                </div>
                <h3>{podcast.title}</h3>
                <p>{podcast.subtitle}</p>
                <small>{podcast.category}</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-4 mt-2 rounded-[1.15rem] border border-[#D4AF37]/14 bg-[#0A0A0A]/82 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#111] text-[#D4AF37]">
            <Headphones className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[#F8F5EA]">Escucha sin salir de LVJPRAYER</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[#F8F5EA]/45">
              Abre cualquier podcast para ver su portada, episodios y reproductor interno.
            </p>
          </div>
        </div>
      </section>
    </PodcastLayout>
  );
}
