import { useNavigate } from "react-router-dom";
import { RosaryLayout } from "../components/RosaryLayout";
import { RosarySwitchRow, RosaryValueRow } from "../components/RosaryRows";
import { useRosaryFlow } from "../hooks/useRosaryFlow";
import { useRosaryPreferences } from "../hooks/useRosaryPreferences";
import { routeForMode } from "../utils/routes";
import { rosarySessionService } from "../services/rosarySessionService";
import type { RosaryVoiceId, TextSize } from "../types";

const VOICES: Array<{ id: RosaryVoiceId; label: string }> = [
  { id: "femenina1", label: "Voz femenina 1" },
  { id: "femenina2", label: "Voz femenina 2" },
  { id: "masculina1", label: "Voz masculina 1" },
];

const SIZES: Array<{ id: TextSize; label: string }> = [
  { id: "sm", label: "Pequeño" },
  { id: "md", label: "Mediano" },
  { id: "lg", label: "Grande" },
];

/** Pantalla 6: configuración previa al rezo. */
export const RosarioConfiguracion = () => {
  const navigate = useNavigate();
  const { flow } = useRosaryFlow();
  const { prefs, update } = useRosaryPreferences();

  const begin = () => {
    rosarySessionService.clear();
    navigate(`${routeForMode(flow.mode)}?grupo=${flow.group ?? ""}`);
  };

  return (
    <RosaryLayout title="Configuración" subtitle="Ajusta tu experiencia de oración" back="/rosario/seleccionar-misterios">
      <section className="glass gold-border rounded-3xl px-5 py-2">
        <RosaryValueRow label="Voz" value={prefs.voice} options={VOICES} onChange={(voice) => update({ voice })} />
        <RosarySwitchRow
          label="Música de fondo"
          checked={prefs.backgroundMusic}
          onChange={(backgroundMusic) => update({ backgroundMusic })}
        />
        <RosarySwitchRow label="Vibración" checked={prefs.haptics} onChange={(haptics) => update({ haptics })} />
        <RosaryValueRow label="Texto" value={prefs.textSize} options={SIZES} onChange={(textSize) => update({ textSize })} />
        <RosarySwitchRow label="Modo nocturno" checked={prefs.nightMode} onChange={(nightMode) => update({ nightMode })} />
        <RosarySwitchRow
          label="Recordar mi elección"
          checked={prefs.rememberChoice}
          onChange={(rememberChoice) => update({ rememberChoice })}
        />
      </section>

      <button
        type="button"
        onClick={begin}
        className="mt-5 w-full min-h-12 rounded-xl bg-gradient-gold text-navy-deep font-medium uppercase tracking-[0.12em]"
      >
        Comenzar
      </button>
      <button
        type="button"
        onClick={() => navigate("/rosario/descargas")}
        className="mt-3 w-full min-h-11 rounded-xl gold-border text-sm"
      >
        Descargar audios para usar sin conexión
      </button>
    </RosaryLayout>
  );
};

export default RosarioConfiguracion;