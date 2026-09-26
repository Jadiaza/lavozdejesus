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
const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileSplashDelay = prefersReducedMotion ? 1_000 : 3_000;

const renderApp = () => {
  createRoot(rootElement).render(<App />);
};

if (isMobileViewport) {
  window.setTimeout(renderApp, mobileSplashDelay);
} else {
  renderApp();
}

registerSW();
