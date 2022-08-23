import {flushRedis, expectRedisValue, post} from "./utils";

describe("Session integration", () => {
    afterEach(() => {
        flushRedis();
    });

    it("can post new session", async () => {
        const data = {test: "value"};
        const response = await post(`apps/day1/sessions/1234`, data);
        expect(response.status).toBe(200);
        await expectRedisValue("WODIN Example:day1:sessions:data", "1234", data);
        // TODO: test time
    });

    it("can update session", async () => {
        const oldData = {test: "oldValue"};
        const url = `apps/day1/sessions/1234`;
        await post(url, oldData);

        const newData = {test: "newValue"};
        const response = await post(url, newData);
        expect(response.status).toBe(200);
        await expectRedisValue("WODIN Example:day1:sessions:data", "1234", newData);
    });
});
