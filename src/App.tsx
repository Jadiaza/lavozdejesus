import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RadioPlayerProvider } from "@/context/RadioPlayerContext";
import Index from "./pages/Index.tsx";
import Contacto from "./pages/Contacto.tsx";
import LecturasDelDia from "./pages/LecturasDelDia.tsx";
import Programacion from "./pages/Programacion.tsx";
import Radio from "./pages/Radio.tsx";
import Capilla from "./pages/Capilla.tsx";
import Intenciones from "./pages/Intenciones.tsx";
import NotFound from "./pages/NotFound.tsx";
import BibliaHome from "./pages/biblia/BibliaHome.tsx";
import BibliaLeer from "./pages/biblia/BibliaLeer.tsx";
import BibliaComparar from "./pages/biblia/BibliaComparar.tsx";
import BibliaProximamente from "./pages/biblia/BibliaProximamente.tsx";
import BibliaEstudio from "./pages/biblia/BibliaEstudio.tsx";
import BibliaMapas from "./pages/biblia/BibliaMapas.tsx";
import BibliaPersonajes from "./pages/biblia/BibliaPersonajes.tsx";
import Auth from "./pages/Auth.tsx";
import {
  AcercaDe,
  Devociones,
  Donar,
  Eventos,
  Formacion,
  Liturgia,
  Podcast,
  PoliticaPrivacidad,
  TerminosCondiciones,
  Testimonios,
} from "./pages/InfoPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RadioPlayerProvider>
        <BrowserRouter>
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
            <Route path="/biblia/comparar" element={<BibliaComparar />} />
            <Route path="/biblia/estudio" element={<BibliaEstudio />} />
            <Route path="/biblia/estudio/:id" element={<BibliaEstudio />} />
            <Route path="/biblia/mapas" element={<BibliaMapas />} />
            <Route path="/biblia/personajes" element={<BibliaPersonajes />} />
            <Route path="/biblia/:section" element={<BibliaProximamente />} />
            <Route path="/acceso" element={<Auth />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RadioPlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
