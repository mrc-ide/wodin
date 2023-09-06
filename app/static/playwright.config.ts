import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
    testMatch: "*.etest.ts",
    workers: 1,
    use: {
        baseURL: "http://localhost:3000",
        screenshot: "only-on-failure",
        actionTimeout: 0,
        contextOptions: {
            permissions: ["clipboard-read", "clipboard-write"]
        }
    },
    retries: 1,
    timeout: 60000
};

export default config;
