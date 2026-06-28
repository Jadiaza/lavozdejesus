import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Church,
  FileText,
  HandHeart,
  Heart,
  Mail,
  Mic,
  Podcast as PodcastIcon,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/lvdj/BottomNav";
import { Logo } from "@/components/lvdj/Logo";

interface InfoPageProps {
  title: string;
  eyebrow: string;
  description: string;
  icon: ReactNode;
  activeLabel?: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  cta?: {
    label: string;
    to: string;
  };
}

const InfoPage = ({
  title,
  eyebrow,
  description,
  icon,
  activeLabel = "Mas",
  sections,
  cta,
}: InfoPageProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-deep text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--gold)/0.18),transparent_34%),linear-gradient(180deg,hsl(var(--navy-deep)),hsl(var(--navy)))]" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-28 pt-5 sm:px-6 lg:px-8 xl:pb-10">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full gold-border text-gold transition hover:bg-gold/10"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Logo size="sm" />
          <Link
            to="/contacto"
            className="flex h-10 w-10 items-center justify-center rounded-full gold-border text-gold transition hover:bg-gold/10"
            aria-label="Contacto"
          >
            <Mail className="h-5 w-5" />
          </Link>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl gold-border bg-navy-deep/62 p-6 shadow-deep backdrop-blur sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/35">
              {icon}
            </div>
            <div>
              <div className="section-title">{eyebrow}</div>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground/72 sm:text-base">
                {description}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl gold-border bg-navy-deep/58 p-5 shadow-deep backdrop-blur"
            >
              <h2 className="text-lg font-extrabold text-gold">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/72">
                {section.body}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-5 rounded-2xl gold-border bg-black/24 p-5 text-center shadow-deep backdrop-blur">
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-foreground/72">
            La Voz de Jesus trabaja para ofrecer una experiencia catolica clara,
            util y respetuosa. Esta seccion se ira ampliando con nuevos recursos
            pastorales y contenido propio de la emisora.
          </p>
          {cta && (
            <Link
              to={cta.to}
              className="mt-5 inline-flex rounded-lg bg-gradient-gold px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-navy-deep shadow-gold"
            >
              {cta.label}
            </Link>
          )}
        </section>
      </main>

      <BottomNav activeLabel={activeLabel} />
    </div>
  );
};

export const Devociones = () => (
  <InfoPage
    title="Devociones"
    eyebrow="Vida de oracion"
    description="Un espacio para reunir practicas de piedad, meditaciones y caminos sencillos para vivir la fe durante el dia."
    icon={<Heart className="h-8 w-8" />}
    sections={[
      {
        title: "Rosario y piedad popular",
        body: "Contenido orientado a acompanar el Santo Rosario, novenas, coronillas y momentos de oracion familiar.",
      },
      {
        title: "Oracion diaria",
        body: "Guias breves para iniciar, sostener y cerrar el dia con una mirada puesta en Dios.",
      },
      {
        title: "Recursos para compartir",
        body: "Material pastoral pensado para la comunidad, grupos de oracion y oyentes de la emisora.",
      },
    ]}
    cta={{ label: "Escuchar radio", to: "/radio" }}
  />
);

export const Liturgia = () => (
  <InfoPage
    title="Liturgia"
    eyebrow="Celebracion de la fe"
    description="Seccion dedicada a la vida liturgica, la Santa Misa, la Liturgia de las Horas y la preparacion espiritual."
    icon={<Church className="h-8 w-8" />}
    sections={[
      {
        title: "Santa Misa",
        body: "Informacion y acompanamiento para vivir con reverencia la celebracion eucaristica.",
      },
      {
        title: "Tiempos liturgicos",
        body: "Recursos para comprender los ciclos de Adviento, Navidad, Cuaresma, Pascua y Tiempo Ordinario.",
      },
      {
        title: "Oracion de la Iglesia",
        body: "Contenidos relacionados con Laudes, Visperas, Completas y la oracion comunitaria.",
      },
    ]}
    cta={{ label: "Ver lecturas", to: "/lecturas-del-dia" }}
  />
);

