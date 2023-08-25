import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { expectSummaryValues } from "./utils";

test.describe("Sensitivity tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
        // Open Options tab
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        // Open Sensitivity tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
    });

    test("can edit Sensitivity options", async ({ page }) => {
        // Default settings are visible
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 1)")).toBe("Parameter: beta");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 2)")).toBe("Scale Type: Arithmetic");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 3)")).toBe("Variation Type: Percentage");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 4)")).toBe("Variation (%): 10");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 5)")).toBe("Number of runs: 10");
        await expect(await page.innerText("#sensitivity-options .alert-success"))
            .toBe(" 3.600, 3.689, 3.778, ..., 4.400");

        // Edit settings
        await expect(await page.isVisible(".modal")).toBe(false);
        await page.click("#sensitivity-options .btn-primary");
        await expect(await page.locator("#edit-param .modal")).toBeVisible();
        await expect(await page.innerText("#edit-param .modal-title")).toBe("Vary Parameter");
        await expect(await page.locator("#invalid-msg").count()).toBe(0);
        await expect(await page.innerText("#edit-param .modal .alert-success"))
            .toBe(" 3.600, 3.689, 3.778, ..., 4.400");

        const paramSelect = await page.locator("#edit-param-to-vary select");
        await paramSelect.selectOption("sigma");
        const scaleSelect = await page.locator("#edit-scale-type select");
        await scaleSelect.selectOption("Logarithmic");
        const varSelect = await page.locator("#edit-variation-type select");
        await varSelect.selectOption("Range");
        await expect(await page.innerText("#invalid-msg"))
            .toBe("Invalid settings: Expected upper bound to be no less than 2");
        await expect(await page.innerText(":nth-match(.modal #param-central div, 1)")).toBe("Central value");
        await expect(await page.innerText(":nth-match(.modal #param-central div, 2)")).toBe("2");

        await page.fill("#edit-from input", "1");
        await page.fill("#edit-to input", "5");
        await expect(await page.locator("#invalid-msg").count()).toBe(0);
        await page.fill("#edit-runs input", "12");
        await expect(await page.innerText(".modal .alert-success")).toBe(" 1.000, 1.158, 1.340, ..., 5.000");

        await page.click("#ok-settings");
        await expect(await page.isVisible(".modal")).toBe(false);

        // New settings are visible
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 1)")).toBe("Parameter: sigma");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 2)")).toBe("Scale Type: Logarithmic");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 3)")).toBe("Variation Type: Range");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 4)")).toBe("From: 1");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 5)")).toBe("To: 5");
        await expect(await page.innerText(":nth-match(#sensitivity-options li, 6)")).toBe("Number of runs: 12");
        await expect(await page.innerText("#sensitivity-options .alert-success"))
            .toBe(" 1.000, 1.158, 1.340, ..., 5.000");
    });

    test("can edit sensitivity plot settings", async ({ page }) => {
        // Default settings are visible
        await expect(await page.innerText("#sensitivity-plot-type label")).toBe("Type of plot");
        await expect(await page.inputValue("#sensitivity-plot-type select")).toBe("TraceOverTime");

        // Can change to extreme plot type
        await page.locator("#sensitivity-plot-type select").selectOption("ValueAtExtreme");
        await expect(await page.innerText("#sensitivity-plot-extreme label")).toBe("Min/Max");
        await expect(await page.inputValue("#sensitivity-plot-extreme select")).toBe("Max");

        // Can change to value at time plot type
        await page.locator("#sensitivity-plot-type select").selectOption("ValueAtTime");
        await expect(await page.innerText("#sensitivity-plot-time label")).toBe("Time to use");
        await expect(await page.inputValue("#sensitivity-plot-time input")).toBe("100");
        await page.fill("#sensitivity-plot-time input", "50");

        // Changes are persisted between tabs
        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        await expect(page.locator(".code-tab")).toBeVisible();
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await expect(await page.inputValue("#sensitivity-plot-type select")).toBe("ValueAtTime");
        await expect(await page.inputValue("#sensitivity-plot-time input")).toBe("50");
    });

    const plotSelector = ".wodin-right .wodin-content div.mt-4 .js-plotly-plot";
    const expectLegend = async (page: Page) => {
        const legendTextSelector = `${plotSelector} .legendtext`;
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("S");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("I");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("R");
    };

    test("can run sensitivity", async ({ page }) => {
        // see pre-run placeholder
        await expect(await page.innerText(".sensitivity-tab .plot-placeholder")).toBe("Sensitivity has not been run.");

        // run and see all traces
        page.click("#run-sens-btn");
        const linesSelector = `${plotSelector} .scatterlayer .trace .lines path`;
        expect((await page.locator(`:nth-match(${linesSelector}, 30)`).getAttribute("d"))!.startsWith("M0")).toBe(true);

        // expected legend and axes
        await expectLegend(page);
        await expect(await page.locator(".plotly .xaxislayer-above .xtick").count()).toBe(6);
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 1)")).toBe("0");
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 6)")).toBe("100");
        await expect(await page.locator(".plotly .yaxislayer-above .ytick").count()).toBe(6);
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 1)")).toBe("0");
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 6)")).toBe("1M");

        // change parameter - should see update required message
        await page.fill("#model-params .parameter-input", "5");
        await expect(await page.innerText(".action-required-msg"))
            .toBe("Plot is out of date: parameters have been changed. Run sensitivity to update.");

        // re-run - message should be removed
        await page.click("#run-sens-btn");
        await new Promise((r) => setTimeout(r, 101));
        await expect(await page.innerText(".action-required-msg")).toBe("");

        // switch to Value at Time - expect axes to change
        await page.locator("#sensitivity-plot-type select").selectOption("ValueAtTime");
        await expect(await page.locator(".plotly .xaxislayer-above .xtick").count()).toBe(5);
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 1)")).toBe("4.6");
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 5)")).toBe("5.4");
        await expect(await page.locator(".plotly .yaxislayer-above .ytick").count()).toBe(5);
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 1)")).toBe("0");
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 5)")).toBe("800k");
        await expectLegend(page);

        // switch to Value at its Min/Max
        await page.locator("#sensitivity-plot-type select").selectOption("ValueAtExtreme");
        await expect(await page.locator(".plotly .xaxislayer-above .xtick").count()).toBe(5);
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 1)")).toBe("4.6");
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 5)")).toBe("5.4");
        await expect(await page.locator(".plotly .yaxislayer-above .ytick").count()).toBe(9);
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 1)")).toBe("0.2M");
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 9)")).toBe("1M");

        // Change Min/Max to Min
        await page.locator("#sensitivity-plot-extreme select").selectOption("Min");
        await expect(await page.locator(".plotly .xaxislayer-above .xtick").count()).toBe(5);
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 1)")).toBe("4.6");
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 5)")).toBe("5.4");
        await expect(await page.locator(".plotly .yaxislayer-above .ytick").count()).toBe(8);
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 1)")).toBe("0");
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 8)")).toBe("140k");

        // switch to Time at value's Min/Max
        await page.locator("#sensitivity-plot-type select").selectOption("TimeAtExtreme");
        await expect(await page.locator(".plotly .xaxislayer-above .xtick").count()).toBe(5);
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 1)")).toBe("4.6");
        await expect(await page.innerHTML(":nth-match(.plotly .xaxislayer-above .xtick text, 5)")).toBe("5.4");
        await expect(await page.locator(".plotly .yaxislayer-above .ytick").count()).toBe(8);
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 1)")).toBe("0");
        await expect(await page.innerHTML(":nth-match(.plotly .yaxislayer-above .ytick text, 8)")).toBe("35");
    });

    test("can create parameter set and see sensitivity traces", async ({ page }) => {
        await page.click("#create-param-set");
        await page.fill(":nth-match(#model-params input, 1)", "5"); // update a parameter value
        await page.click("#run-sens-btn");
        // Expect 3 (number of vars) * (10 (sensitivity runs) + 1 (central)) * 2 (current params + param set)
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(66, { timeout });
        // current parameters
        await expectSummaryValues(page, 1, "S (beta=4.500)", 1000, "#2e5cb8");
        await expectSummaryValues(page, 2, "I (beta=4.500)", 1000, "#cccc00");
        await expectSummaryValues(page, 3, "R (beta=4.500)", 1000, "#cc0044");
        await expectSummaryValues(page, 31, "S", 1000, "#2e5cb8");
        await expectSummaryValues(page, 32, "I", 1000, "#cccc00");
        await expectSummaryValues(page, 33, "R", 1000, "#cc0044");
        // parameter set
        await expectSummaryValues(page, 34, "S (beta=4.500 Set 1)", 1000, "#2e5cb8", "dot");
        await expectSummaryValues(page, 35, "I (beta=4.500 Set 1)", 1000, "#cccc00", "dot");
        await expectSummaryValues(page, 36, "R (beta=4.500 Set 1)", 1000, "#cc0044", "dot");
        await expectSummaryValues(page, 64, "S (Set 1)", 1000, "#2e5cb8", "dot");
        await expectSummaryValues(page, 65, "I (Set 1)", 1000, "#cccc00", "dot");
        await expectSummaryValues(page, 66, "R (Set 1)", 1000, "#cc0044", "dot");

        // Switch to summary view
        await page.locator("#sensitivity-plot-type select").selectOption("ValueAtTime");
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(6, { timeout });
        await expectSummaryValues(page, 1, "S", 10, "#2e5cb8", null, "4.5", "5.5");
        await expectSummaryValues(page, 2, "I", 10, "#cccc00", null, "4.5", "5.5");
        await expectSummaryValues(page, 3, "R", 10, "#cc0044", null, "4.5", "5.5");
        await expectSummaryValues(page, 4, "S (Set 1)", 10, "#2e5cb8", "dot", "3.6", "4.4");
        await expectSummaryValues(page, 5, "I (Set 1)", 10, "#cccc00", "dot", "3.6", "4.4");
        await expectSummaryValues(page, 6, "R (Set 1)", 10, "#cc0044", "dot", "3.6", "4.4");
    });

    test("can swap sensitivity run traces", async ({ page }) => {
        await page.fill(":nth-match(#model-params input, 1)", "6");
        await page.fill(":nth-match(#model-params input, 2)", "1000000");
        await page.fill(":nth-match(#model-params input, 3)", "1000000");
        await page.fill(":nth-match(#model-params input, 4)", "0");
        await page.click("#run-sens-btn");
        await page.click("#create-param-set");
        await page.fill(":nth-match(#model-params input, 1)", "5");
        await page.fill(":nth-match(#model-params input, 2)", "0");
        await page.fill(":nth-match(#model-params input, 3)", "1000000");
        await page.fill(":nth-match(#model-params input, 4)", "1.5");
        await page.click("#run-sens-btn");
        await new Promise((r) => setTimeout(r, 101));
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(66, { timeout });

        // current parameters
        await expectSummaryValues(page, 31, "S", 1000, "#2e5cb8", null, "0", "100", "1000000", "1000000");
        await expectSummaryValues(page, 32, "I", 1000, "#cccc00", null, "0", "100", "0", "0");
        await expectSummaryValues(page, 33, "R", 1000, "#cc0044", null, "0", "100", "0", "0");
        // parameter set
        await expectSummaryValues(page, 64, "S (Set 1)", 1000, "#2e5cb8", "dot", "0", "100", "0", "0");
        await expectSummaryValues(page, 65, "I (Set 1)", 1000, "#cccc00", "dot", "0", "100", "1000000", "1000000");
        await expectSummaryValues(page, 66, "R (Set 1)", 1000, "#cc0044", "dot", "0", "100", "0", "0");

        await page.click(`:nth-match(.swap-param-set, ${1})`);
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(66, { timeout });

        // current parameters
        await expectSummaryValues(page, 31, "S", 1000, "#2e5cb8", null, "0", "100", "0", "0");
        await expectSummaryValues(page, 32, "I", 1000, "#cccc00", null, "0", "100", "1000000", "1000000");
        await expectSummaryValues(page, 33, "R", 1000, "#cc0044", null, "0", "100", "0", "0");
        // parameter set
        await expectSummaryValues(page, 64, "S (Set 1)", 1000, "#2e5cb8", "dot", "0", "100", "1000000", "1000000");
        await expectSummaryValues(page, 65, "I (Set 1)", 1000, "#cccc00", "dot", "0", "100", "0", "0");
        await expectSummaryValues(page, 66, "R (Set 1)", 1000, "#cc0044", "dot", "0", "100", "0", "0");
    });

    test("can change sensitivity settings to User variation, and see values in Sensitivity plot", async ({ page }) => {
        await page.click("#sensitivity-options .btn-primary");
        await expect(await page.locator("#edit-param .modal")).toBeVisible();
        const varSelect = await page.locator("#edit-variation-type select");
        await varSelect.selectOption("User");
        await expect(await page.innerText("#invalid-msg"))
            .toBe("Invalid settings: Must include at least 2 traces in the batch");

        const tagInput = await page.locator("#edit-values input");
        await tagInput.press("1");
        await tagInput.press(",");
        await tagInput.press("2");
        await tagInput.press(",");
        await tagInput.press("3");
        await tagInput.press(",");

        await page.waitForTimeout(100)
        await expect(await page.locator("#invalid-msg").count()).toBe(0);
        await expect(await page.locator(".modal .alert-success").count()).toBe(0);

        await page.click("#ok-settings");

        // run and see traces summary
        await page.click("#run-sens-btn");
        await expectSummaryValues(page, 1, "S (beta=1.000)", 1000, "#2e5cb8");
        await expectSummaryValues(page, 2, "I (beta=1.000)", 1000, "#cccc00");
        await expectSummaryValues(page, 3, "R (beta=1.000)", 1000, "#cc0044");
        await expectSummaryValues(page, 4, "S (beta=2.000)", 1000, "#2e5cb8");
        await expectSummaryValues(page, 5, "I (beta=2.000)", 1000, "#cccc00");
        await expectSummaryValues(page, 6, "R (beta=2.000)", 1000, "#cc0044");
        await expectSummaryValues(page, 7, "S (beta=3.000)", 1000, "#2e5cb8");
        await expectSummaryValues(page, 8, "I (beta=3.000)", 1000, "#cccc00");
        await expectSummaryValues(page, 9, "R (beta=3.000)", 1000, "#cc0044");

    });
});
