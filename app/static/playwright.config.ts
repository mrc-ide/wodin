import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
    testMatch: '*.etest.ts',
    use: {
        baseURL: "http://localhost:3000",
        screenshot: "only-on-failure",
        actionTimeout: 0,
        contextOptions: {
            permissions: ["clipboard-read", "clipboard-write"]
        }
    },
    timeout: 60000,
    workers: 1
};

export default config;
