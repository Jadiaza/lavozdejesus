import { createRoot } from "react-dom/client";
import "@fontsource/literata/latin-400.css";
import "@fontsource/literata/latin-600.css";
import "@fontsource/literata/latin-700.css";
import App from "./App.tsx";
import "./index.css";
import "./eink-theme.css";
import { registerSW } from "./pwa/registerSW";

const hashParameters = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const queryParameters = new URLSearchParams(window.location.search);
const isPasswordRecoveryLink = hashParameters.get("type") === "recovery"
  || queryParameters.get("type") === "recovery";

if (isPasswordRecoveryLink && window.location.pathname !== "/acceso/recuperar") {
  window.history.replaceState(
    {},
    "",
    `/acceso/recuperar${window.location.search}${window.location.hash}`,
  );
}

const rootElement = document.getElementById("root")!;
const renderApp = () => {
  createRoot(rootElement).render(<App />);
};

// La PWA monta la aplicación inmediatamente. El splash inicial, si existe,
// es solo visual y no debe retrasar el montaje de React ni la validación
// de acceso de los módulos.
renderApp();

registerSW();
