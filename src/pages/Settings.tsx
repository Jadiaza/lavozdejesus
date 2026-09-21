import {
  Accessibility,
  Bell,
  ChevronRight,
  Database,
  Headphones,
  LockKeyhole,
  Type,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/lvdj/BottomNav";
import { Logo } from "@/components/lvdj/Logo";

const future = [
  { label: "Audio y reproducción", description: "Controles generales de reproducción", icon: Headphones },
  { label: "Notificaciones", description: "Recordatorios y avisos de la aplicación", icon: Bell },
  { label: "Descargas y modo sin conexión", description: "Administración de contenido disponible offline", icon: Database },
  { label: "Accesibilidad", description: "Opciones adicionales de accesibilidad", icon: Accessibility },
  { label: "Cuenta y privacidad", description: "Datos, sesión y controles de privacidad", icon: LockKeyhole },
];

export default function Settings() {
  return (
    <div className="min-h-screen bg-[#03070F] text-[#F8F5EA]">
      <main className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))] md:max-w-2xl">
        <header className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">Más</p><h1 className="mt-1 font-display text-3xl">Configuraciones</h1></div>
          <Logo size="sm" />
        </header>

        <section className="mt-7">
          <h2 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">General</h2>
          <Link to="/configuraciones/lectura" className="flex min-h-[68px] items-center gap-3 border-y border-[#D4AF37]/15 px-1 py-3 transition hover:bg-[#D4AF37]/[0.03]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]"><Type className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><strong className="block text-sm">Lectura y texto</strong><span className="mt-0.5 block text-[11px] leading-4 text-[#8F897C]">Tema, fuente, tamaño, alineación e interlineado</span></span>
            <ChevronRight className="h-4 w-4 text-[#D4AF37]/70" />
          </Link>
        </section>

        <section className="mt-7">
          <h2 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">Otras configuraciones</h2>
          <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
            {future.map(({ label, description, icon: Icon }) => (
              <div key={label} className="flex min-h-[64px] items-center gap-3 px-1 py-2.5 opacity-55">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.035] text-[#A9A295]"><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><strong className="block text-sm">{label}</strong><span className="mt-0.5 block text-[10px] leading-4 text-[#8F897C]">{description}</span></span>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] uppercase tracking-wider text-[#8F897C]">Próximamente</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <BottomNav activeLabel="Mas" />
    </div>
  );
}
