import { wodin } from "./integrationTest";

describe("odin endpoints", () => {
    it("get versions", async () => {
        const response = await wodin.get("/odin/versions");

        expect(response.status).toBe(200);

        expect(Object.keys(response.body.data))
            .toEqual(["odin", "odin.api", "dfoptim", "dopri", "odinjs"]);

        Object.values(response.body.data).forEach((value) => {
            expect(value).not.toBeNull();
        });
    });
});
