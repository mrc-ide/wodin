import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
    testMatch: '*.etest.ts',
    use: {
        baseURL: "http://localhost:3000"
    },
    workers: 1,
    retries: 1
};

export default config;
