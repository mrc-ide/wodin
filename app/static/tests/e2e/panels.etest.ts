import { expect, test, Page } from "@playwright/test";

test.describe("Wodin App panels tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    const expectBothMode = async (page: Page) => {
        await expect(await page.innerText(".wodin-mode-both .wodin-left .wodin-content .nav-tabs .active"))
            .toBe("Code");
        await expect(await page.locator(".wodin-mode-both .wodin-right .wodin-content .js-plotly-plot")).toBeVisible();
        await expect(await page.locator(".wodin-collapse-controls #collapse-left")).toBeVisible();
        await expect(await page.locator(".wodin-collapse-controls #collapse-right")).toBeVisible();
        await expect(await page.locator(".wodin-left .view-left").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-right .view-right").isHidden()).toBe(true);
    };

    const expectRightMode = async (page: Page) => {
        await expect(await page.locator(".wodin-mode-right .wodin-right .wodin-content .js-plotly-plot")).toBeVisible();
        await expect(await page.locator(".wodin-mode-right .wodin-left .wodin-content").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-collapse-controls #collapse-left").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-collapse-controls #collapse-right")).toBeVisible();
        await expect(await page.locator(".wodin-left .view-left")).toBeVisible();
        await expect(await page.locator(".wodin-right .view-right").isHidden()).toBe(true);
    };

    const expectLeftMode = async (page: Page) => {
        await expect(await page.locator(".wodin-mode-left .wodin-right .wodin-content").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-mode-left .wodin-left .wodin-content")).toBeVisible();
        await expect(await page.locator(".wodin-collapse-controls #collapse-left")).toBeVisible();
        await expect(await page.locator(".wodin-collapse-controls #collapse-right").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-left .view-left").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-right .view-right")).toBeVisible();
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

        await expect(await page.innerText(".view-left")).toBe("View Options");
        await page.click(".view-left");
        await expectBothMode(page);
    });

    test("'View Charts' shows both panels", async ({ page }) => {
        await page.click("#collapse-right");

        await expect(await page.innerText(".view-right")).toBe("View Charts");
        await page.click(".view-right");
        await expectBothMode(page);
    });
});
