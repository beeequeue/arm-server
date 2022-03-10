import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    coverage: {
      lines: 90,
      functions: 85,
      branches: 85,
      statements: 90,
    },
  },
})
