module.exports = {
    preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
    transform: {
        "^.+\\.vue$": "vue-jest"
    },
    collectCoverage: true,
    testMatch: [
        "**/?(*.)test.(js|ts)"
    ],
    coveragePathIgnorePatterns: [
        "./tests/mocks.ts"
    ],
    transformIgnorePatterns: ["node_modules/(?!(d3-format))"]
};
