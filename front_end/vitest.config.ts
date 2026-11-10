// Config Vitest (OPTIONNELLE, hors build) : n'affecte ni `tsc` (include: src) ni `vite build`.
// Installation : npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
// Lancement   : npx vitest run
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: { postcss: { plugins: [] } }, // les tests n'ont pas besoin de Tailwind/PostCSS
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    css: false,
  },
});
