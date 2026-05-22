import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  // Projekt-Root (Quelldateien in src/)
  root: 'src',

  // Server Konfiguration für Entwicklung
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // Build Konfiguration
  build: {
    // Ausgabeverzeichnis (relativ zu root, also projekt-root/dist/)
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",

    // Code Optimierung
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        // Behalte bestimmte Namen für Debugging (optional)
        reserved: ["console"],
      },
    },

    // Chunk Größenoptimierung
     rollupOptions: {
        output: {
          // Optimiere Dateinamen
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
      },

    // Source Maps
    sourcemap: false, // Keine Sourcemap für Production

    // Asset Größen Limit
    assetsInlineLimit: 4096,
  },

  // CSS Konfiguration
  css: {
    // CSS Module Unterstützung
    modules: {
      localsConvention: "camelCase",
    },

    // PostCSS Konfiguration
    postcss: "./postcss.config.js",
  },

  // Resolving für Importe
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },

  // Plugin Konfiguration
  plugins: [
    // Hier können später Vite Plugins hinzugefügt werden
  ],

  // Optimierung
  optimizeDeps: {
    include: [],
    exclude: [],
  },
});
