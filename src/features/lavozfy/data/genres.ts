export type Genre = { slug: string; name: string; color: string };
export const genres: Genre[] = [
  { slug: "adoracion", name: "Adoración", color: "from-amber-500 to-rose-500" },
  { slug: "alabanza", name: "Alabanza", color: "from-emerald-500 to-teal-500" },
  { slug: "mariana", name: "Mariana", color: "from-sky-400 to-indigo-500" },
  { slug: "liturgica", name: "Litúrgica", color: "from-purple-500 to-fuchsia-500" },
  { slug: "contemplativa", name: "Contemplativa", color: "from-slate-500 to-zinc-700" },
  { slug: "juvenil", name: "Juvenil", color: "from-lime-500 to-emerald-500" },
  { slug: "instrumental", name: "Instrumental", color: "from-cyan-500 to-blue-600" },
  { slug: "tropical-catolica", name: "Tropical católica", color: "from-orange-500 to-yellow-500" },
  { slug: "rock-catolico", name: "Rock católico", color: "from-red-600 to-rose-700" },
  { slug: "infantil", name: "Música infantil", color: "from-pink-400 to-rose-500" },
];