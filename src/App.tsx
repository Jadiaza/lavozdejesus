import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RadioPlayerProvider } from "@/context/RadioPlayerContext";
import Index from "./pages/Index.tsx";

const RosarioHome = lazy(
  () => import("@/modules/rosary/pages/RosarioHome")
);

const RosarioModalidad = lazy(
  () => import("@/modules/rosary/pages/RosarioModalidad")
);

const RosarioIntencion = lazy(
  () => import("@/modules/rosary/pages/RosarioIntencion")
);

const RosarioSeleccionMisterios = lazy(
  () => import("@/modules/rosary/pages/RosarioSeleccionMisterios")
);

const RosarioDigital = lazy(
  () => import("@/modules/rosary/pages/RosarioDigital")
);

const RosarioFisico = lazy(
  () => import("@/modules/rosary/pages/RosarioFisico")
);

const RosarioAudio = lazy(
  () => import("@/modules/rosary/pages/RosarioAudio")
);

const Contacto = lazy(() => import("./pages/Contacto.tsx"));
const LecturasDelDia = lazy(() => import("./pages/LecturasDelDia.tsx"));
const Programacion = lazy(() => import("./pages/Programacion.tsx"));
const Radio = lazy(() => import("./pages/Radio.tsx"));
const Capilla = lazy(() => import("./pages/Capilla.tsx"));
const Intenciones = lazy(() => import("./pages/Intenciones.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const BibliaHome = lazy(() => import("./pages/biblia/BibliaHome.tsx"));
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
const Podcast = lazy(() => import("./pages/InfoPage.tsx").then((module) => ({ default: module.Podcast })));
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
              <Route path="/biblia/leer" element={<BibliaLeer />} />
              <Route path="/biblia/libros" element={<BibliaLibros />} />
              <Route path="/biblia/favoritos" element={<BibliaFavoritos />} />
              <Route path="/biblia/mi-biblia" element={<BibliaMiBiblia />} />
              <Route path="/biblia/comparar" element={<BibliaComparar />} />
              <Route path="/biblia/estudio" element={<BibliaEstudio />} />
              <Route path="/biblia/estudio/:id" element={<BibliaEstudio />} />
              <Route path="/biblia/mapas" element={<BibliaMapas />} />
              <Route path="/biblia/personajes" element={<BibliaPersonajes />} />
              <Route path="/biblia/:section" element={<BibliaProximamente />} />
              <Route path="/acceso" element={<Auth />} />
              <Route path="/acceso/recuperar" element={<Auth />} />
              <Route path="/devociones" element={<Devociones />} />
              <Route path="/liturgia" element={<Liturgia />} />
              <Route path="/formacion" element={<Formacion />} />
              <Route path="/testimonios" element={<Testimonios />} />
              <Route path="/podcast" element={<Podcast />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/donar" element={<Donar />} />
              <Route path="/acerca-de" element={<AcercaDe />} />
              <Route path="/quienes-somos" element={<AcercaDe />} />
              <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
              <Route path="/privacidad" element={<PoliticaPrivacidad />} />
              <Route path="/terminos" element={<TerminosCondiciones />} />
              <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
              <Route path="/rosario" element={<RosarioHome />} />

<Route
  path="/rosario/modalidad"
  element={<RosarioModalidad />}
/>

<Route
  path="/rosario/intencion"
  element={<RosarioIntencion />}
/>

<Route
  path="/rosario/seleccionar-misterios"
  element={<RosarioSeleccionMisterios />}
/>

<Route
  path="/rosario/configuracion"
  element={<Navigate to="/rosario" replace />}
/>

<Route
  path="/rosario/digital"
  element={<RosarioDigital />}
/>

<Route
  path="/rosario/fisico"
  element={<RosarioFisico />}
/>

<Route
  path="/rosario/audio"
  element={<RosarioAudio />}
/>

<Route
  path="/rosario/misterios"
  element={<Navigate to="/rosario" replace />}
/>

<Route
  path="/rosario/descargas"
  element={<Navigate to="/rosario" replace />}
/>

<Route
  path="/rosario/diario"
  element={<Navigate to="/rosario" replace />}
/>

<Route
  path="/rosario/informacion"
  element={<Navigate to="/rosario" replace />}
/>
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
