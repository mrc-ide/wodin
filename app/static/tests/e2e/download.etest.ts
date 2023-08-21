import { expect, test, Page } from "@playwright/test";

test.describe("Download tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day2");
    });

    test("can download from Run tab", async ({ page }) => {
        await page.click("#download-btn");
        await expect(await page.inputValue("#download-file-name input")).toContain("day2-run");
        await page.fill("#download-file-name input", "test-download");

        const [download] = await Promise.all([
            // Start waiting for the download
            page.waitForEvent("download"),
            // Perform the action that initiates download
            page.click("#ok-download")
        ]);
        // Wait for the download process to complete
        await download.path();

        expect(download.suggestedFilename()).toBe("test-download.xlsx");
    });

    test("can download Sensitivity Summary", async ({ page }) => {
        // go to Sensitivity tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)");
        await page.click("#run-sens-btn");
        await page.click("#download-summary-btn");
        await expect(await page.inputValue("#download-file-name input")).toContain("day2-sensitivity-summary");
        await page.fill("#download-file-name input", "test-download");

        const [download] = await Promise.all([
            // Start waiting for the download
            page.waitForEvent("download"),
            // Perform the action that initiates download
            page.click("#ok-download")
        ]);
        // Wait for the download process to complete
        await download.path();

        expect(download.suggestedFilename()).toBe("test-download.xlsx");
    });
});
