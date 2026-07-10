import {
  BookOpen,
  CalendarCheck2,
  Columns3,
  Map,
  Music2,
  Search,
  Sparkles,
  Star,
  StickyNote,
} from "lucide-react";
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

const sectionIcon: Record<string, typeof Sparkles> = {
  buscar: Search,
  comparar: Columns3,
  planes: CalendarCheck2,
  favoritos: Star,
  notas: StickyNote,
  marcadores: Star,
  concordancia: Search,
  personajes: BookOpen,
  lugares: Map,
  mapas: Map,
  cronologias: CalendarCheck2,
  audio: Music2,
  configuracion: Sparkles,
};

export default function BibliaProximamente({ title }: { title?: string }) {
  const { section } = useParams();
  const displayTitle = title ?? sectionLabels[section ?? ""] ?? "Biblia";
  const Icon = sectionIcon[section ?? ""] ?? Sparkles;

  return (
    <BibliaLayout title={displayTitle}>
      <div className="rounded-[2rem] border border-[#D4AF37]/25 bg-[#111111] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <div className="font-display text-2xl text-[#F8F5EA]">{displayTitle}</div>
            <p className="text-sm text-[#C9C3B3]">
              Vista preparada para la siguiente fase del módulo Biblia.
            </p>
          </div>
        </div>

        {section === "comparar" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Biblia Platense / Straubinger", "Texto principal de lectura y notas."],
              ["Torres Amat", "Comparación histórica católica."],
              ["Scío", "Apoyo de estudio y referencia."],
              ["Reina-Valera", "Estudio comparativo", "Comparativo"],
            ].map(([name, desc, tag]) => (
              <div key={name} className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-4">
                {tag && (
                  <span className="mb-2 inline-flex rounded-full border border-[#D4AF37]/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]">
                    {tag}
                  </span>
                )}
                <h3 className="font-semibold text-[#F8F5EA]">{name}</h3>
                <p className="mt-1 text-sm text-[#C9C3B3]">{desc}</p>
              </div>
            ))}
          </div>
        ) : section === "planes" ? (
          <div className="space-y-3">
            {["Biblia en 365 días", "Evangelios en 30 días", "Salmos para orar"].map((plan) => (
              <div
                key={plan}
                className="flex items-center justify-between rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-4"
              >
                <div>
                  <h3 className="font-semibold text-[#F8F5EA]">{plan}</h3>
                  <p className="text-sm text-[#C9C3B3]">Plan de lectura preparado.</p>
                </div>
                <span className="text-[#D4AF37]">›</span>
              </div>
            ))}
          </div>
        ) : section === "favoritos" || section === "marcadores" ? (
          <div className="space-y-3">
            {["Juan 3,16", "Salmo 23", "Mateo 5,3"].map((ref) => (
              <div key={ref} className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-4">
                <div className="text-sm font-semibold text-[#F2D27A]">{ref}</div>
                <p className="mt-1 text-sm text-[#C9C3B3]">
                  Aquí aparecerán tus pasajes guardados para volver a orarlos.
                </p>
              </div>
            ))}
          </div>
        ) : section === "notas" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {["Mis comentarios", "Notas de Straubinger"].map((note) => (
              <div key={note} className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-4">
                <h3 className="font-semibold text-[#F8F5EA]">{note}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#C9C3B3]">
                  Espacio para meditar, guardar y consultar notas bíblicas.
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-5 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-[#D4AF37]" />
            <p className="text-sm leading-relaxed text-[#C9C3B3]">
              Este módulo llega en la próxima fase. Fase 1 incluye lectura e importador.
            </p>
          </div>
        )}
      </div>
    </BibliaLayout>
  );
}
