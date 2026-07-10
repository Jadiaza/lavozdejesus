import { tracks } from "./tracks";
export type Playlist = { id: string; name: string; description: string; trackIds: string[]; cover: string };
export const playlists: Playlist[] = [
  { id: "para-orar", name: "Para orar hoy", description: "Selección para acompañar la oración diaria",
    trackIds: tracks.slice(0, 5).map(t => t.id),
    cover: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=640&h=640&q=70" },
  { id: "adoracion-eucaristica", name: "Adoración eucarística", description: "Cantos ante el Santísimo",
    trackIds: [tracks[0].id, tracks[1].id, tracks[9].id],
    cover: "https://images.unsplash.com/photo-1476136236990-838240be4859?auto=format&fit=crop&w=640&h=640&q=70" },
  { id: "mariana", name: "Rosario y María", description: "Cantos marianos",
    trackIds: [tracks[4].id, tracks[5].id],
    cover: "https://images.unsplash.com/photo-1519160732940-4a2f28f1c00d?auto=format&fit=crop&w=640&h=640&q=70" },
];
export const getPlaylist = (id: string) => playlists.find(p => p.id === id);