import { expect, test, Page } from "@playwright/test";
import { expectGraphVariables, addGraphWithVariable, expectXAxisTimeLabelFinalGraph } from "./utils";

const expectFirstAndLastXTick = async (
    page: Page, expectedGraphCount: number, expectedFirstAndLastTick: [number, number]
) => {
    const graphs = await page.locator(".wodin-plot-container");
    expect(await graphs.count()).toBe(expectedGraphCount);
    for (let i = 0; i < expectedGraphCount; i++) {
        const graph = graphs.nth(i);
        const xAxis = graph.locator(`g[id^="x-axes"]`);
        const ticks = xAxis.locator(".tick");
        expect(await ticks.first().textContent()).toBe(expectedFirstAndLastTick[0].toString());
        expect(await ticks.last().textContent()).toBe(expectedFirstAndLastTick[1].toString());
    }
};

test.describe("Run Tab", () => {
    test("x axis zoom on plot is replicated in other plots", async ({ page }) => {
        await page.goto("/apps/day1");

        // 1. Add 2 additional graphs, and drag one variable to each of them
        await addGraphWithVariable(page, 1);
        await addGraphWithVariable(page, 1);
        await expectGraphVariables(page, 0, ["R"]);
        await expectGraphVariables(page, 1, ["S"]);
        await expectGraphVariables(page, 2, ["I"]);
        // Sanity check that each graph has expected initial x axis ticks for full 0-100 time range
        await expectFirstAndLastXTick(page, 3, [0, 100]);

        // 2. Drag to zoom to an area on the first graph
        const graphBounds = (await page.locator(`:nth-match(.plot g[id^="brush"], 1)`).boundingBox())!;
        await page.mouse.move(graphBounds.x + 100, graphBounds.y + 50);
        await page.mouse.down();
        await page.mouse.move(graphBounds.x + 300, graphBounds.y + 100);
        await page.mouse.up();

        // 3. Check - using x axis ticks - that the expected x axis values are shown on all three graphs.
        await expectFirstAndLastXTick(page, 3, [14, 38]);
    });

    test("x axis Time label is shown for final plot only, in Basic app", async ({ page }) => {
        await page.goto("/apps/day1");
        await expectXAxisTimeLabelFinalGraph(page);
    });

    test("x axis Time label is shown for final plot only, in Stochastic app", async ({ page }) => {
        await page.goto("/apps/day3");
        await page.click(":nth-match(#right-tabs .nav-link, 2)");
        await expectXAxisTimeLabelFinalGraph(page);
    });
});
