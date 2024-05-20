// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "file:///C:/Users/edmun/OneDrive/Documents/_SPACE/EyePop/64blit/EyePopDemos/node/3D%20Workout%20Tracker/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/edmun/OneDrive/Documents/_SPACE/EyePop/64blit/EyePopDemos/node/3D%20Workout%20Tracker/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///C:/Users/edmun/OneDrive/Documents/_SPACE/EyePop/64blit/EyePopDemos/node/3D%20Workout%20Tracker/node_modules/tailwindcss/lib/index.js";
import { nodePolyfills } from "file:///C:/Users/edmun/OneDrive/Documents/_SPACE/EyePop/64blit/EyePopDemos/node/3D%20Workout%20Tracker/node_modules/vite-plugin-node-polyfills/dist/index.js";
import json5Plugin from "file:///C:/Users/edmun/OneDrive/Documents/_SPACE/EyePop/64blit/EyePopDemos/node/3D%20Workout%20Tracker/node_modules/vite-plugin-json5/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\edmun\\OneDrive\\Documents\\_SPACE\\EyePop\\64blit\\EyePopDemos\\node\\3D Workout Tracker";
var server = process.env.APP_ENV === "sandbox" ? { hmr: { clientPort: 443 } } : {};
var vite_config_default = defineConfig({
  server,
  resolve: {
    alias: {
      "@src": resolve(__vite_injected_original_dirname, "./src")
    }
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
  plugins: [
    react(),
    nodePolyfills(),
    json5Plugin()
    // CustomHmr() 
  ],
  css: {
    postcss: {
      plugins: [tailwindcss]
    }
  },
  assetsInclude: ["**/*.glb", "**/*.ttf"]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxlZG11blxcXFxPbmVEcml2ZVxcXFxEb2N1bWVudHNcXFxcX1NQQUNFXFxcXEV5ZVBvcFxcXFw2NGJsaXRcXFxcRXllUG9wRGVtb3NcXFxcbm9kZVxcXFwzRCBXb3Jrb3V0IFRyYWNrZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGVkbXVuXFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxfU1BBQ0VcXFxcRXllUG9wXFxcXDY0YmxpdFxcXFxFeWVQb3BEZW1vc1xcXFxub2RlXFxcXDNEIFdvcmtvdXQgVHJhY2tlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZWRtdW4vT25lRHJpdmUvRG9jdW1lbnRzL19TUEFDRS9FeWVQb3AvNjRibGl0L0V5ZVBvcERlbW9zL25vZGUvM0QlMjBXb3Jrb3V0JTIwVHJhY2tlci92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBDdXN0b21IbXIgZnJvbSBcIi4vdml0ZS11dGlscy9DdXN0b21IbXIuanNcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwidGFpbHdpbmRjc3NcIjtcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscydcbmltcG9ydCBqc29uNVBsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1qc29uNSdcblxuLy8gVGhpcyBpcyByZXF1aXJlZCBmb3IgVml0ZSB0byB3b3JrIGNvcnJlY3RseSB3aXRoIENvZGVTYW5kYm94XG5jb25zdCBzZXJ2ZXIgPSBwcm9jZXNzLmVudi5BUFBfRU5WID09PSBcInNhbmRib3hcIiA/IHsgaG1yOiB7IGNsaWVudFBvcnQ6IDQ0MyB9IH0gOiB7fTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjogc2VydmVyLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQHNyY1wiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5qc2AsXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5qc2AsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiBgYXNzZXRzL1tuYW1lXS5bZXh0XWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHBsdWdpbnM6IFsgcmVhY3QoKSwgXG4gICAgbm9kZVBvbHlmaWxscygpLFxuICAgIGpzb241UGx1Z2luKClcbiAgICAvLyBDdXN0b21IbXIoKSBcbiAgXSxcbiAgY3NzOiB7XG4gICAgcG9zdGNzczoge1xuICAgICAgcGx1Z2luczogWyB0YWlsd2luZGNzcyBdLFxuICAgIH0sXG4gIH0sXG4gIGFzc2V0c0luY2x1ZGU6IFsnKiovKi5nbGInLCAnKiovKi50dGYnLCBdXG59KTtcblxuXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBkLFNBQVMsZUFBZTtBQUNsZixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFFbEIsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxxQkFBcUI7QUFDOUIsT0FBTyxpQkFBaUI7QUFOeEIsSUFBTSxtQ0FBbUM7QUFTekMsSUFBTSxTQUFTLFFBQVEsSUFBSSxZQUFZLFlBQVksRUFBRSxLQUFLLEVBQUUsWUFBWSxJQUFJLEVBQUUsSUFBSSxDQUFDO0FBR25GLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxRQUFRLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3BDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQUUsTUFBTTtBQUFBLElBQ2YsY0FBYztBQUFBLElBQ2QsWUFBWTtBQUFBO0FBQUEsRUFFZDtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUyxDQUFFLFdBQVk7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGVBQWUsQ0FBQyxZQUFZLFVBQVk7QUFDMUMsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
