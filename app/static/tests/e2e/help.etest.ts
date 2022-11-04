import { expect, test } from "@playwright/test";

test.describe("Help tab", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day3");
    });

    test("can display app help", async ({ page }) => {
        await expect(await page.innerText("#right-tabs .nav-link.active")).toBe("Help");
        expect(await page.innerText("#right-tabs .markdown-panel  h2")).toBe("Example Help for WODIN app");
        const tabContent = await page.locator("#right-tabs .markdown-panel");
        expect(await tabContent.locator("img").getAttribute("src")).toBe("http://localhost:3000/help/example_img.png");
        expect(await tabContent.locator("mjx-container").count()).toBe(2);
    });
});
