import { ArrowLeft, Headphones, Mail, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/lvdj/Logo";
import { DEFAULT_APP_CONFIG, getAppConfig } from "@/services/sheetsService";

const Contacto = () => {
  const navigate = useNavigate();
  const [contact, setContact] = useState({
    email: DEFAULT_APP_CONFIG.contact_email,
    whatsappUrl: DEFAULT_APP_CONFIG.contact_whatsapp_url,
  });

  useEffect(() => {
    let mounted = true;

    getAppConfig()
      .then((config) => {
        if (!mounted) return;

        setContact({
          email: config.contact_email,
          whatsappUrl: config.contact_whatsapp_url,
        });
      })
      .catch((error) => console.error("Contact config error:", error));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="lvj-sacred-page px-4 py-6 sm:px-6">
      <div className="lvj-sacred-backdrop" />
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="lvj-sacred-icon-button h-10 w-10"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Logo size="sm" />
          <span className="h-10 w-10" />
        </header>

        <section className="lvj-sacred-panel relative my-auto p-6 text-center sm:p-8">
          <div className="lvj-sacred-icon mx-auto mb-5 h-16 w-16 rounded-full">
            <Headphones className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Contacto</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-foreground/72">
            Estamos para servirte y atender alianzas, anuncios y mensajes para
            nuestra comunidad.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={`mailto:${contact.email}?subject=Contacto%20La%20Voz%20de%20Jesus`}
              className="lvj-sacred-button"
            >
              <Mail className="h-4 w-4" />
              Escribir correo
            </a>
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="lvj-sacred-button-secondary"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contacto;
