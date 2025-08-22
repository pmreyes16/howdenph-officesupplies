import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // All 3rd party libraries go into vendor chunk
          }

          if (id.includes("components")) {
            return "components"; // All components go into components chunk
          }

          return "index"; // Default chunk
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Adjust the limit as needed
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, "./")],
    },
  },
});
