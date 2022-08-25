import {
    flushRedis, getRedisValue, expectRedisJSONValue, post
} from "./utils";

describe("Session integration", () => {
    afterEach(async () => {
        await flushRedis();
    });

    const redisKeyPrefix = "WODIN Example:day1:sessions:";
    const sessionId = "1234";
    const url = `apps/day1/sessions/${sessionId}`;

    it("can post new session", async () => {
        const data = { test: "value" };
        const response = await post(url, data);
        expect(response.status).toBe(200);
        await expectRedisJSONValue(`${redisKeyPrefix}data`, sessionId, data);
        const time = await getRedisValue(`${redisKeyPrefix}time`, sessionId);
        const date = Date.parse(time!);
        expect(Date.now() - date).toBeLessThan(1000); // expect saved time to be in last second
    });

    it("can update session", async () => {
        const oldData = { test: "oldValue" };
        await post(url, oldData);
        const oldTime = await getRedisValue(`${redisKeyPrefix}time`, sessionId);

        const newData = { test: "newValue" };
        const response = await post(url, newData);
        expect(response.status).toBe(200);
        await expectRedisJSONValue(`${redisKeyPrefix}data`, sessionId, newData);

        const newTime = await getRedisValue(`${redisKeyPrefix}time`, sessionId);
        expect(Date.parse(newTime!)).toBeGreaterThan(Date.parse(oldTime!));
    });
});
