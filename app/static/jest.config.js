module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  transform: {
    "^.+\\.vue$": "vue-jest",
    "\\.md$": "jest-raw-loader"
  },
  collectCoverage: true,
  testMatch: ["**/?(*.)test.(js|ts)"],
  coveragePathIgnorePatterns: ["./tests/mocks.ts"],
  transformIgnorePatterns: ["node_modules/(?!(d3-format))"],
  moduleNameMapper: {
    "raw-loader!.*/help/(.*)$": "<rootDir>/src/app/help/$1"
  }
};
