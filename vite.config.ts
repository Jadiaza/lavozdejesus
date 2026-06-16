import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "La Voz de Jesús",
        short_name: "Voz de Jesús",
        description: "Radio Católica 24/7 — Adora al Santísimo en cualquier lugar.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0a0f1f",
        theme_color: "#0a0f1f",
        lang: "es",
        categories: ["music", "lifestyle", "education"],
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "lvdj-pages",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && ["style", "script", "worker", "font"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "lvdj-assets",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "lvdj-images",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
