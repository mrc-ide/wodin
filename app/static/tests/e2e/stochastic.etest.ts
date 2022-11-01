import { expect, test } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";

test.describe("stochastic app", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day3");
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
    });

    test("can display number of replicates", async ({ page }) => {
        await expect(await page.innerText(":nth-match(.collapse-title, 2)")).toContain("Run Options");
        await expect(await page.getAttribute(":nth-match(.collapse-title i, 2)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#run-options")).not.toBeHidden();

        await expect(await page.locator("#run-options label").count()).toBe(2);
        await expect(await page.innerText(":nth-match(#run-options label, 2)")).toBe("Number of replicates");
        await expect(await page.inputValue(":nth-match(#run-options input, 2)")).toBe("5");
    });

    test("can change number of replicates and re-run model", async ({ page }) => {
        await page.fill(":nth-match(#run-options input, 2)", "6");

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: number of replicates has changed. Run model to update.", {
                timeout
            }
        );

        // Re-run model
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("");

        await expect(await page.innerText("#stochastic-run-placeholder")).toBe("Stochastic series count: 16");
    });
});
