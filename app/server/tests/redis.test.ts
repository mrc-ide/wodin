import { redisConnection } from "../src/redis";

describe("redis", () => {
    const mockConsoleLog = jest.fn();
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
        jest.clearAllMocks();
    });

    it("can connect", (done) => {
        const errorCallback = jest.fn();
        const redis = redisConnection("redis://localhost:6379", errorCallback);
        setTimeout(() => {
            redis.disconnect();
            expect(mockConsoleLog).toBeCalledTimes(1);
            expect(mockConsoleLog.mock.calls[0][0])
                .toBe("Connected to Redis server redis://localhost:6379");
            expect(errorCallback).not.toHaveBeenCalled();
            done();
        }, 200);
    });

    it("calls error callback if cannot connect", (done) => {
        const errorCallback = jest.fn();
        redisConnection("redis://localhost:1234", errorCallback);
        setTimeout(() => {
            expect(mockConsoleLog.mock.calls[0][0].message)
                .toContain("connect ECONNREFUSED 127.0.0.1:1234");
            expect(errorCallback).toHaveBeenCalled();
            done();
        }, 200);
    });
});
