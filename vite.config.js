import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tmdbHandler from "./api/tmdb.js";

// Serve the /api/tmdb function during `vite dev`, mirroring the Vercel deployment.
const tmdbApi = () => ({
  name: "tmdb-api",
  configureServer(server) {
    server.middlewares.use("/api/tmdb", (req, res) => {
      req.url = req.originalUrl;
      tmdbHandler(req, res);
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.TMDB_API_KEY ??= env.TMDB_API_KEY;

  return {
    plugins: [react(), tailwindcss(), tmdbApi()],
  };
});
