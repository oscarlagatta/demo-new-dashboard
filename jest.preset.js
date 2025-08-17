const { workspaceRoot } = require("@nx/devkit")

module.exports = {
  testMatch: ["**/+(*.)+(spec|test).+(ts|js)?(x)"],
  transform: {
    "^.+\\.(ts|js|html)$": "ts-jest",
  },
  resolver: "@nx/jest/plugins/resolver",
  moduleFileExtensions: ["ts", "js", "html"],
  coverageReporters: ["html"],
  passWithNoTests: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/dist/**",
  ],
  setupFilesAfterEnv: [`${workspaceRoot}/jest.setup.js`],
}
