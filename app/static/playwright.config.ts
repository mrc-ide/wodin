import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
    testMatch: '*.etest.ts',
    use: {
        baseURL: "http://localhost:3000",
        screenshot: "only-on-failure"
    },
    timeout: 10000,
    workers: 1
};

export default config;
