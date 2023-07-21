import {
    expect,
    test,
    Page,
    Locator
} from "@playwright/test";

test.describe("Wodin App panels tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    // playwright default screen size is 1280x720
    const windowWidth = 1280;
    const rightBoundary = windowWidth - windowWidth / 4;
    const leftBoundary = windowWidth / 8;

    const expectBothMode = async (page: Page) => {
        await expect(await page.innerText(".wodin-mode-both .wodin-left .wodin-content .nav-tabs .active"))
            .toBe("Code");
        await expect(await page.locator(".wodin-mode-both .wodin-right .wodin-content .js-plotly-plot")).toBeVisible();
        await expect(await page.locator(".wodin-collapse-controls #resize-panel-control")).toBeVisible();
        await expect(await page.locator(".wodin-left .view-left").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-right .view-right").isHidden()).toBe(true);
    };

    const expectRightMode = async (page: Page) => {
        await expect(await page.locator(".wodin-mode-right .wodin-right .wodin-content .js-plotly-plot")).toBeVisible();
        await expect(await page.locator(".wodin-mode-right .wodin-left .wodin-content").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-collapse-controls #resize-panel-control")).toBeVisible();
        await expect(await page.locator(".wodin-left .view-left")).toBeVisible();
        await expect(await page.locator(".wodin-right .view-right").isHidden()).toBe(true);
    };

    const expectLeftMode = async (page: Page) => {
        await expect(await page.locator(".wodin-mode-left .wodin-right .wodin-content").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-mode-left .wodin-left .wodin-content")).toBeVisible();
        await expect(await page.locator(".wodin-collapse-controls #resize-panel-control")).toBeVisible();
        await expect(await page.locator(".wodin-left .view-left").isHidden()).toBe(true);
        await expect(await page.locator(".wodin-right .view-right")).toBeVisible();
    };

    interface Point {
        x: number,
        y:number
    }

    const dragTo = async (page: Page, locatorToDrag: Locator, locatorDragTarget: Point) => {
        const toDragBox = await locatorToDrag.boundingBox();

        await page.mouse.move(
            toDragBox!.x + toDragBox!.width / 2,
            toDragBox!.y + toDragBox!.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(
            locatorDragTarget.x,
            locatorDragTarget.y
        );
        await page.mouse.up();
    };

    test("can collapse and expand left panel", async ({ page }) => {
        await expectBothMode(page);
        const panelResizer = page.locator("#resize-panel-control");

        await dragTo(page, panelResizer, { x: leftBoundary, y: 0 });
        await expectBothMode(page);

        // beyond collapse boundary so panel should collapse
        await dragTo(page, panelResizer, { x: leftBoundary - 1, y: 0 });
        await expectRightMode(page);

        await dragTo(page, panelResizer, { x: leftBoundary, y: 0 });
        await expectBothMode(page);
    });

    test("can collapse and expand right panel", async ({ page }) => {
        await expectBothMode(page);
        const panelResizer = page.locator("#resize-panel-control");

        await dragTo(page, panelResizer, { x: rightBoundary, y: 0 });
        await expectBothMode(page);

        // beyond collapse boundary so panel should collapse
        await dragTo(page, panelResizer, { x: rightBoundary + 1, y: 0 });
        await expectLeftMode(page);

        await dragTo(page, panelResizer, { x: rightBoundary, y: 0 });
        await expectBothMode(page);
    });

    test("'View Options' shows both panels", async ({ page }) => {
        const panelResizer = page.locator("#resize-panel-control");
        await dragTo(page, panelResizer, { x: leftBoundary - 1, y: 0 });
        await expectRightMode(page);

        await expect(await page.innerText(".view-left")).toBe("View Options");
        await page.click(".view-left");
        await expectBothMode(page);
    });

    test("'View Charts' shows both panels", async ({ page }) => {
        const panelResizer = page.locator("#resize-panel-control");
        await dragTo(page, panelResizer, { x: rightBoundary + 1, y: 0 });
        await expectLeftMode(page);

        await expect(await page.innerText(".view-right")).toBe("View Charts");
        await page.click(".view-right");
        await expectBothMode(page);
    });
});
