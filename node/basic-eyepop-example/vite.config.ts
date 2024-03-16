import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import CustomHmr from "./vite-utils/CustomHmr.js";
import tailwindcss from "tailwindcss";

// This is required for Vite to work correctly with CodeSandbox
const server = process.env.APP_ENV === "sandbox" ? { hmr: { clientPort: 443 } } : {};

// https://vitejs.dev/config/
export default defineConfig({
  server: server,
  resolve: {
    alias: {
      "@src": resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  plugins: [ react(), 
    // CustomHmr() 
  ],
  css: {
    postcss: {
      plugins: [ tailwindcss ],
    },
  },

});


