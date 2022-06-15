import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
    testMatch: '*.etest.ts',
    use: {
        baseURL: "http://localhost:3000",
        screenshot: "only-on-failure"
    },
    retries: 1,
    timeout: 10000
};

export default config;
