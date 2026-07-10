export type Artist = {
  id: string;
  name: string;
  country: string;
  genre: string;
  verified: boolean;
  image: string;
  bio: string;
};

// Imágenes placeholder abstractas (unsplash source) — sin usar personas reales.
const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=600&q=70`;

export const artists: Artist[] = [
  { id: "ministerio-emaus", name: "Ministerio Emaús", country: "Colombia", genre: "Adoración", verified: true,
    image: img("1511671782779-c97d3d27a1d4"),
    bio: "Ministerio de música católica dedicado a la adoración eucarística y la evangelización sonora." },
  { id: "voces-del-cenaculo", name: "Voces del Cenáculo", country: "México", genre: "Alabanza", verified: true,
    image: img("1499415479124-43c32433a620"),
    bio: "Coro contemporáneo enfocado en la liturgia y en la juventud católica." },
  { id: "canto-de-maria", name: "Canto de María", country: "España", genre: "Mariana", verified: true,
    image: img("1516280440614-37939bbacd81"),
    bio: "Proyecto musical dedicado enteramente a la Virgen María." },
  { id: "comunidad-kerigma", name: "Comunidad Kerigma", country: "Argentina", genre: "Alabanza", verified: false,
    image: img("1470225620780-dba8ba36b745"),
    bio: "Comunidad juvenil de anuncio y música." },
  { id: "fraternidad-nazaret", name: "Fraternidad Nazaret", country: "Perú", genre: "Contemplativa", verified: true,
    image: img("1454165804606-c3d57bc86b40"),
    bio: "Música contemplativa inspirada en la espiritualidad monástica." },
  { id: "mision-galilea", name: "Misión Galilea", country: "Chile", genre: "Juvenil", verified: false,
    image: img("1493225457124-a3eb161ffa5f"),
    bio: "Misión juvenil con propuesta musical fresca y católica." },
];

export const getArtist = (id: string) => artists.find((a) => a.id === id);