export const Formacion = () => (
  <InfoPage
    title="Formacion"
    eyebrow="Crecer en la fe"
    description="Un lugar para catequesis, reflexiones y temas que ayudan a conocer mejor la doctrina y la vida cristiana."
    icon={<BookOpen className="h-8 w-8" />}
    sections={[
      {
        title: "Catequesis",
        body: "Temas claros y cercanos para fortalecer la vida sacramental y la identidad catolica.",
      },
      {
        title: "Biblia y doctrina",
        body: "Recursos para leer la Palabra de Dios con fidelidad, contexto y aplicacion diaria.",
      },
      {
        title: "Familia y comunidad",
        body: "Contenidos para acompanamiento espiritual, vida familiar y servicio evangelizador.",
      },
    ]}
    cta={{ label: "Leer evangelio", to: "/lecturas-del-dia" }}
  />
);

export const Biblia = () => (
  <InfoPage
    title="Biblia"
    eyebrow="Palabra de Dios"
    description="Un espacio para acercarse a la Sagrada Escritura con lectura, meditacion y recursos de formacion biblica."
    icon={<BookOpen className="h-8 w-8" />}
    sections={[
      {
        title: "Lectura orante",
        body: "Recursos para leer la Biblia con calma, escuchar a Dios y llevar su Palabra a la vida cotidiana.",
      },
      {
        title: "Evangelio del dia",
        body: "Acceso a las lecturas diarias y a la meditacion que acompana el camino espiritual de la comunidad.",
      },
      {
        title: "Formacion biblica",
        body: "Contenido progresivo para comprender mejor los libros, personajes y mensajes centrales de la Escritura.",
      },
    ]}
    cta={{ label: "Leer evangelio", to: "/lecturas-del-dia" }}
  />
);

export const Testimonios = () => (
  <InfoPage
    title="Testimonios"
    eyebrow="Dios actua"
    description="Historias de fe, conversion, esperanza y gratitud compartidas para edificar a la comunidad."
    icon={<Quote className="h-8 w-8" />}
    sections={[
      {
        title: "Historias de fe",
        body: "Relatos de oyentes y comunidades que reconocen la presencia de Dios en su camino.",
      },
      {
        title: "Gratitud",
        body: "Espacio para dar gracias por bendiciones, respuestas de oracion y procesos de sanacion interior.",
      },
      {
        title: "Comunidad",
        body: "Testimonios que fortalecen la esperanza y animan a otros a permanecer en la fe.",
      },
    ]}
    cta={{ label: "Contactar", to: "/contacto" }}
  />
);

export const Podcast = () => (
  <InfoPage
    title="Podcast"
    eyebrow="Escucha y medita"
    description="Contenido de audio para acompanarte en el camino: reflexiones, predicaciones, entrevistas y programas especiales."
    icon={<PodcastIcon className="h-8 w-8" />}
    sections={[
      {
        title: "Reflexiones",
        body: "Mensajes breves para escuchar en cualquier momento y llevar la Palabra a la vida diaria.",
      },
      {
        title: "Programas especiales",
        body: "Espacios de formacion, oracion y conversacion sobre temas de interes para la comunidad.",
      },
      {
        title: "Archivo sonoro",
        body: "Una biblioteca progresiva con contenidos seleccionados de La Voz de Jesus.",
      },
    ]}
    cta={{ label: "Escuchar en vivo", to: "/radio" }}
  />
);

