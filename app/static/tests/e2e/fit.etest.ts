import { expect, test, Page } from "@playwright/test";
import { uploadCSVData } from "./utils";

const realisticFitData = `Day,Cases
0,1
1,1
2,0
3,2
4,5
5,3
6,3
7,3
8,6
9,2
10,5
11,9
12,13
13,12
14,13
15,11
16,12
17,6
18,6
19,6
20,3
21,1
22,0
23,2
24,0
25,0
26,0
27,0
28,2
29,0
30,2
31,0`;

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
        await expect(await page.innerText(".wodin-right .wodin-content div.mt-4"))
            .toBe("Coming soon: Sensitivity plot");
    });

    test("can run model fit", async ({ page }) => {
        // Upload data
        await uploadCSVData(page, realisticFitData);

        // link variables
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const select1 = await linkContainer.locator(":nth-match(select, 1)");
        await select1.selectOption("I");

        // run fit
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Fit");
        await page.click(".wodin-right .wodin-content div.mt-4 button");

        // wait til fit completes
        await expect(await page.getAttribute(".run-plot-container .vue-feather", "data-type")).toBe("check");
        await expect(await page.innerText(":nth-match(.run-plot-container span, 1)")).toContain("Iterations:");
        await expect(await page.innerText(":nth-match(.run-plot-container span, 2)"))
            .toContain("Sum of squares:");

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
    });
});
