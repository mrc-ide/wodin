import { expect, test, Page } from "@playwright/test";
import {
    newFitCode, uploadCSVData, writeCode, startModelFit, waitForModelFitCompletion, realisticFitData
} from "./utils";
import PlaywrightConfig from "../../playwright.config";

const multiTimeFitData = `Day,Cases,Day2
0,1,0
1,1,1
2,0,2
3,2,3
4,5,4
5,3,5
6,3,6
7,3,7
8,6,8
9,2,9
10,5,10
11,9,11
12,13,12
13,12,13
14,13,14
15,11,15
16,12,16
17,6,17
18,6,18
19,6,19
20,3,20
21,1,21
22,0,22
23,2,23
24,0,24
25,0,25
26,0,26
27,0,27
28,2,28
29,0,29
30,2,30
31,0,31`;

const multiCasesFitData = `Day,Cases,Cases2
0,1,1
1,1,2
2,0,1
3,2,1
4,5,3
5,3,4
6,3,4
7,3,5
8,6,6
9,2,3
10,5,4
11,9,9
12,13,13
13,12,11
14,13,12
15,11,10
16,12,11
17,6,8
18,6,7
19,6,7
20,3,5
21,1,4
22,0,3
23,2,0
24,0,2
25,0,1
26,0,0
27,0,1
28,2,1
29,0,0
30,2,0
31,0,0`;

const { timeout } = PlaywrightConfig;

const runFit = async (page: Page) => {
    await startModelFit(page);
    await waitForModelFitCompletion(page);
};

const expectUpdateFitMsg = async (page: Page, msg: string) => {
    await expect(await page.locator(".fit-tab .action-required-msg")).toHaveText(msg, { timeout });
};

const reRunFit = async (page: Page) => {
    await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Fit");
    await page.click(".wodin-right .wodin-content div.mt-4 button#fit-btn");

    await waitForModelFitCompletion(page);
    await expectUpdateFitMsg(page, "");
};

