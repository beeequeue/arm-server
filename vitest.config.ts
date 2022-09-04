import { defineConfig } from "vitest/config"

export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      "@": "./src",
      nanoid: require.resolve("nanoid"),
    },
  },

  test: {
    env: {
      NODE_ENV: "test",
    },

    coverage: {
      enabled: command === "serve",
      exclude: ["config.ts"],

      lines: 90,
      functions: 85,
      branches: 85,
      statements: 90,
    },
  },
}))
