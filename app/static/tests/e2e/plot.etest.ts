import { expect, test } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";

test.beforeEach(async ({ page }) => {
    await page.goto("/apps/day1");
});

test.describe("Plot tests", () => {
    const { timeout } = PlaywrightConfig;

    test("can download plot image", async ({ page }) => {
        await page.click("a[data-title='Download plot as a png']");
        const container = page.locator(".run-tab .wodin-plot-container");
        await container.getByRole("textbox", { name: "Title" }).fill("new title");
        await container.getByRole("textbox", { name: "X axis label" }).fill("new x");
        await container.getByRole("textbox", { name: "Y axis label" }).fill("new y");

        const [download] = await Promise.all([
            // Start waiting for the download
            page.waitForEvent("download"),
            // Perform the action that initiates download
            container.getByRole("button", { name: "Download" }).click()
        ]);
        // Wait for the download process to complete
        await download.path();

        expect(download.suggestedFilename()).toBe("WODIN plot.png");
        await expect(container.getByRole("button", { name: "Download" })).not.toBeVisible({ timeout });
    });
});
