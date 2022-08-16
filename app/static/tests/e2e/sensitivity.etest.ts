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
        await expect(await page.isVisible(".modal")).toBe(true);
        await expect(await page.innerText(".modal-title")).toBe("Vary Parameter");
        await expect(await page.locator("#invalid-msg").count()).toBe(0);
        await expect(await page.innerText(".modal .alert-success")).toBe(" 3.600, 3.689, 3.778, ..., 4.400");

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

    test("can run sensitivity", async ({ page }) => {
        // see pre-run placeholder
        await expect(await page.innerText(".sensitivity-tab .plot-placeholder")).toBe("Sensitivity has not been run.");

        // run and see all traces
        page.click("#run-sens-btn");
        const plotSelector = ".wodin-right .wodin-content div.mt-4 .js-plotly-plot";
        const linesSelector = `${plotSelector} .scatterlayer .trace .lines path`;
        expect((await page.locator(`:nth-match(${linesSelector}, 30)`).getAttribute("d"))!.startsWith("M0")).toBe(true);

        // expected legend
        const legendTextSelector = `${plotSelector} .legendtext`;
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("S");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("I");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("R");

        // change parameter - should see update required message
        await page.fill("#model-params .parameter-input", "5");
        await expect(await page.innerText(".action-required-msg"))
            .toBe("Model code has been recompiled or options have been updated. "
                + "Run Sensitivity to view updated graph.");

        // re-run - message should be removed
        await page.click("#run-sens-btn");
        await expect(await page.innerText(".action-required-msg")).toBe("");
    });
});
