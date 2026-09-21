import {
  BookHeart,
  BookOpen,
  CalendarCheck2,
  ChevronRight,
  Church,
  Download,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  Library,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BottomNav } from "@/components/lvdj/BottomNav";
import { Logo } from "@/components/lvdj/Logo";

type MenuItem = {
  label: string;
  description?: string;
  to: string;
  icon: typeof Settings;
  external?: boolean;
};

const Section = ({ title, items }: { title: string; items: MenuItem[] }) => (
  <section className="mt-7">
    <h2 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">{title}</h2>
    <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
      {items.map(({ label, description, to, icon: Icon, external }) => {
        const content = (
          <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/[0.08] text-[#D4AF37]"><Icon className="h-5 w-5" strokeWidth={1.7} /></span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm font-semibold text-[#F8F5EA]">{label}</strong>
              {description && <span className="mt-0.5 block text-[11px] leading-4 text-[#8F897C]">{description}</span>}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-[#D4AF37]/60" />
          </>
        );

        return external ? (
          <a key={label} href={to} target="_blank" rel="noreferrer" className="flex min-h-[62px] items-center gap-3 px-1 py-2.5 transition hover:bg-white/[0.025]">
            {content}
          </a>
        ) : (
          <Link key={label} to={to} className="flex min-h-[62px] items-center gap-3 px-1 py-2.5 transition hover:bg-white/[0.025]">
            {content}
          </Link>
        );
      })}
    </div>
  </section>
);

export default function More() {
  const mySpace: MenuItem[] = [
    { label: "Mi cuenta", description: "Acceso y sesión de usuario", to: "/acceso", icon: UserRound },
    { label: "Mi Biblia", description: "Favoritos, notas, marcadores e historial", to: "/biblia/mi-biblia", icon: Library },
    { label: "Mis oraciones", description: "Oraciones guardadas y favoritas", to: "/oraciones/mis-oraciones", icon: Heart },
    { label: "Planes de lectura", description: "Continúa tus planes y progreso", to: "/biblia/planes", icon: CalendarCheck2 },
    { label: "Descargas del Rosario", description: "Contenido disponible sin conexión", to: "/rosario/descargas", icon: Download },
  ];

  const content: MenuItem[] = [
    { label: "Devociones", description: "Oraciones, novenas y caminos de piedad", to: "/oraciones/devociones", icon: BookHeart },
    { label: "Estudio Bíblico", description: "Profundiza en la Palabra de Dios", to: "/biblia/estudio", icon: BookOpen },
    { label: "Capilla virtual", description: "Adoración eucarística", to: "/capilla", icon: Church },
    { label: "Formación", description: "Recursos para crecer en la fe", to: "/formacion", icon: GraduationCap },
  ];

  const help: MenuItem[] = [
    { label: "Ayuda y contacto", description: "Comunícate con La Voz de Jesús", to: "/contacto", icon: HelpCircle },
    { label: "Acerca de LVJPRAYER", description: "Misión e identidad de la aplicación", to: "/acerca-de", icon: Info },
    { label: "Política de privacidad", description: "Consulta la política vigente de La Voz de Jesús", to: "https://panelapp.lavozdejesus.co/privacy_policy.php", icon: ShieldCheck, external: true },
    { label: "Términos y condiciones", to: "/terminos-y-condiciones", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#03070F] text-[#F8F5EA]">
      <main className="mx-auto min-h-screen w-full max-w-[430px] px-5 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))] md:max-w-2xl">
        <header className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-4">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#D4AF37]">La Voz de Jesús</p><h1 className="mt-1 font-display text-3xl">Más</h1></div>
          <Logo size="sm" />
        </header>

        <Section title="Mi espacio" items={mySpace} />
        <Section title="Contenido" items={content} />

        <section className="mt-7">
          <h2 className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">Configuración</h2>
          <Link to="/configuraciones" className="flex min-h-[66px] items-center gap-3 border-y border-[#D4AF37]/15 px-1 py-3 transition hover:bg-[#D4AF37]/[0.03]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]"><Settings className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><strong className="block text-sm">Configuraciones</strong><span className="mt-0.5 block text-[11px] text-[#8F897C]">Lectura, audio, notificaciones y privacidad</span></span>
            <ChevronRight className="h-4 w-4 text-[#D4AF37]/70" />
          </Link>
        </section>

        <Section title="Ayuda e información" items={help} />
        <p className="mt-7 text-center text-[10px] uppercase tracking-[0.16em] text-[#655F55]">LVJPRAYER · La Voz de Jesús</p>
      </main>
      <BottomNav activeLabel="Mas" />
    </div>
  );
}
