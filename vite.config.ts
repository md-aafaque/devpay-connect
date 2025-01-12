import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Define environment variable for development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Vite configuration
export default defineConfig({
  build: {
    outDir: "dist",
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    isDevelopment && componentTagger(), // Include loggable-tagger only in development
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});