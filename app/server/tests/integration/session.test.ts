import {
    flushRedis, getRedisValue, expectRedisJSONValue, post
} from "./utils";

describe("Session integration", () => {
    afterEach(() => {
        flushRedis();
    });

    const redisKeyPrefix = "WODIN Example:day1:sessions:";
    const sessionId = "1234";

    it("can post new session", async () => {
        const data = { test: "value" };
        const response = await post(`apps/day1/sessions/${sessionId}`, data);
        expect(response.status).toBe(200);
        await expectRedisJSONValue(`${redisKeyPrefix}:data`, "1234", data);
        const time = await getRedisValue(`${redisKeyPrefix}:data`, "1234");
        const date = Date.parse(time!);
        expect(Date.now() - date).toBeLessThan(1000); // expect saved time to be in last second
    });

    it("can update session", async () => {
        const oldData = { test: "oldValue" };
        const url = "apps/day1/sessions/1234";
        await post(url, oldData);
        const oldTime = await getRedisValue("WODIN Example:day1:sessions:time", "1234");

        const newData = { test: "newValue" };
        const response = await post(url, newData);
        expect(response.status).toBe(200);
        await expectRedisJSONValue("WODIN Example:day1:sessions:data", "1234", newData);

        const newTime = await getRedisValue("WODIN Example:day1:sessions:time", "1234");
        expect(Date.parse(newTime!)).toBeGreaterThan(Date.parse(oldTime!));
    });
});
