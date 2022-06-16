import { expect, test, Page } from "@playwright/test";

test.describe("Wodin App tabs tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    test("renders Code tab", async ({ page }) => {
        await expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Code");
        await expect(await page.inputValue(".monaco-editor textarea")).toContain("# variables");
        await expect(await page.innerText(".wodin-left .wodin-content button")).toBe("Compile");
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");
    });

    test("can change to Options tab and back", async ({ page }) => {
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Options");
        await expect(await page.innerText(".wodin-left .wodin-content div.mt-4")).toContain("Model Parameters");
    });

    test("renders plot in Run tab", async ({ page }) => {
        await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Run");

        const plotSelector = ".wodin-right .wodin-content div.mt-4 .js-plotly-plot";

        // Test line is plotted for each of 3 traces
        const linesSelector = `${plotSelector} .scatterlayer .trace .lines path`;
        expect((await page.locator(`:nth-match(${linesSelector}, 1)`).getAttribute("d"))!.startsWith("M0")).toBe(true);
        expect((await page.locator(`:nth-match(${linesSelector}, 2)`).getAttribute("d"))!.startsWith("M0")).toBe(true);
        expect((await page.locator(`:nth-match(${linesSelector}, 3)`).getAttribute("d"))!.startsWith("M0")).toBe(true);

        // Test traces appear on legend
        const legendTextSelector = `${plotSelector} .legendtext`;
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("S");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("I");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("R");

        // Test modebar menu is present
        await expect(await page.isVisible(`${plotSelector} .modebar`)).toBe(true);
    });

    test("can change to Sensitivity tab and back", async ({ page }) => {
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Sensitivity");
        await expect(await page.innerText(".wodin-right .wodin-content div.mt-4")).toBe("Coming soon: Sensitivity plot");
    });
});
