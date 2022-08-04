import { expect, test, Page } from "@playwright/test";

test.describe("Sensitivity tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
        // Open Options tab
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        // Open Sensitivity tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
    });

    test("can edit Sensitivity options", async ({ page }) => {
        // Parameters and Run Options are collapsed
        await expect(await page.isVisible("#model-params")).toBe(false);
        await expect(await page.isVisible("#run-options")).toBe(false);

        // Default settings are visible
        await expect(await page.innerText("#vary-parameter .card-header")).toBe("beta");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 1)")).toBe("Scale Type: Arithmetic");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 2)")).toBe("Variation Type: Percentage");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 3)")).toBe("Variation (%): 10");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 4)")).toBe("Number of runs: 10");

        // Edit settings
        await expect(await page.isVisible(".modal")).toBe(false);
        await page.click("#vary-parameter .btn-primary");
        await expect(await page.isVisible(".modal")).toBe(true);
        await expect(await page.innerText(".modal-title")).toBe("Vary Parameter");
        await expect(await page.locator("#invalid-msg").count()).toBe(0);
        const paramSelect = await page.locator("#edit-param-to-vary select");
        await paramSelect.selectOption("sigma");
        const scaleSelect = await page.locator("#edit-scale-type select");
        await scaleSelect.selectOption("Logarithmic");
        const varSelect = await page.locator("#edit-variation-type select");
        await varSelect.selectOption("Range");
        await expect(await page.innerText("#invalid-msg")).toBe("To must be greater than From.");

        await page.fill("#edit-from input", "1");
        await page.fill("#edit-to input", "5");
        await expect(await page.locator("#invalid-msg").count()).toBe(0);
        await page.fill("#edit-runs input", "12");

        await page.click("#ok-settings");
        await expect(await page.isVisible(".modal")).toBe(false);

        // New settings are visible
        await expect(await page.innerText("#vary-parameter .card-header")).toBe("sigma");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 1)")).toBe("Scale Type: Logarithmic");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 2)")).toBe("Variation Type: Range");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 3)")).toBe("From: 1");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 4)")).toBe("To: 5");
        await expect(await page.innerText(":nth-match(#vary-parameter li, 5)")).toBe("Number of runs: 12");
    });
});
