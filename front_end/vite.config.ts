import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    // Ce plugin remet "process", "Buffer", etc. pour tes contrats/libs web3
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      process: "process/browser",
      util: "util",
    },
  },
  // On garde le dossier 'build' pour ne pas perturber tes habitudes de déploiement
  build: {
    outDir: 'build',
  }
})