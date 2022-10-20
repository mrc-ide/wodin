import { wodin } from "./integrationTest";

describe("odin endpoints", () => {
    it("get versions", async () => {
        const response = await wodin.get("/odin/versions");

        expect(response.status).toBe(200);

        Object.keys(response.body.data).forEach((key) => {
            expect(key).not.toBeNull();
        });

        Object.values(response.body.data).forEach((value) => {
            expect(value).not.toBeNull();
        });
    });
});
