import { expect, test, Page } from "@playwright/test";

test.describe("Download tests", () => {
    test("can download from Run tab", async ({ page }) => {
        await page.goto("/apps/day2");
        await page.click("#download-btn");
        await expect(await page.inputValue("#download-file-name input")).toContain("day2-run");
        await page.fill("#download-file-name input", "test-download.xlsx");

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
