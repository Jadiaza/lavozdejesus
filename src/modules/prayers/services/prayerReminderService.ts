export type PrayerReminderId = "laudes" | "angelus" | "divina_misericordia";

export type PrayerReminder = {
  id: PrayerReminderId;
  title: string;
  time: string;
  description: string;
  message: string;
  path: string;
  enabled: boolean;
};

const STORAGE_KEY = "lvj-prayer-reminders-v1";
const LAST_SENT_KEY = "lvj-prayer-reminders-last-sent-v1";

export const DEFAULT_PRAYER_REMINDERS: PrayerReminder[] = [
  {
    id: "laudes",
    title: "Laudes",
    time: "06:00",
    description: "Comienza el día alabando al Señor con la oración de la Iglesia.",
    message: "Ha llegado el momento de ofrecer la mañana al Señor con la oración de Laudes.",
    path: "/oraciones/liturgia/laudes",
    enabled: false,
  },
  {
    id: "angelus",
    title: "Ángelus",
    time: "12:00",
    description: "Haz una pausa al mediodía para recordar la Encarnación del Señor.",
    message: "Es mediodía. Haz una pausa y contempla con María el misterio de la Encarnación.",
    path: "/oraciones/categoria/marianas",
    enabled: false,
  },
  {
    id: "divina_misericordia",
    title: "Divina Misericordia",
    time: "15:00",
    description: "Únete a la Hora de la Misericordia a las tres de la tarde.",
    message: "Son las tres de la tarde. Jesús misericordioso, en ti confío.",
    path: "/oraciones/devociones",
    enabled: false,
  },
];

const storageAvailable = () => typeof window !== "undefined" && "localStorage" in window;

export const readPrayerReminders = (): PrayerReminder[] => {
  if (!storageAvailable()) return DEFAULT_PRAYER_REMINDERS;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Partial<PrayerReminder>[];
    return DEFAULT_PRAYER_REMINDERS.map((preset) => ({
      ...preset,
      enabled: Boolean(saved.find((item) => item.id === preset.id)?.enabled),
    }));
  } catch {
    return DEFAULT_PRAYER_REMINDERS;
  }
};

export const savePrayerReminders = (reminders: PrayerReminder[]) => {
  if (!storageAvailable()) return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(reminders.map(({ id, enabled }) => ({ id, enabled }))),
  );
  window.dispatchEvent(new CustomEvent("lvj-prayer-reminders-changed"));
};

export const bogotaDateAndTime = (date: Date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
};

const readLastSent = (): Record<string, string> => {
  if (!storageAvailable()) return {};
  try {
    return JSON.parse(localStorage.getItem(LAST_SENT_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
};

export const pendingPrayerReminders = (date: Date = new Date()) => {
  const current = bogotaDateAndTime(date);
  const lastSent = readLastSent();
  return readPrayerReminders().filter(
    (reminder) =>
      reminder.enabled &&
      reminder.time === current.time &&
      lastSent[reminder.id] !== current.date,
  );
};

export const markPrayerReminderSent = (id: PrayerReminderId, date: Date = new Date()) => {
  if (!storageAvailable()) return;
  const lastSent = readLastSent();
  lastSent[id] = bogotaDateAndTime(date).date;
  localStorage.setItem(LAST_SENT_KEY, JSON.stringify(lastSent));
};

export const prayerNotificationPermission = (): NotificationPermission | "unsupported" => {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
};

export const requestPrayerNotificationPermission = async () => {
  if (prayerNotificationPermission() === "unsupported") return "unsupported" as const;
  return Notification.requestPermission();
};

export const showPrayerNotification = async (reminder: PrayerReminder) => {
  if (prayerNotificationPermission() !== "granted") return false;
  const options: NotificationOptions = {
    body: reminder.message,
    icon: "/pwa-192.png",
    badge: "/pwa-192.png",
    tag: `lvj-prayer-${reminder.id}`,
    data: { url: reminder.path },
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(reminder.title, options);
  } else {
    const notification = new Notification(reminder.title, options);
    notification.onclick = () => {
      window.focus();
      window.location.assign(reminder.path);
    };
  }
  return true;
};
