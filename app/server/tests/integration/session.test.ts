import {
    flushRedis, getRedisValue, setRedisValue, expectRedisJSONValue, post, get
} from "./utils";

describe("Session id integration", () => {
    afterEach(async () => {
        await flushRedis();
    });

    const redisKeyPrefix = "example:day1:sessions:";
    const sessionId = "1234";
    const postSessionUrl = (id: string = sessionId) => `apps/day1/sessions/${id}`;

    const expectRecentTime = (isoTime: string) => {
        const date = Date.parse(isoTime!);
        expect(Date.now() - date).toBeLessThan(1000); // expect saved time to be in last second
    };

    it("can post new session", async () => {
        const data = { test: "value" };
        const response = await post(postSessionUrl(), data);
        expect(response.status).toBe(200);
        await expectRedisJSONValue(`${redisKeyPrefix}data`, sessionId, data);
        const time = await getRedisValue(`${redisKeyPrefix}time`, sessionId);
        expectRecentTime(time);
    });

    it("can update session", async () => {
        const oldData = { test: "oldValue" };
        await post(postSessionUrl(), oldData);
        const oldTime = await getRedisValue(`${redisKeyPrefix}time`, sessionId);

        const newData = { test: "newValue" };
        const response = await post(postSessionUrl(), newData);
        expect(response.status).toBe(200);
        await expectRedisJSONValue(`${redisKeyPrefix}data`, sessionId, newData);

        const newTime = await getRedisValue(`${redisKeyPrefix}time`, sessionId);
        expect(Date.parse(newTime!)).toBeGreaterThan(Date.parse(oldTime!));
    });

    it("can fetch session", async () => {
        const data = { test: "value" };
        const url = postSessionUrl();
        const response1 = await post(url, data);
        expect(response1.status).toBe(200);

        const response2 = await get(url);
        expect(response2.status).toBe(200);
        expect(response2.headers["content-type"]).toMatch("application/json");
        expect(response2.data.data).toStrictEqual(data);
    });

    it("can get null value fetching nonexistant session", async () => {
        const response = await get(postSessionUrl());
        expect(response.status).toBe(404);
        expect(response.headers["content-type"]).toMatch("application/json");
        expect(response.data.data).toBe(null);
        expect(response.data.errors).toStrictEqual([{ error: "NOT_FOUND", detail: "Session not found" }]);
    });

    it("can get session metadata", async () => {
        // post sessions
        const data = { test: "value" };
        await post(postSessionUrl(), data);
        const anotherSessionId = "5678";
        await post(postSessionUrl(anotherSessionId), data);

        // set label for one of the sessions
        await setRedisValue(`${redisKeyPrefix}label`, sessionId, "label1");

        // get sessions
        const getMetadataUrl = `apps/day1/sessions/metadata?sessionIds=${sessionId},${anotherSessionId}`;
        const response = await get(getMetadataUrl);
        const sessions = response.data.data;
        expect(Array.isArray(sessions)).toBe(true);
        expect(sessions.length).toBe(2);

        expect(sessions[0].id).toBe(anotherSessionId);
        expectRecentTime(sessions[0].time);
        expect(sessions[0].label).toBe(null);

        expect(sessions[1].id).toBe(sessionId);
        expectRecentTime(sessions[1].time);
        expect(sessions[1].label).toBe("label1");
    });

    it("gets empty sessionMetadata if sessionIds parameter omitted", async () => {
        const getMetadataUrl = "apps/day1/sessions/metadata";
        const response = await get(getMetadataUrl);
        const sessions = response.data.data;
        expect(Array.isArray(sessions)).toBe(true);
        expect(sessions.length).toBe(0);
    });

    it("does not return metadata for non-existent sessions", async () => {
        let getMetadataUrl = "apps/day1/sessions/metadata?sessionIds=nonexistent1,nonexistent2";
        let response = await get(getMetadataUrl);
        let sessions = response.data.data;
        expect(Array.isArray(sessions)).toBe(true);
        expect(sessions.length).toBe(0);

        // check can also handle a mixture of existent and non-existent ids
        await post(postSessionUrl(sessionId), { test: "value" });
        getMetadataUrl = `apps/day1/sessions/metadata?sessionIds=nonexistent1,${sessionId}`;
        response = await get(getMetadataUrl);
        sessions = response.data.data;
        expect(Array.isArray(sessions)).toBe(true);
        expect(sessions.length).toBe(1);
        expect(sessions[0].id).toBe(sessionId);
        expectRecentTime(sessions[0].time);
        expect(sessions[0].label).toBe(null);
    });

    it("can create a friendly label for a session", async () => {
        const url = `apps/day1/sessions/${sessionId}/friendly`;

        // Gets created
        const response1 = await post(url, undefined);
        expect(response1.status).toBe(200);
        expect(response1.headers["content-type"]).toMatch("application/json");
        const friendly = response1.data.data;
        expect(friendly).toMatch(/^[a-z]+-[a-z]+$/);

        // Re-creating it does not change the friendly id
        const response2 = await post(url, undefined);
        expect(response2.status).toBe(200);
        expect(response2.data).toStrictEqual(response1.data);

        // Creating another friendly id is different
        const response3 = await post("apps/day1/sessions/12345/friendly", undefined);
        expect(response3.status).toBe(200);
        expect(response3.data.data).not.toEqual(friendly);
        expect(response3.data.data).toMatch(/^[a-z]+-[a-z]+$/);
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
