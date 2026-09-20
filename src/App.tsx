import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RadioPlayerProvider } from "@/context/RadioPlayerContext";
import Index from "./pages/Index.tsx";
import PrayerReminderScheduler from "@/modules/prayers/components/PrayerReminderScheduler";

const RosarioHome = lazy(() => import("@/modules/rosary/pages/RosarioHome"));
const RosarioModalidad = lazy(() => import("@/modules/rosary/pages/RosarioModalidad"));
const RosarioIntencion = lazy(() => import("@/modules/rosary/pages/RosarioIntencion"));
const RosarioSeleccionMisterios = lazy(() => import("@/modules/rosary/pages/RosarioSeleccionMisterios"));
const RosarioDigital = lazy(() => import("@/modules/rosary/pages/RosarioDigital"));
const RosarioFisico = lazy(() => import("@/modules/rosary/pages/RosarioFisico"));
const RosarioAudio = lazy(() => import("@/modules/rosary/pages/RosarioAudio"));
const RosarioMisterios = lazy(() => import("@/modules/rosary/pages/RosarioMisterios"));
const RosarioConfiguracion = lazy(() => import("@/modules/rosary/pages/RosarioConfiguracion"));
const RosarioDescargas = lazy(() => import("@/modules/rosary/pages/RosarioDescargas"));
const RosarioDiario = lazy(() => import("@/modules/rosary/pages/RosarioDiario"));
const RosarioInfo = lazy(() => import("@/modules/rosary/pages/RosarioInfo"));
const Podcast = lazy(() => import("@/modules/podcast/pages/PodcastHome"));
const PodcastSeries = lazy(() => import("@/modules/podcast/pages/PodcastSeries"));
const PodcastExternalSeries = lazy(() => import("@/modules/podcast/pages/PodcastExternalSeries"));
const Oraciones = lazy(() => import("@/modules/prayers/pages/Oraciones"));
const LiturgiaHoras = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.LiturgiaHoras })));
const LiturgiaReader = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.LiturgiaReader })));
const OracionCategorias = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.OracionCategorias })));
const OracionLista = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.OracionLista })));
const OracionDetalle = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.OracionDetalle })));
const DevocionesOraciones = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.DevocionesPage })));
const DevocionDetalle = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.DevocionDetalle })));
const MisOraciones = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.MisOraciones })));
const PeticionOracion = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.PeticionOracion })));
const PrayerReminders = lazy(() => import("@/modules/prayers/pages/Oraciones").then((module) => ({ default: module.PrayerReminders })));

