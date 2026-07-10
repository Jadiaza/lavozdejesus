export type TrackSource = "youtube" | "audio";

export type Track = {
  id: string;
  title: string;
  artistId: string;
  albumId: string;
  duration: number; // seconds
  source: TrackSource;
  videoId?: string;   // youtube
  audioUrl?: string;  // audio
  plays: number;
};

// videoIds públicos de música católica genérica (búsqueda pública en YouTube).
// Se pueden reemplazar por el catálogo real cuando se conecte YouTube Data API.
export const tracks: Track[] = [
  { id: "t1", title: "Ven y sana", artistId: "ministerio-emaus", albumId: "ante-tu-presencia",
    duration: 245, source: "youtube", videoId: "kXYiU_JCYtU", plays: 12483 },
  { id: "t2", title: "Aquí estoy, Señor", artistId: "ministerio-emaus", albumId: "ante-tu-presencia",
    duration: 302, source: "youtube", videoId: "PT2_F-1esPk", plays: 9821 },
  { id: "t3", title: "Bajo tu cruz", artistId: "voces-del-cenaculo", albumId: "renace-mi-corazon",
    duration: 271, source: "youtube", videoId: "hLQl3WQQoQ0", plays: 7412 },
  { id: "t4", title: "En tus manos", artistId: "voces-del-cenaculo", albumId: "renace-mi-corazon",
    duration: 228, source: "youtube", videoId: "60ItHLz5WEA", plays: 5340 },
  { id: "t5", title: "María, llévame a Jesús", artistId: "canto-de-maria", albumId: "bajo-tu-mirada",
    duration: 314, source: "youtube", videoId: "fJ9rUzIMcZQ", plays: 8901 },
  { id: "t6", title: "Nada me separará", artistId: "canto-de-maria", albumId: "madre-de-esperanza",
    duration: 256, source: "youtube", videoId: "e-ORhEE9VVg", plays: 6203 },
  { id: "t7", title: "Sopla sobre mí", artistId: "comunidad-kerigma", albumId: "espiritu-de-vida",
    duration: 289, source: "youtube", videoId: "y6120QOlsfU", plays: 4102 },
  { id: "t8", title: "Quédate conmigo", artistId: "fraternidad-nazaret", albumId: "salmos-para-el-alma",
    duration: 348, source: "youtube", videoId: "OPf0YbXqDm0", plays: 5921 },
  { id: "t9", title: "Camino de esperanza", artistId: "mision-galilea", albumId: "cantos-del-camino",
    duration: 233, source: "youtube", videoId: "RgKAFK5djSk", plays: 3211 },
  { id: "t10", title: "Permanezco en Ti", artistId: "ministerio-emaus", albumId: "permanecer-en-ti",
    duration: 297, source: "youtube", videoId: "JGwWNGJdvx8", plays: 4890 },
];

export const tracksByAlbum = (albumId: string) => tracks.filter((t) => t.albumId === albumId);
export const tracksByArtist = (artistId: string) => tracks.filter((t) => t.artistId === artistId);
export const getTrack = (id: string) => tracks.find((t) => t.id === id);

export const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};