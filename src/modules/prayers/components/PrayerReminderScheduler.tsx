import { useEffect } from "react";
import {
  markPrayerReminderSent,
  pendingPrayerReminders,
  showPrayerNotification,
} from "../services/prayerReminderService";

const CHECK_INTERVAL = 30_000;

export default function PrayerReminderScheduler() {
  useEffect(() => {
    let running = false;
    const check = async () => {
      if (running) return;
      running = true;
      try {
        for (const reminder of pendingPrayerReminders()) {
          if (await showPrayerNotification(reminder)) {
            markPrayerReminderSent(reminder.id);
          }
        }
      } finally {
        running = false;
      }
    };

    void check();
    const timer = window.setInterval(() => void check(), CHECK_INTERVAL);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
