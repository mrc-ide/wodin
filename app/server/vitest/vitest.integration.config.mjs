import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import baseConfig from "./base-vitest.config.mjs";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["**/integration/*.(test|itest).ts"],
      exclude: configDefaults.exclude
    }
  })
);
