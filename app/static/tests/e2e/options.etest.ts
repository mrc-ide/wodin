import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { expectSummaryValues } from "./utils";

const newValidCode = `## Derivatives
deriv(y1) <- sigma * (y2 - y1)
deriv(y2) <- R * y1 - y2 - y1 * y3
deriv(y3) <- -b * y3 + y1 * y2

## Initial conditions
initial(y1) <- 10.0
initial(y2) <- 1.0
initial(y3) <- 1.0

## parameters
sigma <- user(10.0)
R     <- user(28.0)
b     <-  user(3.0)
`;

test.describe("Options Tab tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
    });

    test("can see default parameters", async ({ page }) => {
        await expect(await page.innerText(".collapse-title")).toContain("Model Parameters");
        await expect(await page.getAttribute(":nth-match(.collapse-title i, 1)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#model-params")).not.toBeHidden();

        await expect(await page.innerText(":nth-match(#model-params label, 1)")).toBe("beta");
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("4");
        await expect(await page.innerText(":nth-match(#model-params label, 2)")).toBe("I0");
        await expect(await page.inputValue(":nth-match(#model-params input, 2)")).toBe("1");
        await expect(await page.innerText(":nth-match(#model-params label, 3)")).toBe("N");
        await expect(await page.inputValue(":nth-match(#model-params input, 3)")).toBe("1,000,000");
        await expect(await page.innerText(":nth-match(#model-params label, 4)")).toBe("sigma");
        await expect(await page.inputValue(":nth-match(#model-params input, 4)")).toBe("2");

        await expect(await page.innerText(":nth-match(.collapse-title, 2)")).toContain("Run Options");
        await expect(await page.getAttribute(":nth-match(.collapse-title i, 2)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#run-options")).not.toBeHidden();

        await expect(await page.locator("#run-options label").count()).toBe(1);
        await expect(await page.innerText(":nth-match(#run-options label, 1)")).toBe("End time");
        await expect(await page.inputValue(":nth-match(#run-options input, 1)")).toBe("100");
    });

    test("can collapse and expand options panel", async ({ page }) => {
        // parameters collapse
        await page.click(":nth-match(.collapse-title, 1)");
        await expect(await page.getAttribute(":nth-match(.collapse-title i, 1)", "data-name")).toBe("chevron-down");
        await expect(await page.locator("#model-params")).toBeHidden();

        // parameters expand
        await page.click(":nth-match(.collapse-title, 1)");
        await expect(await page.getAttribute(":nth-match(.collapse-title i ,1)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#model-params")).not.toBeHidden();

        // run-options collapse
        await page.click(":nth-match(.collapse-title, 2)");
        await expect(await page.getAttribute(":nth-match(.collapse-title i, 2)", "data-name")).toBe("chevron-down");
        await expect(await page.locator("#run-options")).toBeHidden();

        // parameters expand
        await page.click(":nth-match(.collapse-title, 2)");
        await expect(await page.getAttribute(":nth-match(.collapse-title i, 2)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#run-options")).not.toBeHidden();
    });

    test("can update parameter value", async ({ page }) => {
        // Check that we can see the graph paths change when a parameter changes and model is re-run
        const graphPathSelector = ":nth-match(.plotly svg .scatterlayer .scatter g.lines path, 1)";
        const previousPath = await page.getAttribute(graphPathSelector, "d");
        expect(previousPath!.startsWith("M0")).toBe(true);

        await page.fill(":nth-match(#model-params input, 1)", "3");

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: parameters have been changed. Run model to update.", {
                timeout
            }
        );

        // Re-run model
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("");

        const newPath = await page.getAttribute(graphPathSelector, "d");
        expect(newPath!.startsWith("M0")).toBe(true);
        expect(newPath).not.toEqual(previousPath);
    });

    test("parameters update when compile with new code", async ({ page }) => {
        // Navigate to code tab
        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");

        // Provide new code
        await page.press(".monaco-editor textarea", "Control+A");
        await page.press(".monaco-editor textarea", "Delete");
        await page.fill(".monaco-editor textarea", "");
        await page.fill(".monaco-editor textarea", newValidCode);

        await expect(page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );

        // Compile code
        await page.click("#compile-btn");
        await expect(page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: model code has been recompiled. Run model to update.", {
                timeout
            }
        );

        // Navigate to options tab
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");

        await expect(await page.innerText(":nth-match(#model-params label, 1)")).toBe("b");
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("3");
        await expect(await page.innerText(":nth-match(#model-params label, 2)")).toBe("R");
        await expect(await page.inputValue(":nth-match(#model-params input, 2)")).toBe("28");
        await expect(await page.innerText(":nth-match(#model-params label, 3)")).toBe("sigma");
        await expect(await page.inputValue(":nth-match(#model-params input, 3)")).toBe("10");
    });

    test("can update end time", async ({ page }) => {
        // Expect run plot's x axis final tick to initially be 100
        const xAxisTickSelector = ".plotly svg .xaxislayer-above .xtick text";
        await expect(await page.locator(xAxisTickSelector).last().innerHTML()).toBe("100");

        await page.fill("#run-options input", "200");

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: end time has changed. Run model to update.", {
                timeout
            }
        );

        // Re-run model
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("");

        // Expect run plot's x axis final tick to now be 200
        await expect(await page.locator(xAxisTickSelector).last().innerHTML()).toBe("200");
    });

    test("cleared parameter input resets on model run", async ({ page }) => {
        await page.fill(":nth-match(#model-params input, 1)", "");
        await page.click("#run-btn");

        await expect(await page.locator(":nth-match(#model-params input, 1)")).toHaveValue(
            "4", {
                timeout
            }
        );
    });

    test("cannot enter chars in parameter input which are not numeric, comma or decimal point", async ({ page }) => {
        await page.fill(":nth-match(#model-params input, 1)", "12.3g");
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("12.3");
    });

    test("Entered parameter values are formatted when blur input", async ({ page }) => {
        await page.fill(":nth-match(#model-params input, 1)", "10000");
        await page.click(":nth-match(#model-params input, 2)");
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("10,000");

        await page.fill(":nth-match(#model-params input, 1)", "-10000");
        await page.click(":nth-match(#model-params input, 2)");
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("-10,000");
    });

    test("Non-numbers are reverted to previous value when blur input", async ({ page }) => {
        await page.fill(":nth-match(#model-params input, 1)", ",.");
        await page.click(":nth-match(#model-params input, 2)");
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("4");
    });

    test("can reset model parameters to default values", async ({ page }) => {
        await expect(await page.innerText(".collapse-title")).toContain("Model Parameters");

        // Default model parameter values
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("4");

        // Change default values
        await page.fill(":nth-match(#model-params input, 1)", "10000");

        // Verify changes have been made
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("10000");

        // Reset parameters to default value
        await page.click("#reset-params-btn");

        // Verify parameters have been reset to default value
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("4");
    });

    test("can change graph setting for log scale y axis", async ({ page }) => {
        await expect(await page.innerText(":nth-match(.collapse-title, 3)")).toContain("Graph Settings");
        await page.locator("#log-scale-y-axis input").click();
        // should update y axis tick
        const tickSelector = ":nth-match(.plotly .ytick text, 2)";
        await expect(await page.innerHTML(tickSelector)).toBe("10n");
        // change back to linear
        await page.locator("#log-scale-y-axis input").click();
        await expect(await page.innerHTML(tickSelector)).toBe("0.2M");
    });

    test.only("can change graph setting for lock axes", async ({ page }) => {
        await expect(await page.innerText(":nth-match(.collapse-title, 3)")).toContain("Graph Settings");
        await page.locator("#lock-axes input").click();

        const tickSelector = ":nth-match(.plotly .ytick text, 6)";
        await expect(await page.innerHTML(tickSelector)).toBe("1M");

        await page.locator(":nth-match(.parameter-input, 3)").fill("1000000000");

        await page.locator("#run-btn").click();

        // would be 1B if we didn't lock the axes
        await expect(await page.innerHTML(tickSelector)).toBe("1M");
        await page.locator("#lock-axes input").click();

        // autorange on deselect of lock axes
        await expect(await page.innerHTML(tickSelector)).toBe("1B");
    });

    const createParameterSet = async (page: Page) => {
        await page.click("#create-param-set");
    };

    const deleteParameterSet = async (index: number, page: Page) => {
        await page.click(`:nth-match(.delete-param-set, ${index})`);
    };

    const swapParameterSet = async (index: number, page: Page) => {
        await page.click(`:nth-match(.swap-param-set, ${index})`);
    };

    const editDisplayName = async (index: number, page: Page) => {
        await page.click(`:nth-match(.edit-display-name, ${index})`);
    };

    const saveDisplayName = async (index: number, page: Page) => {
        await page.click(`:nth-match(.save-display-name, ${index})`);
    };

    const inputDisplayName = async (index: number, page: Page, name: string) => {
        await page.fill(`:nth-match(.param-name-input, ${index})`, name);
    };

    const updateBetaParamAndRun = async (value: number, page: Page) => {
        await page.fill(":nth-match(.parameter-input, 1)", value.toString());
        await page.click("#run-btn");
    };

    test("can create a parameter set, and see run traces for that set", async ({ page }) => {
        await createParameterSet(page);
        await expect((await page.innerText(".parameter-set .card-header")).trim()).toBe("Set 1");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 1)")).toBe("beta: 4");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 2)")).toBe("I0: 1");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 3)")).toBe("N: 1000000");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 4)")).toBe("sigma: 2");

        await page.click("#run-btn");
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(6, { timeout });
        // current parameters
        await expectSummaryValues(page, 1, "S", 1000, "#2e5cb8");
        await expectSummaryValues(page, 2, "I", 1000, "#cccc00");
        await expectSummaryValues(page, 3, "R", 1000, "#cc0044");
        // parameter set
        await expectSummaryValues(page, 4, "S (Set 1)", 1000, "#2e5cb8", "dot");
        await expectSummaryValues(page, 5, "I (Set 1)", 1000, "#cccc00", "dot");
        await expectSummaryValues(page, 6, "R (Set 1)", 1000, "#cc0044", "dot");
    });

    test("can delete a parameter set", async ({ page }) => {
        await createParameterSet(page);
        await page.click("#run-btn");
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(6, { timeout });

        await deleteParameterSet(1, page);
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(3, { timeout });
        await expectSummaryValues(page, 1, "S", 1000, "#2e5cb8");
        await expectSummaryValues(page, 2, "I", 1000, "#cccc00");
        await expectSummaryValues(page, 3, "R", 1000, "#cc0044");
    });

    test("can swap a parameter set and its run traces", async ({ page }) => {
        await page.fill(":nth-match(#model-params input, 1)", "6");
        await page.fill(":nth-match(#model-params input, 2)", "1000000");
        await page.fill(":nth-match(#model-params input, 3)", "1000000");
        await page.fill(":nth-match(#model-params input, 4)", "0");
        await page.click("#run-btn");
        await createParameterSet(page);
        await page.fill(":nth-match(#model-params input, 1)", "5");
        await page.fill(":nth-match(#model-params input, 2)", "0");
        await page.fill(":nth-match(#model-params input, 3)", "1000000");
        await page.fill(":nth-match(#model-params input, 4)", "1.5");
        await page.click("#run-btn");
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(6, { timeout });

        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("5");
        await expect(await page.inputValue(":nth-match(#model-params input, 2)")).toBe("0");
        await expect(await page.inputValue(":nth-match(#model-params input, 3)")).toBe("1,000,000");
        await expect(await page.inputValue(":nth-match(#model-params input, 4)")).toBe("1.5");

        await expect((await page.innerText(".parameter-set .card-header")).trim()).toBe("Set 1");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 1)")).toBe("beta: 6");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 2)")).toBe("I0: 1000000");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 3)")).toBe("N: 1000000");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 4)")).toBe("sigma: 0");

        // current parameters
        await expectSummaryValues(page, 1, "S", 1000, "#2e5cb8", null, "0", "100", "1000000", "1000000");
        await expectSummaryValues(page, 2, "I", 1000, "#cccc00", null, "0", "100", "0", "0");
        await expectSummaryValues(page, 3, "R", 1000, "#cc0044", null, "0", "100", "0", "0");
        // parameter set
        await expectSummaryValues(page, 4, "S (Set 1)", 1000, "#2e5cb8", "dot", "0", "100", "0", "0");
        await expectSummaryValues(page, 5, "I (Set 1)", 1000, "#cccc00", "dot", "0", "100", "1000000", "1000000");
        await expectSummaryValues(page, 6, "R (Set 1)", 1000, "#cc0044", "dot", "0", "100", "0", "0");

        await swapParameterSet(1, page);
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(6, { timeout });

        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("6");
        await expect(await page.inputValue(":nth-match(#model-params input, 2)")).toBe("1,000,000");
        await expect(await page.inputValue(":nth-match(#model-params input, 3)")).toBe("1,000,000");
        await expect(await page.inputValue(":nth-match(#model-params input, 4)")).toBe("0");

        await expect((await page.innerText(".parameter-set .card-header")).trim()).toBe("Set 1");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 1)")).toBe("beta: 5");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 2)")).toBe("I0: 0");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 3)")).toBe("N: 1000000");
        await expect(await page.innerText(":nth-match(.parameter-set .card-body span.badge, 4)")).toBe("sigma: 1.5");

        // current parameters
        await expectSummaryValues(page, 1, "S", 1000, "#2e5cb8", null, "0", "100", "0", "0");
        await expectSummaryValues(page, 2, "I", 1000, "#cccc00", null, "0", "100", "1000000", "1000000");
        await expectSummaryValues(page, 3, "R", 1000, "#cc0044", null, "0", "100", "0", "0");
        // parameter set
        await expectSummaryValues(page, 4, "S (Set 1)", 1000, "#2e5cb8", "dot", "0", "100", "1000000", "1000000");
        await expectSummaryValues(page, 5, "I (Set 1)", 1000, "#cccc00", "dot", "0", "100", "0", "0");
        await expectSummaryValues(page, 6, "R (Set 1)", 1000, "#cc0044", "dot", "0", "100", "0", "0");
    });

    test("can hide and show a parameter set", async ({ page }) => {
        await createParameterSet(page);
        await page.click("#run-btn");
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(6, { timeout });

        await page.click(".hide-param-set");
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(3, { timeout });
        await expectSummaryValues(page, 1, "S", 1000, "#2e5cb8");
        await expectSummaryValues(page, 2, "I", 1000, "#cccc00");
        await expectSummaryValues(page, 3, "R", 1000, "#cc0044");

        await page.click(".show-param-set");
        await expect(await page.locator(".wodin-plot-data-summary-series")).toHaveCount(6, { timeout });
        await expectSummaryValues(page, 4, "S (Set 1)", 1000, "#2e5cb8", "dot");
        await expectSummaryValues(page, 5, "I (Set 1)", 1000, "#cccc00", "dot");
        await expectSummaryValues(page, 6, "R (Set 1)", 1000, "#cc0044", "dot");
    });

    test("can get unique parameter set name after delete", async ({ page }) => {
        // Create Set 1 and Set 2
        await createParameterSet(page);
        await updateBetaParamAndRun(1, page); // Need to do this to enable Save Current Parameters
        await createParameterSet(page);
        // Delete Set 2
        await deleteParameterSet(2, page);
        // Create Set 3
        await updateBetaParamAndRun(2, page);
        await createParameterSet(page);
        await expect(await page.locator(".parameter-set").count()).toBe(2);
        await expect((await page.innerText(":nth-match(.parameter-set .card-header, 1)")).trim()).toBe("Set 1");
        await expect((await page.innerText(":nth-match(.parameter-set .card-header, 2)")).trim()).toBe("Set 3");
    });

    test("can rename parameter set", async ({ page }) => {
        await createParameterSet(page);
        await expect((await page.innerText(":nth-match(.parameter-set .card-header, 1)")).trim()).toBe("Set 1");
        await editDisplayName(1, page);
        await inputDisplayName(1, page, "random name 1");
        await saveDisplayName(1, page);
        await expect((await page.innerText(":nth-match(.parameter-set .card-header, 1)")).trim()).toBe("random name 1");
    });

    test("error tooltip and doesn't change name if same name exists", async ({ page }) => {
        await createParameterSet(page);
        await editDisplayName(1, page);
        await inputDisplayName(1, page, "random name 1");
        await saveDisplayName(1, page);
        await expect((await page.innerText(":nth-match(.parameter-set .card-header, 1)")).trim()).toBe("random name 1");

        await updateBetaParamAndRun(1, page);

        await createParameterSet(page);
        await editDisplayName(2, page);
        await inputDisplayName(2, page, "random name 1");
        await saveDisplayName(1, page);
        await expect((await page.innerText(":nth-match(.tooltip-inner, 2)")).trim()).toBe("Name already exists");
        await expect(await page.isVisible(":nth-match(.param-name-input, 2)")).toBe(true);
    });

    test("error tooltip and doesn't change name if Set [number] format used", async ({ page }) => {
        await createParameterSet(page);
        await editDisplayName(1, page);
        await inputDisplayName(1, page, "Set 10");
        await saveDisplayName(1, page);
        await expect((await page.innerText(":nth-match(.tooltip-inner, 2)")).trim())
            .toBe("Set 10 (or any Set [number] combination) is reserved for default set names. "
            + "Please choose another set name or name this set back to its original name of 'Set 1'");
        await expect(await page.isVisible(".param-name-input")).toBe(true);
    });

    const fillInAdvancedInputs = async (type: string, advancedSetting: any, index: number) => {
        switch (type) {
        case "num": {
            const input = await advancedSetting.locator("input");
            await input.fill((index).toString());
            break;
        }
        case "stdf": {
            const input1 = await advancedSetting.locator(":nth-match(input, 1)");
            const input2 = await advancedSetting.locator(":nth-match(input, 2)");
            await input1.fill(`${(index)}`);
            await input2.fill(`${(-index)}`);
            break;
        }
        case "tag": {
            const tagInput = await advancedSetting.locator("input");
            await tagInput.fill((index).toString());
            await tagInput.press(",");
            break;
        }
        default: break;
        }
    };

    const advancedOptions = [
        { label: "Tolerance", type: "stdf" },
        { label: "Max steps", type: "num" },
        { label: "Max step size", type: "num" },
        { label: "Min step size", type: "stdf" },
        { label: "Critical times", type: "tag" }
    ] as const;

    const expectAdvancedSetting = async (page: Page, index: number) => {
        const advancedSettingPanel = await page.locator("#advanced-settings-panel");
        await expect(await page.innerText(`:nth-match(#advanced-settings-panel label, ${index + 1})`))
            .toBe(advancedOptions[index].label);
        const advancedSetting = await advancedSettingPanel.locator(`:nth-match(.row, ${index + 1})`);
        await fillInAdvancedInputs(advancedOptions[index].type, advancedSetting, index + 1);
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: advanced settings have been changed. Run model to update.", {
                timeout
            }
        );
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("");
    };

    test("can edit and run model with advanced settings", async ({ page }) => {
        await page.click(":nth-match(.collapse-title, 4)");

        await expectAdvancedSetting(page, 0);
        await expectAdvancedSetting(page, 1);
        await expectAdvancedSetting(page, 2);
        await expectAdvancedSetting(page, 3);
        await expectAdvancedSetting(page, 4);
    });
});
