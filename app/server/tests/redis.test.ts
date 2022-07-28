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
        const redis = redisConnection("redis://localhost:6379");
        setTimeout(() => {
            redis.disconnect();
            expect(mockConsoleLog).toBeCalledTimes(1);
            expect(mockConsoleLog.mock.calls[0][0]).toBe(
                "Connected to Redis server redis://localhost:6379");
            done();
        }, 200);
    });
});
