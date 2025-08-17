export default {
  displayName: "feature-payment-monitor-layout",
  preset: "../../../../jest.preset.js",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { presets: [["@babel/preset-env", { targets: { node: "current" } }]] }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../../../coverage/libs/bps-payment-monitor/features/feature-payment-monitor-layout",
}
