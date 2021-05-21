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
  coveragePathIgnorePatterns: ["_sentry.ts", "tests/utils.ts"],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 70,
      functions: 80,
      lines: 90,
    },
  },
}
