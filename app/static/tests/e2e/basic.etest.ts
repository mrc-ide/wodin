import { expect, test, Page } from "@playwright/test";

test.describe("Basic app tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    test("renders plot", async ({ page }) => {
        const plotSelector = ".js-plotly-plot";

        // Test lines are plotted for each of 3 traces
        const linesSelector = `${plotSelector} .scatterlayer .trace .lines path`;
        expect((await page.locator(`:nth-match(${linesSelector}, 1)`).getAttribute("d"))!!.startsWith("M0")).toBe(true);
        expect((await page.locator(`:nth-match(${linesSelector}, 2)`).getAttribute("d"))!!.startsWith("M0")).toBe(true);
        expect((await page.locator(`:nth-match(${linesSelector}, 3)`).getAttribute("d"))!!.startsWith("M0")).toBe(true);


        // Test traces appear on legend
        const legendTextSelector = `${plotSelector} .legendtext`;
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("y1");
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("y2");
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("y3");

        // Test modebar menu is present
        expect(await page.isVisible(`${plotSelector} .modebar`)).toBe(true);
    });
});
