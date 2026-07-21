import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { BibliaLayout } from "./BibliaLayout";
import { listarFavoritos, toggleFavorito, type FavoritoRow } from "@/features/biblia/db";

export default function BibliaFavoritos() {
  const [favoritos, setFavoritos] = useState<FavoritoRow[]>([]);

  useEffect(() => {
    void listarFavoritos().then((rows) =>
      setFavoritos(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    );
  }, []);

  const quitar = async (favorito: FavoritoRow) => {
    await toggleFavorito(favorito.libroId, favorito.capitulo, favorito.versiculo);
    setFavoritos((actual) => actual.filter((item) => item.id !== favorito.id));
  };

  return (
    <BibliaLayout title="Favoritos" back="/biblia/mi-biblia">
      <section className="mb-5 pt-2 text-center">
        <Heart className="mx-auto mb-2 h-7 w-7 fill-[#D4AF37] text-[#D4AF37]" />
        <p className="text-sm text-[#C9C3B3]">Versículos guardados en este dispositivo.</p>
      </section>

      {favoritos.length === 0 ? (
        <div className="rounded-2xl border border-[#D4AF37]/25 bg-[#0B0B0B] p-7 text-center">
          <p className="text-[#F8F5EA]">Todavía no tienes favoritos.</p>
          <p className="mt-2 text-sm text-[#C9C3B3]">Mantén presionado un versículo y toca el corazón para guardarlo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {favoritos.map((favorito) => {
            const contenido = (
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[#F2D27A]">
                  {favorito.libroNombre || "Biblia"} {favorito.capitulo},{favorito.versiculo}
                </div>
                {favorito.texto && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-[#E8E2D5]">{favorito.texto}</p>}
              </div>
            );
            return (
              <article key={favorito.id} className="flex items-start gap-2 rounded-2xl border border-[#D4AF37]/25 bg-[#0B0B0B] p-4">
                {favorito.libroCodigo ? (
                  <Link to={`/biblia/leer?libro=${favorito.libroCodigo}&cap=${favorito.capitulo}&versiculo=${favorito.versiculo}`} className="min-w-0 flex-1">
                    {contenido}
                  </Link>
                ) : contenido}
                <button type="button" onClick={() => void quitar(favorito)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#D4AF37] focus-visible:ring-2 focus-visible:ring-[#D4AF37]" aria-label={`Quitar ${favorito.libroNombre || "versículo"} de favoritos`}>
                  <Heart className="h-5 w-5 fill-[#D4AF37]" />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </BibliaLayout>
  );
}
