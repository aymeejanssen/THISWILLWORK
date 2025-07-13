import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  root: '.', // Optional if your project lives at root
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  // This is the key for React Router to work on refresh
  define: {
    "process.env": {},
  },
  // Optional fallback for SPA routing
  // If needed: npm install @vitejs/plugin-react-router
  // middleware or custom fallback can also be used on server
});

