import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// import { visualizer } from "rollup-plugin-visualizer";

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      globals: {
        Buffer: true
      }
    }),
    // enable to visualise bundle size with its components
    // visualizer({
    //   emitFile: true,
    //   filename: "stats.html"
    // })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, './src/wodin.ts'),
      output: {
        entryFileNames: "wodin.js",
        assetFileNames: "wodin.css",
        // chunkFileNames: "chunk.[name].js",
        // manualChunks: (id) => {
        //   if (id.includes("plotly")) return "plotly"
        //   if (id.includes("xlsx")) return "xlsx"
        //   if (id.includes("bootstrap")) return "bootstrap"
        //   if (id.includes("i18next")) return "i18next"
        //   if (id.includes("feather-icons")) return "feather-icons"
        // }
      }
    }
  },
})
