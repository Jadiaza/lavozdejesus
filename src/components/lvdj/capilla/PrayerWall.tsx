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
  <section className="px-4 pb-28 pt-4">
    <div className="mx-auto max-w-[430px] space-y-2.5">
      {prayers.map((item) => (
        <PrayerCard key={item.id} item={item} />
      ))}
    </div>
  </section>
);
