import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { MobileNav } from "../components/MobileNav";
import { Header } from "../components/Header";
import { PlayerBar } from "../components/PlayerBar";
import { MiniPlayer } from "../components/MiniPlayer";
import { FullScreenPlayer } from "../components/FullScreenPlayer";
import { QueuePanel } from "../components/QueuePanel";
import { YouTubePlayer } from "../components/YouTubePlayer";
import { useAuth } from "../state/authStore";

export const MusicaLayout = () => {
  const init = useAuth((s) => s.init);
  useEffect(() => { init(); }, [init]);
  return (
    <div className="lavozfy min-h-screen flex flex-col">
      <div className="flex flex-1 min-h-0">
        <div className="hidden md:block"><Sidebar /></div>
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto lv-scroll pb-32 md:pb-0">
            <Outlet />
          </main>
          <PlayerBar />
        </div>
      </div>
      <MiniPlayer />
      <MobileNav />
      <FullScreenPlayer />
      <QueuePanel />
      <YouTubePlayer />
    </div>
  );
};
export default MusicaLayout;