test.describe("Wodin App model fit tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day2");
    });

    test("renders Data tab", async ({ page }) => {
        await expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Data");
        await expect(await page.innerText(".wodin-left .wodin-content div.mt-4 h3")).toBe("Upload data");
    });

    test("can change to Code tab and back", async ({ page }) => {
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Code");
        await expect(await page.innerText(".wodin-left .wodin-content #compile-btn")).toBe("Compile");
    });

    test("can change to Options tab and back", async ({ page }) => {
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Options");
        await expect(await page.innerText(".wodin-left .wodin-content div.mt-4")).toContain("Model Parameters");
    });

    test("renders Run tab", async ({ page }) => {
        await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Run");
        await expect(await page.innerText(".wodin-right .wodin-content #run-btn")).toBe("Run model");
    });

    test("can change to Fit tab and back", async ({ page }) => {
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Fit");
        await expect(await page.innerText(".wodin-right .wodin-content div.mt-4 button"))
            .toBe("Fit model");
    });

    test("can change to Sensitivity tab and back", async ({ page }) => {
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)");
        await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Sensitivity");
        await expect(await page.innerText(".wodin-right .wodin-content div.mt-4 button")).toBe("Run sensitivity");
    });

    test("can run model fit", async ({ page }) => {
        await startModelFit(page);
        await waitForModelFitCompletion(page);

        await expect(await page.innerText(":nth-match(.wodin-plot-container span, 1)")).toContain("Iterations:");
        const sumOfSquares = await page.innerText(":nth-match(.wodin-plot-container span, 2)");
        expect(sumOfSquares).toContain("Sum of squares:");

        const plotSelector = ".wodin-right .wodin-content div.mt-4 .js-plotly-plot";

        // Test line is plotted for fit trace and data points
        const linesSelector = `${plotSelector} .scatterlayer .trace .lines path`;
        await expect((await page.locator(linesSelector).getAttribute("d"))!.startsWith("M")).toBe(true);
        const pointsSelector = `${plotSelector} .scatterlayer .trace .points path`;
        expect((await page.locator(`:nth-match(${pointsSelector}, 1)`).getAttribute("d"))!.startsWith("M")).toBe(true);

        // Test traces appear on legend
        const legendTextSelector = `${plotSelector} .legendtext`;
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("I");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("Cases");

        // Test modebar menu is present
        await expect(await page.isVisible(`${plotSelector} .modebar`)).toBe(true);

        // Test can run again with different params to vary, and get different result
        await page.click(":nth-match(input.vary-param-check, 2)");
        await page.click(".wodin-right .wodin-content div.mt-4 button");
        await waitForModelFitCompletion(page);
        const newSumOfSquares = await page.innerText(":nth-match(.wodin-plot-container span, 2)");
        expect(newSumOfSquares).not.toEqual(sumOfSquares);
    });

    test("can show model fit error", async ({ page }) => {
        // Upload data
        await uploadCSVData(page, realisticFitData);
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");

        // link variables
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const select1 = await linkContainer.locator(":nth-match(select, 1)");
        await select1.selectOption("E");

        await expect(await page.innerText("#optimisation label#target-fit-label")).toBe("Cases ~ E");

        // select param to vary
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
        await expect(await page.innerText("#select-param-msg"))
            .toBe("Please select at least one parameter to vary during model fit.");
        await page.click(":nth-match(input.vary-param-check, 1)");
        await page.click(":nth-match(input.vary-param-check, 2)");

        // change advanced setting to sabotage fit
        await page.click(":nth-match(.collapse-title, 6)"); // Open Advanced Settings
        const advancedSettingPanel = await page.locator("#advanced-settings-panel");
        const input1 = await advancedSettingPanel.locator(":nth-match(input, 1)");
        const input2 = await advancedSettingPanel.locator(":nth-match(input, 2)");
        await input1.fill("7");
        await input2.fill("-1");

        await page.click(".wodin-right .wodin-content div.mt-4 button#fit-btn");
        console.log("15");

        await expect(await page.locator(".fit-tab .action-required-msg"))
            .toHaveText("An error occurred during model fit.", { timeout });
        await expect(await page.innerText(".fit-tab #error-info")).toContain("Model fit error: Integration failure");
    });

    test("can see expected update required messages when code changes", async ({ page }) => {
        await runFit(page);
        await expectUpdateFitMsg(page, "");

        // Update code
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await writeCode(page, newFitCode);
        await expectUpdateFitMsg(page, "Model code has been updated. Compile code and Fit Model for updated best fit.");

        // Compile code
        await page.click("#compile-btn");
        await expectUpdateFitMsg(page, "Fit is out of date: model has been recompiled. "
                                 + "Rerun fit to update.");

        await reRunFit(page); // checks message is reset
    });

    test("can see expected update required message when new data uploaded", async ({ page }) => {
        await runFit(page);

        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        await expect(await page.locator("#fitDataUpload")).toBeVisible({ timeout });

        await uploadCSVData(page, multiTimeFitData);

        await expectUpdateFitMsg(page, "Fit is out of date: data have been updated. Rerun fit to update.");

        await reRunFit(page); // checks message is reset

        // Change time variable
        await page.selectOption("#select-time-variable", "Day2");
        await expectUpdateFitMsg(page, "Fit is out of date: model-data link has changed. "
                                 + "Rerun fit to update.");

        await reRunFit(page); // checks message is reset
    });

    test("can see expected update required message when linked variable changed", async ({ page }) => {
        await runFit(page);

        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.locator("#link-data select")).toBeVisible({ timeout });
        await page.selectOption("#link-data select", "E");
        await expectUpdateFitMsg(page, "Fit is out of date: model-data link has changed. "
                                 + "Rerun fit to update.");

        await reRunFit(page); // checks message is reset
    });

    test("can see expected updated required message when target to fit changes", async ({ page }) => {
        // run fit
        await startModelFit(page, multiTimeFitData);
        await waitForModelFitCompletion(page);

        // Make a new link
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const linkSelect = await linkContainer.locator(":nth-match(select, 2)");
        await linkSelect.selectOption("S");

        // Select the new link as target
        const targetSelect = await page.locator("#optimisation select");
        await targetSelect.selectOption("Day2");

        await expectUpdateFitMsg(page, "Fit is out of date: model-data link has changed. "
                                 + "Rerun fit to update.");

        await reRunFit(page); // checks message is reset
    });

    test("can select from multiple targets", async ({ page }) => {
        await uploadCSVData(page, multiCasesFitData);
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");

        // link variables
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.innerText("#optimisation")).toBe(
            "Please link at least one column in order to set target to fit."
        );
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const linkSelect1 = await linkContainer.locator(":nth-match(select, 1)");
        await linkSelect1.selectOption("I");
        const linkSelect2 = await linkContainer.locator(":nth-match(select, 2)");
        await linkSelect2.selectOption("E");

        await expect(await page.inputValue("#optimisation select")).toBe("Cases");
        await expect(await page.innerText(":nth-match(#optimisation select option, 1)")).toBe("Cases ~ I");
        await expect(await page.innerText(":nth-match(#optimisation select option, 2)")).toBe("Cases2 ~ E");
    });

    test("can cancel model fit", async ({ page }) => {
        await startModelFit(page);
        await page.click(".wodin-right .wodin-content div.mt-4 button#cancel-fit-btn");

        await expect(await page.getAttribute(".wodin-plot-container .vue-feather", "data-type")).toBe("alert-circle");
        await expect(await page.innerText(":nth-match(.wodin-plot-container span, 1)")).toContain("Iterations:");
        await expect(await page.innerText(":nth-match(.wodin-plot-container span, 2)"))
            .toContain("Sum of squares:");
        await expect(await page.innerText("#fit-cancelled-msg")).toBe("Model fit was cancelled before converging");
    });

    test("can mark sensitivity as out of date after fit", async ({ page }) => {
        await startModelFit(page);
        await page.click(".wodin-right .wodin-content div.mt-4 button#cancel-fit-btn");
        // Open sensitivity tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)");
        // Run sensitivity
        await page.click("#run-sens-btn");
        // Back to fit tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
        await reRunFit(page);
        // Back to sensitivity tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)");
        await expect(await page.innerText(".action-required-msg"))
            .toBe("Plot is out of date: parameters have been changed. Run Sensitivity to update.");
    });

    test("can display sum of squares on run tab", async ({ page }) => {
        await uploadCSVData(page, realisticFitData);
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)"); // change main to fit tab
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)"); // change left to options tab
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const select1 = await linkContainer.locator(":nth-match(select, 1)");
        await select1.selectOption("onset");
        await page.click(":nth-match(.wodin-right .nav-tabs a, 1)"); // change main to run tab
        const sumOfSquares = await page.innerText(":nth-match(.wodin-plot-container span, 1)");
        expect(sumOfSquares).toContain("Sum of squares:");
    });
});
