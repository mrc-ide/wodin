import { defineConfig, configDefaults, mergeConfig } from 'vitest/config'
import baseConfig from "./base-vitest.config.mjs";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      exclude: [...configDefaults.exclude, '**/integration/**'],
      coverage: {
        provider: "istanbul",
        include: ["src"],
        exclude: ["**/tests/**", "src/server/server.ts"]
      }
    }
  })
);
