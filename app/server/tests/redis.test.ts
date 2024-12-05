import { redisConnection } from "../src/redis";

describe("redis", () => {
    const mockConsoleLog = vi.fn();
    const realConsoleLog = console.log;
    const realArgs = process.argv;

    beforeAll(() => {
        console.log = mockConsoleLog;
    });

    afterAll(() => {
        console.log = realConsoleLog;
        process.argv = realArgs;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("can connect", async () => {
        const errorCallback = vi.fn();
        const redis = redisConnection("redis://localhost:6379", errorCallback);
        await new Promise(res => setTimeout(res, 200));
        redis.disconnect();
        expect(mockConsoleLog).toBeCalledTimes(1);
        expect(mockConsoleLog.mock.calls[0][0])
            .toBe("Connected to Redis server redis://localhost:6379");
        expect(errorCallback).not.toHaveBeenCalled();
    });

    it("calls error callback if cannot connect", async () => {
        const errorCallback = vi.fn();
        redisConnection("redis://localhost:1234", errorCallback);
        await new Promise(res => setTimeout(res, 200));
        expect(mockConsoleLog.mock.calls[0][0].message)
            .toContain("connect ECONNREFUSED 127.0.0.1:1234");
        expect(errorCallback).toHaveBeenCalled();
    });
});
