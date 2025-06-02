import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
      dirs: [path.resolve("src/app/components"), path.resolve("src/app/layouts")]
    }),
    tailwindcss()
  ],
  root: "./src/app",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
      "#src": fileURLToPath(new URL("src", import.meta.url))
    }
  },
  publicDir: fileURLToPath(new URL("public", import.meta.url)),
  build: {
    manifest: true,
    outDir: path.resolve("build/client"),
    rollupOptions: {
      input: {
        main: "./src/app/index.html"
      }
    }
  },
  optimizeDeps: {
    force: true
  }
});
