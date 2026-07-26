import { createRoot } from "react-dom/client";
import "@fontsource/literata/latin-400.css";
import "@fontsource/literata/latin-600.css";
import "@fontsource/literata/latin-700.css";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "./pwa/registerSW";

const rootElement = document.getElementById("root")!;
const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
const mobileSplashDelay = 1_200;

const renderApp = () => {
  createRoot(rootElement).render(<App />);
};

if (isMobileViewport) {
  window.setTimeout(renderApp, mobileSplashDelay);
} else {
  renderApp();
}

registerSW();
