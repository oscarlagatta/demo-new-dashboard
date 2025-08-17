export default {
  displayName: "bps-payment-monitor-ui",
  preset: "../../../jest.preset.js",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { presets: [["@babel/preset-env", { targets: { node: "current" } }]] }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../../coverage/libs/bps-payment-monitor/bps-payment-monitor-ui",
}