export const Eventos = () => (
  <InfoPage
    title="Eventos"
    eyebrow="Agenda catolica"
    description="Informacion de encuentros, celebraciones, transmisiones especiales y actividades de la comunidad."
    icon={<CalendarDays className="h-8 w-8" />}
    sections={[
      {
        title: "Celebraciones",
        body: "Agenda de momentos liturgicos, jornadas de oracion y actividades especiales.",
      },
      {
        title: "Transmisiones",
        body: "Eventos que podran acompanarse desde la radio y los canales digitales de la emisora.",
      },
      {
        title: "Comunidad",
        body: "Invitaciones y espacios para unirnos como familia de fe.",
      },
    ]}
    cta={{ label: "Ver programacion", to: "/programacion" }}
  />
);

export const Donar = () => (
  <InfoPage
    title="Donar"
    eyebrow="Sostener la mision"
    description="Tu apoyo ayuda a mantener viva esta obra de evangelizacion, radio, oracion y servicio a la comunidad."
    icon={<HandHeart className="h-8 w-8" />}
    sections={[
      {
        title: "Evangelizacion",
        body: "Cada aporte ayuda a sostener transmisiones, contenidos y herramientas digitales al servicio de la fe.",
      },
      {
        title: "Comunidad",
        body: "La emisora crece con la generosidad de quienes creen en este proyecto catolico.",
      },
      {
        title: "Transparencia",
        body: "Los canales formales de donacion se comunicaran de manera clara desde la emisora.",
      },
    ]}
    cta={{ label: "Contactar", to: "/contacto" }}
  />
);

export const AcercaDe = () => (
  <InfoPage
    title="Quienes somos"
    eyebrow="La Voz de Jesus"
    description="Somos una emisora catolica digital al servicio de la evangelizacion, la oracion y el encuentro con Dios."
    icon={<Sparkles className="h-8 w-8" />}
    sections={[
      {
        title: "Mision",
        body: "Anunciar a Cristo con contenidos que inspiren oracion, esperanza y vida sacramental.",
      },
      {
        title: "Identidad",
        body: "Una propuesta catolica con estilo cercano, respetuoso y centrado en la comunidad.",
      },
      {
        title: "Servicio",
        body: "Acompanamos al oyente con radio en vivo, programacion, lecturas y recursos espirituales.",
      },
    ]}
    cta={{ label: "Escuchar ahora", to: "/radio" }}
  />
);

export const PoliticaPrivacidad = () => (
  <InfoPage
    title="Politica de privacidad"
    eyebrow="Privacidad y datos"
    description="Informacion basica sobre el uso responsable de datos, contacto, servicios externos y publicidad en la PWA."
    icon={<ShieldCheck className="h-8 w-8" />}
    sections={[
      {
        title: "Datos de contacto",
        body: "Cuando escribes por correo o WhatsApp, usamos tus datos solo para responder tu solicitud o mensaje.",
      },
      {
        title: "Servicios externos",
        body: "La app puede usar servicios de radio, Google Sheets, analitica tecnica y publicidad para operar correctamente.",
      },
      {
        title: "Publicidad",
        body: "Los espacios publicitarios pueden usar tecnologias de terceros conforme a sus politicas de privacidad y cookies.",
      },
    ]}
    cta={{ label: "Contacto", to: "/contacto" }}
  />
);

export const TerminosCondiciones = () => (
  <InfoPage
    title="Terminos y condiciones"
    eyebrow="Uso del sitio"
    description="Condiciones generales para utilizar la PWA La Voz de Jesus y sus contenidos digitales."
    icon={<FileText className="h-8 w-8" />}
    sections={[
      {
        title: "Contenido",
        body: "Los textos, audios, imagenes y recursos se ofrecen para acompanamiento espiritual e informacion general.",
      },
      {
        title: "Uso responsable",
        body: "El usuario se compromete a usar el sitio de manera respetuosa y conforme a su finalidad evangelizadora.",
      },
      {
        title: "Cambios",
        body: "La programacion, contenidos y funcionalidades pueden actualizarse para mejorar el servicio.",
      },
    ]}
    cta={{ label: "Volver al inicio", to: "/" }}
  />
);
