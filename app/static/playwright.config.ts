import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
    testMatch: '*.etest.ts',
    use: {
        baseURL: "http://localhost:3000",
        screenshot: "only-on-failure",
        actionTimeout: 0
    },
    timeout: 120000,
    workers: 1
};

export default config;
