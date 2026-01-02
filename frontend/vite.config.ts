import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@lotteryeverysecond/backend": path.resolve(
        __dirname,
        "../backend/mod.ts",
      ),
    },
  },
  server: {
    proxy: {
      "/ws": {
        target: "ws://localhost:3350",
        ws: true,
      },
      "/history": {
        target: "http://localhost:3350",
        changeOrigin: true,
      },
    },
  },
});
