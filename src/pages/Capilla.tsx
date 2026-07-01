import { BottomNav } from "@/components/lvdj/BottomNav";
import { CapillaHeader } from "@/components/lvdj/capilla/CapillaHeader";
import { CapillaVideo } from "@/components/lvdj/capilla/CapillaVideo";
import { PrayerForm } from "@/components/lvdj/capilla/PrayerForm";
import { PrayerWall } from "@/components/lvdj/capilla/PrayerWall";

const Capilla = () => (
  <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_50%_12%,rgba(212,175,55,0.16),transparent_32%),linear-gradient(180deg,#05070d,#061826_42%,#02050a)] text-foreground">
    <CapillaHeader />
    <main>
      <CapillaVideo />
      <PrayerForm />
      <PrayerWall />
    </main>
    <BottomNav activeLabel="Capilla" />
  </div>
);

export default Capilla;
