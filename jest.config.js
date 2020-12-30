const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

module.exports = {
  roots: ['<rootDir>/src'],
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  coveragePathIgnorePatterns: ['sentry.ts', 'utils.ts'],
  collectCoverage: true,
  coverageReporters: ['text', 'text-summary'],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 75,
      functions: 80,
      lines: 90,
    },
  },
}
