const AMBIENT_AUDIO_URL = "https://pub-d51964240d644bebafa009ba9eae6df4.r2.dev/lvjplayer/rosario/ambient/ambiental.mp3";

let ambientAudio: HTMLAudioElement | null = null;

const getAudio = () => {
  if (typeof window === "undefined") return null;
  if (!ambientAudio) {
    ambientAudio = new Audio(AMBIENT_AUDIO_URL);
    ambientAudio.loop = true;
    ambientAudio.preload = "auto";
    ambientAudio.volume = 0.22;
  }
  return ambientAudio;
};

export const rosaryAmbientAudioService = {
  async play() {
    const audio = getAudio();
    if (!audio) return;
    try {
      await audio.play();
    } catch {
      // El navegador puede bloquear reproducción si se pierde el gesto del usuario.
    }
  },

  pause() {
    getAudio()?.pause();
  },

  stop() {
    const audio = getAudio();
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  },
};
