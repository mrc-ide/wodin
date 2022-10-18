import { wodin } from "./integrationTest";

describe("odin endpoints", () => {
    it("get versions", async () => {
        const response = await wodin.get("/odin/versions");

        expect(response.status).toBe(200);

        expect(response.body.data).toEqual({
            dfoptim: "0.0.5",
            dopri: "0.0.12",
            odin: "1.3.14",
            "odin.api": "0.1.6",
            odinjs: "0.0.14"
        });
    });
});
