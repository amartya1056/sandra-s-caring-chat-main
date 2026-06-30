import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // Load every variable from .env (including non-VITE_ ones such as GROQ_API_KEY
  // and SUPABASE_URL) into process.env so the server route handlers can read them
  // during `vite dev`. VITE_* vars are still exposed to the client via import.meta.env.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    server: {
      port: 3000,
    },
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
      tanstackStart({
        // src/server.ts is the SSR error-wrapping entry. This is the framework
        // default, set explicitly for clarity; nitro/vite builds from it.
        server: { entry: "server" },
      }),
      // Packages the SSR build for deployment. Nitro auto-detects the host from
      // the build environment (e.g. it selects the Vercel preset and emits
      // .vercel/output when VERCEL=1 is set, and a Node server locally).
      nitro({ compatibilityDate: "2025-06-01" }),
      viteReact(),
    ],
  };
});
