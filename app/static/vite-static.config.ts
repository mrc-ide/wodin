import { resolve } from 'path'
import { mergeConfig } from 'vite'
import config from "./vite-common.config"

// https://vite.dev/config/
export default mergeConfig(config, {
  build: {
    rollupOptions: {
      input: resolve(__dirname, './src/wodinStatic.ts')
    }
  }
});
