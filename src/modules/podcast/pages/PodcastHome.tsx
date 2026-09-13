import { CalendarDays, Headphones, Play, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cathedralBg from "@/assets/cathedral-bg.jpg";
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
import {
  getConsecrationPodcast,
  type PodcastSeries,
} from "@/modules/podcast/services/podcastService";

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
        <section className="flex min-h-[22rem] items-center justify-center rounded-[1.6rem] border border-[#D4AF37]/20 bg-[#0A0A0A]">
          <div className="text-center text-[#F8F5EA]/55">
            <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-[#D4AF37]" />
            <p className="text-sm">Cargando series...</p>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="rounded-[1.6rem] border border-[#D4AF37]/20 bg-[#0A0A0A] p-7 text-center">
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
          <section className="mb-3 mt-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D4AF37]">
              Serie destacada
            </div>
          </section>

          <Link
            to="/podcast/santos-arcangeles-33-dias"
            className="group relative block min-h-[32rem] overflow-hidden rounded-[1.7rem] border border-[#D4AF37]/60 bg-[#070707] shadow-[0_22px_55px_rgba(0,0,0,0.5)]"
          >
            <img
              src={cathedralBg}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-40 transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.98)_0%,rgba(5,5,5,.90)_45%,rgba(5,5,5,.45)_72%,rgba(5,5,5,.78)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.06)_0%,rgba(5,5,5,.22)_52%,rgba(5,5,5,.96)_100%)]" />
            <div className="absolute -right-10 top-10 h-56 w-56 rounded-full bg-[#D4AF37]/12 blur-3xl" />

            <div className="relative z-10 flex min-h-[32rem] flex-col p-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#050505]/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F2D27A] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Serie espiritual
              </div>

              <div className="mt-7 max-w-[82%]">
                <h2 className="font-display text-[2.55rem] font-semibold leading-[0.9] tracking-[-0.025em] text-[#F2D27A]">
                  33 Días con los Santos Arcángeles
                </h2>
                <p className="mt-3 text-sm font-medium text-[#F8F5EA]/78">
                  {series.subtitle || "San Miguel · San Gabriel · San Rafael"}
                </p>
              </div>

              <div className="mt-auto">
                <div className="mb-5 grid max-w-[20rem] gap-2.5 text-[12px] text-[#F8F5EA]/68">
                  <span className="inline-flex items-center gap-2.5">
                    <Headphones className="h-4.5 w-4.5 text-[#D4AF37]" />
                    {availableEpisodes} enseñanzas disponibles
                  </span>
                  <span className="inline-flex items-center gap-2.5">
                    <CalendarDays className="h-4.5 w-4.5 text-[#D4AF37]" />
                    {series.duration_days} días de itinerario
                  </span>
                </div>

                <span className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#F2D27A] to-[#D4AF37] px-6 py-3 text-base font-black text-[#050505] shadow-[0_12px_30px_rgba(212,175,55,0.25)]">
                  <Play className="h-5 w-5 fill-current" />
                  Ver serie
                </span>
              </div>
            </div>
          </Link>

          <section className="mt-8 rounded-[1.35rem] border border-[#D4AF37]/18 bg-[#0A0A0A]/85 px-5 py-6 text-center">
            <Headphones className="mx-auto h-7 w-7 text-[#D4AF37]/75" />
            <p className="mt-3 font-display text-xl text-[#F8F5EA]">Nuevas series en preparación</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#F8F5EA]/48">
              Este espacio irá reuniendo nuevos contenidos de formación y vida espiritual.
            </p>
          </section>
        </>
      )}
    </PodcastLayout>
  );
}
