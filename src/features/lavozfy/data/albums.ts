export type Album = {
  id: string;
  title: string;
  artistId: string;
  year: number;
  genre: string;
  cover: string;
};

// Portadas abstractas (patrones, luces, texturas) para simular carátulas.
const cover = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=640&h=640&q=70`;

export const albums: Album[] = [
  { id: "ante-tu-presencia", title: "Ante tu presencia", artistId: "ministerio-emaus", year: 2024, genre: "Adoración",
    cover: cover("1518972559570-7cc1309f3229") },
  { id: "renace-mi-corazon", title: "Renace mi corazón", artistId: "voces-del-cenaculo", year: 2023, genre: "Alabanza",
    cover: cover("1509824227185-9c5a01ceba0d") },
  { id: "bajo-tu-mirada", title: "Bajo tu mirada", artistId: "canto-de-maria", year: 2024, genre: "Mariana",
    cover: cover("1519681393784-d120267933ba") },
  { id: "salmos-para-el-alma", title: "Salmos para el alma", artistId: "fraternidad-nazaret", year: 2022, genre: "Contemplativa",
    cover: cover("1447752875215-b2761acb3c5d") },
  { id: "madre-de-esperanza", title: "Madre de esperanza", artistId: "canto-de-maria", year: 2021, genre: "Mariana",
    cover: cover("1470071459604-3b5ec3a7fe05") },
  { id: "espiritu-de-vida", title: "Espíritu de vida", artistId: "comunidad-kerigma", year: 2024, genre: "Alabanza",
    cover: cover("1470252649378-9c29740c9fa8") },
  { id: "cantos-del-camino", title: "Cantos del camino", artistId: "mision-galilea", year: 2023, genre: "Juvenil",
    cover: cover("1500534314209-a25ddb2bd429") },
  { id: "permanecer-en-ti", title: "Permanecer en Ti", artistId: "ministerio-emaus", year: 2022, genre: "Adoración",
    cover: cover("1490750967868-88aa4486c946") },
];

export const getAlbum = (id: string) => albums.find((a) => a.id === id);
export const albumsByArtist = (artistId: string) =>
  albums.filter((a) => a.artistId === artistId);