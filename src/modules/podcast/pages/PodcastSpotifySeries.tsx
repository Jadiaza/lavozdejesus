import { Headphones, Info, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import PodcastLayout from "@/modules/podcast/components/PodcastLayout";
import {
  getExternalPodcastCatalogItem,
  getSpotifyPodcastMetadata,
} from "@/modules/podcast/services/externalPodcastService";

export default function PodcastSpotifySeries() {
  const { slug = "" } = useParams();
  const podcast = getExternalPodcastCatalogItem(slug);
  const [cover, setCover] = useState("");

  useEffect(() => {
    if (!podcast?.spotify_show_id) return;
    let mounted = true;
    void getSpotifyPodcastMetadata(podcast.spotify_show_id)
      .then((data) => {
        if (mounted) setCover(data.image_url);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [podcast?.spotify_show_id]);

  if (!podcast || podcast.source !== "spotify" || !podcast.spotify_show_id) {
    return <Navigate to="/podcast" replace />;
  }

  const embedUrl = `https://open.spotify.com/embed/show/${encodeURIComponent(
    podcast.spotify_show_id,
  )}?utm_source=lvjprayer`;

  return (
    <PodcastLayout backTo="/podcast">
      <section className="relative -mx-4 min-h-[24rem] overflow-hidden bg-[#070707] px-4 pb-6 pt-6">
        {cover && (
          <img
            src={cover}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.98)_0%,rgba(5,5,5,.88)_48%,rgba(5,5,5,.52)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.06)_0%,rgba(5,5,5,.18)_58%,rgba(5,5,5,.98)_100%)]" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#050505]/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F2D27A] backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {podcast.category}
          </div>

          <h1 className="mt-5 max-w-[21rem] font-display text-[2.45rem] font-semibold leading-[0.92] tracking-[-0.025em] text-[#F2D27A]">
            {podcast.title}
          </h1>
          <p className="mt-3 text-sm font-medium text-[#F8F5EA]/80">{podcast.subtitle}</p>
          <p className="mt-4 max-w-[21rem] text-[13px] leading-relaxed text-[#F8F5EA]/62">
            Reflexiones y formación espiritual sobre el ministerio de liberación, el discernimiento y la vida cristiana.
          </p>

          <div className="mt-5 inline-flex items-center gap-2.5 text-[12px] text-[#F8F5EA]/68">
            <Headphones className="h-4.5 w-4.5 text-[#D4AF37]" />
            Escucha los episodios sin salir de LVJPRAYER
          </div>
        </div>
      </section>

      <section className="pb-28 pt-5">
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">
            Episodios
          </p>
          <h2 className="mt-1 font-display text-[2rem] font-semibold leading-none text-[#F8F5EA]">
            Hablemos de Exorcismos
          </h2>
        </div>

        <div className="overflow-hidden rounded-[1.25rem] border border-[#D4AF37]/22 bg-[#0A0A0A] p-2">
          <iframe
            src={embedUrl}
            title={`Reproductor de ${podcast.title}`}
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="block w-full rounded-[1rem]"
          />
        </div>

        <div className="mt-4 flex gap-3 rounded-[1.15rem] border border-[#D4AF37]/14 bg-[#0A0A0A]/82 px-4 py-3.5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />
          <p className="text-[11px] leading-relaxed text-[#F8F5EA]/48">
            La ficha y navegación pertenecen a LVJPRAYER. La reproducción del audio se realiza mediante el reproductor oficial de Spotify y conserva su atribución de origen.
          </p>
        </div>
      </section>
    </PodcastLayout>
  );
}
