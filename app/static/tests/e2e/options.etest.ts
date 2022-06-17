import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { newValidCode } from "./code.etest";

test.describe("Options Tab tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
    });

    test("can see default parameters", async ({ page }) => {
        await expect(await page.innerText(".collapse-title")).toContain("Model Parameters");
        await expect(await page.getAttribute(".collapse-title a i", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#model-params")).not.toBeHidden();

        await expect(await page.innerText(":nth-match(#model-params label, 1)")).toBe("beta");
        await expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("4");
        await expect(await page.innerText(":nth-match(#model-params label, 2)")).toBe("I0");
        await expect(await page.inputValue(":nth-match(#model-params input, 2)")).toBe("1");
        await expect(await page.innerText(":nth-match(#model-params label, 3)")).toBe("N");
        await expect(await page.inputValue(":nth-match(#model-params input, 3)")).toBe("1000000");
        await expect(await page.innerText(":nth-match(#model-params label, 4)")).toBe("sigma");
        await expect(await page.inputValue(":nth-match(#model-params input, 4)")).toBe("2");
    });

    test("can collapse and expand parameters panel", async ({ page }) => {
        // collapse
        await page.click(".collapse-title a");
        await expect(await page.getAttribute(".collapse-title a i", "data-name")).toBe("chevron-down");
        await expect(await page.locator("#model-params")).toBeHidden();

        // expand
        await page.click(".collapse-title a");
        await expect(await page.getAttribute(".collapse-title a i", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#model-params")).not.toBeHidden();
    });

    test("can update parameter value", async ({ page }) => {
        // Check that we can see the graph paths change when a parameter changes and model is re-run
        const graphPathSelector = ":nth-match(.plotly svg .scatterlayer .scatter g.lines path, 1)";
        const previousPath = await page.getAttribute(graphPathSelector, "d");
        expect(previousPath!.startsWith("M0")).toBe(true);

        await page.fill(":nth-match(#model-params input, 1)", "3");

        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been recompiled or parameters have been updated. Run Model to view updated graph.", {
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
            "Model code has been recompiled or parameters have been updated. Run Model to view updated graph.", {
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

    test("cleared parameter input resets on model run", async ({ page }) => {
        await page.fill(":nth-match(#model-params input, 1)", "");
        await page.click("#run-btn");

        await expect(await page.locator(":nth-match(#model-params input, 1)")).toHaveValue(
            "4", {
                timeout
            }
        );
    });
});
