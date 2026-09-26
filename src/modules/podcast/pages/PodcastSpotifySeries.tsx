import { Navigate, useParams } from "react-router-dom";
import { getExternalPodcastCatalogItem } from "@/modules/podcast/services/externalPodcastService";

export default function PodcastSpotifySeries() {
  const { slug = "" } = useParams();
  const podcast = getExternalPodcastCatalogItem(slug);

  if (!podcast) {
    return <Navigate to="/podcast" replace />;
  }

  return <Navigate to={`/podcast/rss/${podcast.slug}`} replace />;
}
