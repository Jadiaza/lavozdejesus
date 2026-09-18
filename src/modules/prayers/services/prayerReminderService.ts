export type PrayerReminderId =
  | "oficio"
  | "laudes"
  | "tercia"
  | "sexta"
  | "nona"
  | "visperas"
  | "completas"
  | "angelus"
  | "divina_misericordia";

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
const PUSH_ACTIVE_KEY = "lvj-prayer-push-active-v1";

export const DEFAULT_PRAYER_REMINDERS: PrayerReminder[] = [
  {
    id: "oficio",
    title: "Oficio de Lectura",
    time: "04:00",
    description: "Medita la Palabra de Dios y la tradición espiritual de la Iglesia.",
    message: "Es tiempo del Oficio de Lectura. Deja que la Palabra ilumine el comienzo de tu jornada.",
    path: "/oraciones/liturgia/oficio",
    enabled: false,
  },
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
    id: "tercia",
    title: "Tercia",
    time: "09:00",
    description: "Santifica las primeras horas del trabajo y pide la fuerza del Espíritu Santo.",
    message: "Haz una pausa para la oración de Tercia y encomienda al Señor el trabajo de esta mañana.",
    path: "/oraciones/liturgia/tercia",
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
    id: "sexta",
    title: "Sexta",
    time: "12:00",
    description: "Ora con la Iglesia en la mitad de la jornada.",
    message: "Ha llegado la hora de Sexta. Detén por un momento tus labores y vuelve el corazón a Dios.",
    path: "/oraciones/liturgia/sexta",
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
  {
    id: "nona",
    title: "Nona",
    time: "15:00",
    description: "Presenta al Señor el fruto y las cargas de la tarde.",
    message: "Es tiempo de la oración de Nona. Permanece junto al Señor en esta hora de la tarde.",
    path: "/oraciones/liturgia/nona",
    enabled: false,
  },
  {
    id: "visperas",
    title: "Vísperas",
    time: "18:00",
    description: "Da gracias a Dios al caer la tarde con la oración de la Iglesia.",
    message: "La tarde llega a su fin. Únete a la Iglesia en la oración de Vísperas.",
    path: "/oraciones/liturgia/visperas",
    enabled: false,
  },
  {
    id: "completas",
    title: "Completas",
    time: "21:00",
    description: "Entrega al Padre el día vivido y descansa bajo su protección.",
    message: "Antes de descansar, encomienda tu vida y tu noche al Señor con la oración de Completas.",
    path: "/oraciones/liturgia/completas",
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
  // Web Push despierta el service worker aun con la PWA cerrada. Esta revisión
  // local queda únicamente como respaldo en dispositivos todavía no suscritos.
  if (storageAvailable() && localStorage.getItem(PUSH_ACTIVE_KEY) === "true") return [];
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
    renotify: true,
    vibrate: [200, 100, 200],
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
