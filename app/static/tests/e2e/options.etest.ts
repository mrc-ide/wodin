import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { newValidCode } from "./code.etest";

test.describe("Options Tab tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
    });

    test("can see default options", async ({ page }) => {
        await expect(await page.innerText(":nth-match(.collapse-title, 1)")).toContain("Model Parameters");
        await expect(await page.getAttribute(":nth-match(.collapse-title a i, 1)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#model-params")).not.toBeHidden();

        await expect(await page.innerText(":nth-match(#model-params label, 1)")).toBe("beta");
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("4");
        await expect(await page.innerText(":nth-match(#model-params label, 2)")).toBe("I0");
        await expect(await page.inputValue(":nth-match(#model-params input, 2)")).toBe("1");
        await expect(await page.innerText(":nth-match(#model-params label, 3)")).toBe("N");
        await expect(await page.inputValue(":nth-match(#model-params input, 3)")).toBe("1000000");
        await expect(await page.innerText(":nth-match(#model-params label, 4)")).toBe("sigma");
        await expect(await page.inputValue(":nth-match(#model-params input, 4)")).toBe("2");

        await expect(await page.innerText(":nth-match(.collapse-title, 2)")).toContain("Run Options");
        await expect(await page.getAttribute(":nth-match(.collapse-title a i, 2)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#run-options")).not.toBeHidden();

        await expect(await page.innerText(":nth-match(#run-options label, 1)")).toBe("End time");
        await expect(await page.inputValue(":nth-match(#run-options input, 1)")).toBe("100");
    });

    test("can collapse and expand options panel", async ({ page }) => {
        // parameters collapse
        await page.click(":nth-match(.collapse-title a, 1)");
        await expect(await page.getAttribute(":nth-match(.collapse-title a i, 1)", "data-name")).toBe("chevron-down");
        await expect(await page.locator("#model-params")).toBeHidden();

        // parameters expand
        await page.click(":nth-match(.collapse-title a, 1)");
        await expect(await page.getAttribute(":nth-match(.collapse-title a i ,1)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#model-params")).not.toBeHidden();

        // run-options collapse
        await page.click(":nth-match(.collapse-title a, 2)");
        await expect(await page.getAttribute(":nth-match(.collapse-title a i, 2)", "data-name")).toBe("chevron-down");
        await expect(await page.locator("#run-options")).toBeHidden();

        // parameters expand
        await page.click(":nth-match(.collapse-title a, 2)");
        await expect(await page.getAttribute(":nth-match(.collapse-title a i, 2)", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#run-options")).not.toBeHidden();
    });

    test("can update parameter value", async ({ page }) => {
        // Check that we can see the graph paths change when a parameter changes and model is re-run
        const graphPathSelector = ":nth-match(.plotly svg .scatterlayer .scatter g.lines path, 1)";
        const previousPath = await page.getAttribute(graphPathSelector, "d");
        expect(previousPath!.startsWith("M0")).toBe(true);

        await page.fill(":nth-match(#model-params input, 1)", "3");

        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been recompiled or options have been updated. Run Model to view updated graph.", {
                timeout
            }
        );

        // Re-run model
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText("");

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
        await page.fill(".monaco-editor textarea", newValidCode);

        await expect(page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to view updated graph.", {
                timeout
            }
        );

        // Compile code
        await page.click("#compile-btn");
        await expect(page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been recompiled or options have been updated. Run Model to view updated graph.", {
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

        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been recompiled or options have been updated. Run Model to view updated graph.", {
                timeout
            }
        );

        // Re-run model
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText("");

        // Expect run plot's x axis final tick to now be 200
        await expect(await page.locator(xAxisTickSelector).last().innerHTML()).toBe("200");
    });
});
