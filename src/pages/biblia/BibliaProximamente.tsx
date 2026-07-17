import {
  BookOpen,
  CalendarCheck2,
  Columns3,
  Compass,
  Construction,
  Library,
  Map,
  Music2,
  Search,
  Sparkles,
  Star,
  StickyNote,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BibliaLayout } from "./BibliaLayout";

const sectionLabels: Record<string, string> = {
  buscar: "Buscar",
  "mi-biblia": "Mi Biblia",
  explorar: "Explorar",
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
  "mi-biblia": Library,
  explorar: Compass,
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
  const [constructionSection, setConstructionSection] = useState<string | null>(null);
  const displayTitle = title ?? sectionLabels[section ?? ""] ?? "Biblia";
  const Icon = sectionIcon[section ?? ""] ?? Sparkles;
  const groupedTabs =
    section === "buscar"
      ? ["Texto bíblico", "Referencia", "Temas", "Concordancia"]
      : section === "mi-biblia"
        ? ["Favoritos", "Notas personales", "Marcadores", "Resaltados", "Historial de lectura"]
        : section === "explorar"
          ? ["Personajes bíblicos", "Lugares bíblicos", "Mapas", "Cronología"]
          : null;

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

        {groupedTabs ? (
          <div>
            <div
              className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label={`Secciones de ${displayTitle}`}
            >
              {groupedTabs.map((tab, index) => {
                const target = section === "explorar"
                  ? tab === "Mapas"
                    ? "/biblia/mapas"
                    : tab === "Personajes bíblicos"
                      ? "/biblia/personajes"
                      : ""
                  : "";
                const className = `shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  index === 0
                    ? "border-[#D4AF37] bg-[#D4AF37] text-[#050505]"
                    : "border-[#D4AF37]/25 bg-[#0B0B0B] text-[#C9C3B3]"
                }`;
                return target ? (
                  <Link key={tab} to={target} role="tab" aria-selected={false} className={className}>
                    {tab}
                  </Link>
                ) : (
                  <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={index === 0}
                  className={className}
                  onClick={() => setConstructionSection(tab)}
                >
                  {tab}
                </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#0B0B0B] p-5 text-center">
              <Icon className="mx-auto mb-3 h-8 w-8 text-[#D4AF37]" />
              <p className="text-sm leading-relaxed text-[#C9C3B3]">
                {section === "mi-biblia"
                  ? "Tu espacio personal estará disponible al iniciar sesión."
                  : "Vista preparada para la siguiente fase del módulo Biblia."}
              </p>
            </div>
          </div>
        ) : section === "comparar" ? (
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

      {constructionSection && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="construction-title"
          onMouseDown={(event) => event.target === event.currentTarget && setConstructionSection(null)}
        >
          <div className="relative w-full max-w-sm rounded-[2rem] border border-[#D4AF37]/35 bg-[#111111] p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.65)]">
            <button
              type="button"
              onClick={() => setConstructionSection(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[#F8F5EA]"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
              <Construction className="h-8 w-8" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">{constructionSection}</p>
            <h2 id="construction-title" className="mt-2 font-display text-3xl text-[#F8F5EA]">En construcción</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#C9C3B3]">
              Estamos preparando esta sección para una próxima actualización de la Biblia.
            </p>
            <button
              type="button"
              onClick={() => setConstructionSection(null)}
              className="mt-6 w-full rounded-xl bg-[#D4AF37] px-4 py-3 text-sm font-bold text-[#050505]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </BibliaLayout>
  );
}
