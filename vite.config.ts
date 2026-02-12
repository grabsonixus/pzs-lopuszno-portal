import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    // WAŻNE: To ustawienie jest kluczowe dla działania w podkatalogu na serwerze
    base: "/",

    server: {
      port: 3000,
      host: "0.0.0.0",
    },

    build: {
      outDir: "dist",
      assetsDir: "assets",
      chunkSizeWarningLimit: 700,

      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes("node_modules")) {
              // Pocketbase (often large)
              if (id.includes("pocketbase")) {
                return "vendor-pocketbase";
              }

              // Rich editors / UI libraries that can be big
              if (id.includes("suneditor") || id.includes("suneditor-react")) {
                return "vendor-editor";
              }

              // Icon libs
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }

              // Fallback vendor chunk for other node_modules
              return "vendor";
            }
          },
        },
      },
    },

    plugins: [react()],

    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
