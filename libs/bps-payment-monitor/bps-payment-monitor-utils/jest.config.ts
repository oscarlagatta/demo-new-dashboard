export default {
  displayName: "bps-payment-monitor-utils",
  preset: "../../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { presets: [["@babel/preset-env", { targets: { node: "current" } }]] }],
  },
  moduleFileExtensions: ["ts", "js"],
  coverageDirectory: "../../../coverage/libs/bps-payment-monitor/bps-payment-monitor-utils",
}
