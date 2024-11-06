import { expect, Page, test } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { expectSummaryValues } from "./utils";

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
            "Plot is out of date: number of replicates has changed. Run model to update.",
            {
                timeout
            }
        );

        // Re-run model
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("");

        // number of series should have increased by 2
        const summary = ".wodin-plot-data-summary-series";
        expect(await page.locator(summary).count()).toBe(16);

        await expectSummaryValues(page, 1, "I_det", 1001, "#2e5cb8");
        await expectSummaryValues(page, 2, "I", 1001, "#6ab74d");
        await expectSummaryValues(page, 8, "I (mean)", 1001, "#6ab74d");
        await expectSummaryValues(page, 9, "S", 1001, "#ee9f33");
        await expectSummaryValues(page, 15, "S (mean)", 1001, "#ee9f33");
        await expectSummaryValues(page, 16, "extinct", 1001, "#cc0044");
    });

    test("traces are hidden if replicates are above maxReplicatesDisplay", async ({ page }) => {
        await page.fill(":nth-match(#run-options input, 2)", "50");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: number of replicates has changed. Run model to update.",
            {
                timeout
            }
        );

        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("");

        const summary = ".wodin-plot-data-summary-series";
        expect(await page.locator(summary).count()).toBe(104);

        await page.fill(":nth-match(#run-options input, 2)", "51");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: number of replicates has changed. Run model to update.",
            {
                timeout
            }
        );

        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("");

        expect(await page.locator(summary).count()).toBe(4);

        await expectSummaryValues(page, 1, "I_det", 1001, "#2e5cb8");
        await expectSummaryValues(page, 2, "I (mean)", 1001, "#6ab74d");
        await expectSummaryValues(page, 3, "S (mean)", 1001, "#ee9f33");
        await expectSummaryValues(page, 4, "extinct", 1001, "#cc0044");
    });

    test("can run stochastic sensitivity", async ({ page }) => {
        // Open Sensitivity tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)");

        await page.click("#run-sens-btn");

        // Should briefly see 'Running..' message
        await expect(await page.innerText("#sensitivity-running")).toContain("Running sensitivity");
        await expect(await page.locator("#run-sensitivity")).toBeHidden();

        // Can see summary traces
        const summary = ".wodin-plot-data-summary-series";
        await expect(await page.locator(summary)).toHaveCount(44, { timeout });

        await expectSummaryValues(page, 1, "I_det (beta=0.450)", 1001, "#2e5cb8");
        await expectSummaryValues(page, 2, "I (beta=0.450)", 1001, "#6ab74d");
        await expectSummaryValues(page, 3, "S (beta=0.450)", 1001, "#ee9f33");
        await expectSummaryValues(page, 4, "extinct (beta=0.450)", 1001, "#cc0044");
        await expectSummaryValues(page, 41, "I_det", 1001, "#2e5cb8");
        await expectSummaryValues(page, 42, "I", 1001, "#6ab74d");
        await expectSummaryValues(page, 43, "S", 1001, "#ee9f33");
        await expectSummaryValues(page, 44, "extinct", 1001, "#cc0044");
    });
});
