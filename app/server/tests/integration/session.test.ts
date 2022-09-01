import {
    flushRedis, getRedisValue, expectRedisJSONValue, get, post
} from "./utils";

describe("Session id integration", () => {
    afterEach(async () => {
        await flushRedis();
    });

    const redisKeyPrefix = "example:day1:sessions:";
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

    it("can fetch session", async () => {
        const data = { test: "value" };
        const response1 = await post(url, data);
        expect(response1.status).toBe(200);

        const response2 = await get(url);
        expect(response2.status).toBe(200);
        expect(response2.headers["content-type"]).toMatch("application/json");
        expect(response2.data).toStrictEqual(data);
    });

    it("can get null value fetching nonexistant session", async () => {
        const data = { test: "value" };
        const response = await get(url);
        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch("application/json");
        expect(response.data).toBe(null);
    });
});

describe("Session label integration", () => {
    afterEach(async () => {
        await flushRedis();
    });

    const redisKeyPrefix = "example:day1:sessions:";
    const sessionId = "1234";
    const url = `apps/day1/sessions/${sessionId}/label`;

    it("can post and update new label", async () => {
        const response1 = await post(url, "some label", "text/plain");
        expect(response1.status).toBe(200);
        const label1 = await getRedisValue(`${redisKeyPrefix}label`, sessionId);
        expect(label1).toBe("some label");

        const response2 = await post(url, "some other label", "text/plain");
        expect(response2.status).toBe(200);
        const label2 = await getRedisValue(`${redisKeyPrefix}label`, sessionId);
        expect(label2).toBe("some other label");
    });
});
