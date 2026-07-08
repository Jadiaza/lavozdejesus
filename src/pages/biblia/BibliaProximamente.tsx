import { Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { BibliaLayout } from "./BibliaLayout";

const sectionLabels: Record<string, string> = {
  buscar: "Buscar",
  comparar: "Comparar versiones",
  planes: "Plan de lectura",
  favoritos: "Favoritos",
  notas: "Notas",
  marcadores: "Marcadores",
  concordancia: "Concordancia",
  personajes: "Personajes",
  lugares: "Lugares",
  mapas: "Mapas",
  cronologias: "Cronologías",
  audio: "Audio Biblia",
  configuracion: "Configuración",
};

export default function BibliaProximamente({ title }: { title?: string }) {
  const { section } = useParams();
  const displayTitle = title ?? sectionLabels[section ?? ""] ?? "Biblia";

  return (
    <BibliaLayout title={displayTitle}>
      <div className="glass gold-border rounded-3xl p-8 text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-gold" />
        <div className="font-display mb-1 text-2xl">{displayTitle}</div>
        <p className="text-sm text-foreground/70">
          Este módulo llega en la próxima fase. Fase 1 incluye lectura e importador.
        </p>
      </div>
    </BibliaLayout>
  );
}
