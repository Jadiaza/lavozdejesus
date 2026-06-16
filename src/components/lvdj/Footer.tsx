import { Facebook, Instagram, Youtube, Twitter, Apple, Smartphone } from "lucide-react";
import { Logo } from "./Logo";

const cols = [
  { title: "Estación", links: ["Inicio", "Radio en Vivo", "Programación", "Podcast", "Videos"] },
  { title: "Comunidad", links: ["Peticiones de Oración", "Grupos", "Eventos", "Testimonios", "Voluntariado"] },
  { title: "Recursos", links: ["Evangelio del Día", "Catequesis", "Liturgia", "Santoral", "Biblioteca"] },
  { title: "Institución", links: ["Sobre Nosotros", "Equipo", "Contacto", "Donaciones", "Prensa"] },
];

export const Footer = () => (
  <footer className="relative mt-20 border-t border-[hsl(var(--gold)/0.15)] bg-navy-deep">
    <div className="absolute inset-x-0 top-0 h-px gold-divider" />
    <div className="container py-16">
      <div className="grid lg:grid-cols-[1.5fr_2fr_1.2fr] gap-12">
        <div>
          <Logo />
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-sm">
            Una emisora católica al servicio de la nueva evangelización.
            Llevamos la voz de Cristo a cada hogar, las 24 horas del día.
          </p>
          <div className="flex gap-3 mt-6">
            {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="h-10 w-10 rounded-full glass flex items-center justify-center hover:text-gold hover:border-[hsl(var(--gold)/0.5)] transition">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs uppercase tracking-[0.2em] text-gold mb-4">{c.title}</div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-foreground/70 hover:text-gold transition">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Descarga la app</div>
          <p className="text-sm text-muted-foreground mb-5">Lleva la oración contigo a donde vayas.</p>
          <div className="space-y-3">
            <a href="#" className="flex items-center gap-3 glass rounded-2xl px-4 py-3 hover:border-[hsl(var(--gold)/0.5)] transition">
              <Apple className="h-7 w-7 text-gold" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Descarga en</div>
                <div className="text-sm font-semibold">App Store</div>
              </div>
            </a>
            <a href="#" className="flex items-center gap-3 glass rounded-2xl px-4 py-3 hover:border-[hsl(var(--gold)/0.5)] transition">
              <Smartphone className="h-7 w-7 text-gold" />
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Disponible en</div>
                <div className="text-sm font-semibold">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-[hsl(var(--gold)/0.1)] flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div>© 2026 La Voz de Jesús · Todos los derechos reservados.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gold">Privacidad</a>
          <a href="#" className="hover:text-gold">Términos</a>
          <a href="#" className="hover:text-gold">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);