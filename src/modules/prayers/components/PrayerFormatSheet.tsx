import { AlignCenter, AlignJustify, AlignLeft, RotateCcw, X } from "lucide-react";
import type { PrayerPreferences } from "../hooks/usePrayerPreferences";

interface Props {
  open: boolean;
  preferences: PrayerPreferences;
  onChange: (values: Partial<PrayerPreferences>) => void;
  onReset: () => void;
  onClose: () => void;
}

const choices = "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs transition";

export default function PrayerFormatSheet({ open, preferences, onChange, onReset, onClose }: Props) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm md:items-center md:p-4" role="dialog" aria-modal="true" aria-label="Formato de lectura">
    <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar formato" />
    <section className="relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#d8a740]/30 bg-[#0a121a] p-5 text-[#f5f0e6] shadow-2xl md:rounded-3xl">
      <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.28em] text-[#efbd52]">Módulo Oraciones</p><h2 className="mt-1 font-serif text-xl">Formato de lectura</h2></div><button type="button" onClick={onClose} className="rounded-full border border-white/15 p-2"><X className="h-5 w-5" /></button></div>

      <div className="space-y-5">
        <fieldset><legend className="mb-2 text-xs font-semibold text-[#efbd52]">Tipo de letra</legend><div className="grid grid-cols-3 gap-2">{[["literata", "Literata"], ["serif", "Clásica"], ["sans", "Sans serif"]].map(([value, label]) => <button key={value} type="button" onClick={() => onChange({ font: value as PrayerPreferences["font"] })} className={`${choices} ${preferences.font === value ? "border-[#efbd52] bg-[#efbd52]/15 text-[#efbd52]" : ""}`}>{label}</button>)}</div></fieldset>

        <fieldset><legend className="mb-2 text-xs font-semibold text-[#efbd52]">Tamaño</legend><div className="grid grid-cols-4 gap-2">{[[16, "Pequeño"], [18, "Normal"], [21, "Grande"], [24, "Muy grande"]].map(([value, label]) => <button key={value} type="button" onClick={() => onChange({ fontSize: Number(value) })} className={`${choices} px-1 ${preferences.fontSize === value ? "border-[#efbd52] bg-[#efbd52]/15 text-[#efbd52]" : ""}`}>{label}</button>)}</div></fieldset>

        <fieldset><legend className="mb-2 text-xs font-semibold text-[#efbd52]">Tema</legend><div className="grid grid-cols-4 gap-2">{[["dark", "Oscuro"], ["light", "Claro"], ["sepia", "Sepia"], ["contrast", "Contraste"]].map(([value, label]) => <button key={value} type="button" onClick={() => onChange({ theme: value as PrayerPreferences["theme"] })} className={`${choices} px-1 ${preferences.theme === value ? "border-[#efbd52] bg-[#efbd52]/15 text-[#efbd52]" : ""}`}>{label}</button>)}</div></fieldset>

        <fieldset><legend className="mb-2 text-xs font-semibold text-[#efbd52]">Alineación</legend><div className="grid grid-cols-3 gap-2">{[["left", AlignLeft, "Izquierda"], ["center", AlignCenter, "Centrada"], ["justify", AlignJustify, "Justificada"]].map(([value, Icon, label]) => <button key={String(value)} type="button" onClick={() => onChange({ alignment: value as PrayerPreferences["alignment"] })} className={`${choices} flex items-center justify-center gap-2 ${preferences.alignment === value ? "border-[#efbd52] bg-[#efbd52]/15 text-[#efbd52]" : ""}`}><Icon className="h-4 w-4" />{String(label)}</button>)}</div></fieldset>

        <fieldset><legend className="mb-2 text-xs font-semibold text-[#efbd52]">Interlineado</legend><div className="grid grid-cols-4 gap-2">{[[1.35, "Compacto"], [1.6, "Normal"], [1.85, "Amplio"], [2.1, "Muy amplio"]].map(([value, label]) => <button key={value} type="button" onClick={() => onChange({ lineHeight: Number(value) })} className={`${choices} px-1 ${preferences.lineHeight === value ? "border-[#efbd52] bg-[#efbd52]/15 text-[#efbd52]" : ""}`}>{label}</button>)}</div></fieldset>

        <label className="flex items-center justify-between rounded-xl border border-white/10 p-3 text-sm"><span>Lectura concentrada</span><input type="checkbox" checked={preferences.focusedWidth} onChange={(event) => onChange({ focusedWidth: event.target.checked })} className="h-5 w-5 accent-[#efbd52]" /></label>
      </div>

      <button type="button" onClick={onReset} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#d8a740]/50 py-3 text-xs font-bold text-[#efbd52]"><RotateCcw className="h-4 w-4" />RESTABLECER FORMATO</button>
    </section>
  </div>;
}
