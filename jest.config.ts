import { Config } from "@jest/types"

export default <Config.InitialOptions>{
  testMatch: ["<rootDir>/tests/**/*.test.ts"],

  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts"],

  transform: {
    ".(js|jsx|ts|tsx)": "@sucrase/jest-plugin",
  },

  collectCoverage: true,
  coverageReporters: ["text", "text-summary"],
  coveragePathIgnorePatterns: [
    "knexfile.ts",
    "tests/utils.ts",
    "_sentry.ts",
    "_manual-rules.ts",
    "_knex.ts",
    "_logger.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 65,
      functions: 80,
      lines: 90,
    },
  },
}
