import { wodin } from "./integrationTest";

describe("config endpoints", () => {
    it("gets app help", async () => {
        const response = await wodin.get("/config/day3");

        expect(response.status).toBe(200);

        const { data } = response.body;
        expect(data.help.tabName).toBe("Help");
        expect(data.help.markdown.length).toBeGreaterThan(0);
        expect(data.help.markdown[0]).toBe("## Example Help for WODIN app");
    });
});
