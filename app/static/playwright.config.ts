import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
    testMatch: "*.etest.ts",
    fullyParallel: true,
    workers: process.env.CI ? 2 : 4,
    use: {
        baseURL: "http://localhost:3000",
        screenshot: "only-on-failure",
        actionTimeout: 0,
        contextOptions: {
            permissions: ["clipboard-read", "clipboard-write"]
        }
    },
    timeout: 30000
};

export default config;
