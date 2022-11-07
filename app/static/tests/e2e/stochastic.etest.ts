import { expect, test } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";

test.describe("stochastic app", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day3");
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)"); // Options
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)"); // Run
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

        // number of series should have increased by 2
        const summary = ".wodin-plot-data-summary-series";
        expect(await page.locator(summary).count()).toBe(16);
        const expectSummaryValues = async (idx: number, name: string, color: string) => {
            const locator = `:nth-match(${summary}, ${idx})`;
            expect(await page.getAttribute(locator, "name")).toBe(name);
            expect(await page.getAttribute(locator, "count")).toBe("1001");
            expect(await page.getAttribute(locator, "x-min")).toBe("0");
            expect(await page.getAttribute(locator, "x-max")).toBe("100");
            expect(await page.getAttribute(locator, "mode")).toBe("lines");
            expect(await page.getAttribute(locator, "line-color")).toBe(color);
        };

        await expectSummaryValues(1, "I_det", "#2e5cb8");
        await expectSummaryValues(2, "I", "#6ab74d");
        await expectSummaryValues(8, "I (mean)", "#6ab74d");
        await expectSummaryValues(9, "S", "#ee9f33");
        await expectSummaryValues(15, "S (mean)", "#ee9f33");
        await expectSummaryValues(16, "extinct", "#cc0044");
    });
});
