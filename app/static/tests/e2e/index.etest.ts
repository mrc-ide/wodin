import {expect, test} from "@playwright/test";

test.describe("Index tests", () => {

    test("renders homepage", async ({page}) => {
        await page.goto("/");

        expect(await page.innerText("h1")).toBe("Example WODIN configuration");
    });
});
