import { wodin } from "./integrationTest";

describe("odin endpoints", () => {
    it("get versions", async () => {
        const response = await wodin.get("/odin/versions");

        expect(response.status).toBe(200);

        Object.entries(response.body.data).forEach((key, value) => {
            expect(value).not.toBeNull();
            expect(key).not.toBeNull();
        });
    });
});
