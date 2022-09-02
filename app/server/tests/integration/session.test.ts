import {
    flushRedis, getRedisValue, setRedisValue, expectRedisJSONValue, post, get
} from "./utils";

describe("Session integration", () => {
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

        expect(sessions[0].id).toBe(sessionId);
        expectRecentTime(sessions[0].time);
        expect(sessions[0].label).toBe("label1");

        expect(sessions[1].id).toBe(anotherSessionId);
        expectRecentTime(sessions[1].time);
        expect(sessions[1].label).toBe(null);
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
});
