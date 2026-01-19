import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../shared", import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8787"
    }
  }
});
