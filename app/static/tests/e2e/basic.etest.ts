import { expect, test, Page } from "@playwright/test";

test.describe("Basic app tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    const expectBothMode = async (page: Page) => {
        expect(await page.locator(".wodin-mode-both .wodin-left .wodin-content #app-type").textContent())
            .toBe("App Type: basic");
        expect(await page.locator(".wodin-mode-both .wodin-right .wodin-content .js-plotly-plot")).toBeVisible();
        expect(await page.locator(".wodin-collapse-controls #collapse-left")).toBeVisible();
        expect(await page.locator(".wodin-collapse-controls #collapse-right")).toBeVisible();
        expect(await page.locator(".wodin-left .view-left").isHidden()).toBe(true);
        expect(await page.locator(".wodin-right .view-right").isHidden()).toBe(true);
    };

    const expectRightMode = async (page: Page) => {
        expect(await page.locator(".wodin-mode-right .wodin-right .wodin-content .js-plotly-plot")).toBeVisible();
        expect(await page.locator(".wodin-mode-right .wodin-left .wodin-content").isHidden()).toBe(true);
        expect(await page.locator(".wodin-collapse-controls #collapse-left").isHidden()).toBe(true);
        expect(await page.locator(".wodin-collapse-controls #collapse-right")).toBeVisible();
        expect(await page.locator(".wodin-left .view-left")).toBeVisible();
        expect(await page.locator(".wodin-right .view-right").isHidden()).toBe(true);
    };

    const expectLeftMode = async (page: Page) => {
        expect(await page.locator(".wodin-mode-left .wodin-right .wodin-content").isHidden()).toBe(true);
        expect(await page.locator(".wodin-mode-left .wodin-left .wodin-content")).toBeVisible();
        expect(await page.locator(".wodin-collapse-controls #collapse-left")).toBeVisible();
        expect(await page.locator(".wodin-collapse-controls #collapse-right").isHidden()).toBe(true);
        expect(await page.locator(".wodin-left .view-left").isHidden()).toBe(true);
        expect(await page.locator(".wodin-right .view-right")).toBeVisible();
    };

    test("can collapse and expand left panel", async ({ page }) => {
        await expectBothMode(page);

        await page.click("#collapse-left");
        await expectRightMode(page);

        await page.click("#collapse-right");
        await expectBothMode(page);
    });

    test("can collapse and expand right panel", async ({ page }) => {
        await expectBothMode(page);

        await page.click("#collapse-right");
        await expectLeftMode(page);

        await page.click("#collapse-left");
        await expectBothMode(page);
    });

    test("'View Options' shows both panels", async ({ page }) => {
        await page.click("#collapse-left");

        expect(await page.innerText(".view-left")).toBe("View Options");
        await page.click(".view-left");
        await expectBothMode(page);
    });

    test("'View Charts' shows both panels", async ({ page }) => {
        await page.click("#collapse-right");

        expect(await page.innerText(".view-right")).toBe("View Charts");
        await page.click(".view-right");
        await expectBothMode(page);
    });

    test("renders plot", async ({ page }) => {
        const plotSelector = ".js-plotly-plot";

        // Test line is plotted for 1 trace
        const linesSelector = `${plotSelector} .scatterlayer .trace .lines path`;
        expect((await page.locator(linesSelector).getAttribute("d"))!.startsWith("M0")).toBe(true);

        // Test modebar menu is present
        expect(await page.isVisible(`${plotSelector} .modebar`)).toBe(true);
    });
});
