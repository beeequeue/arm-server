import path from "node:path"

import { defineConfig } from "vitest/config"

export default defineConfig(({ command }) => ({
  resolve: {
    alias: { "@": path.resolve("./src") },
  },

  test: {
    reporters: ["verbose"],
    threads: false,

    env: {
      NODE_ENV: "test",
    },

    coverage: {
      enabled: command === "build",
      exclude: ["config.ts"],

      lines: 90,
      functions: 85,
      branches: 85,
      statements: 90,
    },
  },
}))
