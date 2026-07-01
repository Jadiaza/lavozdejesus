import { PrayerCard, PrayerItem } from "./PrayerCard";

const prayers: PrayerItem[] = [
  {
    id: "maria",
    name: "Maria G.",
    time: "Hace 3 minutos",
    text: "Pido oracion por la salud de mi esposo.",
    prayers: 128,
  },
  {
    id: "hermano",
    name: "Un hermano en Cristo",
    time: "Hace 10 minutos",
    text: "Gracias Senor por escuchar mi oracion.",
    prayers: 92,
  },
  {
    id: "ana",
    name: "Ana C.",
    time: "Hace 15 minutos",
    text: "Por la conversion de mi familia.",
    prayers: 210,
  },
  {
    id: "jose",
    name: "Jose A.",
    time: "Hace 30 minutos",
    text: "Por quienes no tienen trabajo.",
    prayers: 87,
  },
];

export const PrayerWall = () => (
  <section className="px-4 pb-28 pt-3">
    <div className="mx-auto max-w-[430px] space-y-3">
      <div className="rounded-2xl border border-gold/20 bg-black/30 px-4 py-3">
        <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.24em] text-gold">
          Muro de oracion
        </div>
        <p className="mt-1 text-sm text-foreground/70">
          Intenciones compartidas con respeto, fe y esperanza.
        </p>
      </div>

      {prayers.map((item) => (
        <PrayerCard key={item.id} item={item} />
      ))}
    </div>
  </section>
);