const Contacto = lazy(() => import("./pages/Contacto.tsx"));
const LecturasDelDia = lazy(() => import("./pages/LecturasDelDia.tsx"));
const Programacion = lazy(() => import("./pages/Programacion.tsx"));
const Radio = lazy(() => import("./pages/Radio.tsx"));
const Capilla = lazy(() => import("./pages/Capilla.tsx"));
const Intenciones = lazy(() => import("./pages/Intenciones.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const BibliaHome = lazy(() => import("./pages/biblia/BibliaHome.tsx"));
const BibliaBuscar = lazy(() => import("./pages/biblia/BibliaBuscar.tsx"));
const BibliaLeer = lazy(() => import("./pages/biblia/BibliaLeer.tsx"));
const BibliaComparar = lazy(() => import("./pages/biblia/BibliaComparar.tsx"));
const BibliaProximamente = lazy(() => import("./pages/biblia/BibliaProximamente.tsx"));
const BibliaEstudio = lazy(() => import("./pages/biblia/BibliaEstudio.tsx"));
const BibliaMapas = lazy(() => import("./pages/biblia/BibliaMapas.tsx"));
const BibliaPersonajes = lazy(() => import("./pages/biblia/BibliaPersonajes.tsx"));
const BibliaLibros = lazy(() => import("./pages/biblia/BibliaLibros.tsx"));
const BibliaFavoritos = lazy(() => import("./pages/biblia/BibliaFavoritos.tsx"));
const BibliaMiBiblia = lazy(() => import("./pages/biblia/BibliaMiBiblia.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const AcercaDe = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.AcercaDe })));
const Devociones = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.Devociones })));
const Donar = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.Donar })));
const Eventos = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.Eventos })));
const Formacion = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.Formacion })));
const Liturgia = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.Liturgia })));
const PoliticaPrivacidad = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.PoliticaPrivacidad })));
const TerminosCondiciones = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.TerminosCondiciones })));
const Testimonios = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.Testimonios })));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RadioPlayerProvider>
        <PrayerReminderScheduler />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen bg-background" aria-label="Cargando contenido" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/radio" element={<Radio />} />
              <Route path="/capilla" element={<Capilla />} />
              <Route path="/capilla-virtual" element={<Capilla />} />
              <Route path="/capilla/intenciones" element={<Intenciones />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/lecturas-del-dia" element={<LecturasDelDia />} />
              <Route path="/lectura-del-dia" element={<LecturasDelDia />} />
              <Route path="/programacion" element={<Programacion />} />
              <Route path="/biblia" element={<BibliaHome />} />
              <Route path="/Biblia" element={<BibliaHome />} />
              <Route path="/biblia/buscar" element={<BibliaBuscar />} />
              <Route path="/biblia/leer" element={<BibliaLeer />} />
              <Route path="/biblia/libros" element={<BibliaLibros />} />
              <Route path="/biblia/favoritos" element={<BibliaFavoritos />} />
              <Route path="/biblia/mi-biblia" element={<BibliaMiBiblia />} />
              <Route path="/biblia/comparar" element={<BibliaComparar />} />
              <Route path="/biblia/estudio" element={<BibliaEstudio />} />
              <Route path="/biblia/estudio/:id" element={<BibliaEstudio />} />
              <Route path="/biblia/mapas" element={<BibliaMapas />} />
              <Route path="/biblia/personajes" element={<BibliaPersonajes />} />
              <Route path="/biblia/explorar" element={<BibliaPersonajes />} />
              <Route path="/biblia/:section" element={<BibliaProximamente />} />
              <Route path="/acceso" element={<Auth />} />
              <Route path="/acceso/recuperar" element={<Auth />} />
              <Route path="/devociones" element={<Devociones />} />
              <Route path="/liturgia" element={<Liturgia />} />
              <Route path="/formacion" element={<Formacion />} />
              <Route path="/testimonios" element={<Testimonios />} />
              <Route path="/podcast" element={<Podcast />} />
              <Route path="/podcast/santos-arcangeles-33-dias" element={<PodcastSeries />} />
              <Route path="/podcast/rss/:slug" element={<PodcastExternalSeries />} />
              <Route path="/oraciones" element={<Oraciones />} />
              <Route path="/oraciones/liturgia" element={<LiturgiaHoras />} />
              <Route path="/oraciones/liturgia/:hora" element={<LiturgiaReader />} />
              <Route path="/oraciones/categorias" element={<OracionCategorias />} />
              <Route path="/oraciones/categoria/:categoria" element={<OracionLista />} />
              <Route path="/oraciones/oracion/:id" element={<OracionDetalle />} />
              <Route path="/oraciones/devociones" element={<DevocionesOraciones />} />
              <Route path="/oraciones/devociones/:slug" element={<DevocionDetalle />} />
              <Route path="/oraciones/mis-oraciones" element={<MisOraciones />} />
              <Route path="/oraciones/peticion" element={<PeticionOracion />} />
              <Route path="/oraciones/recordatorios" element={<PrayerReminders />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/donar" element={<Donar />} />
              <Route path="/acerca-de" element={<AcercaDe />} />
              <Route path="/quienes-somos" element={<AcercaDe />} />
              <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
              <Route path="/privacidad" element={<PoliticaPrivacidad />} />
              <Route path="/terminos" element={<TerminosCondiciones />} />
              <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />

              <Route path="/rosario" element={<RosarioHome />} />
              <Route path="/rosario/modalidad" element={<RosarioModalidad />} />
              <Route path="/rosario/intencion" element={<RosarioIntencion />} />
              <Route path="/rosario/seleccionar-misterios" element={<RosarioSeleccionMisterios />} />
              <Route path="/rosario/configuracion" element={<RosarioConfiguracion />} />
              <Route path="/rosario/digital" element={<RosarioDigital />} />
              <Route path="/rosario/fisico" element={<RosarioFisico />} />
              <Route path="/rosario/audio" element={<RosarioAudio />} />
              <Route path="/rosario/misterios" element={<RosarioMisterios />} />
              <Route path="/rosario/descargas" element={<RosarioDescargas />} />
              <Route path="/rosario/diario" element={<RosarioDiario />} />
              <Route path="/rosario/informacion" element={<RosarioInfo />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </RadioPlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
