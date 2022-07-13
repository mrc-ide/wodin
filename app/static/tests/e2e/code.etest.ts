import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";

export const newValidCode = `## Derivatives
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

test.describe("Code Tab tests", () => {
    const { timeout } = PlaywrightConfig;

    const writeCode = async (page: Page, code: string) => {
        await page.press(".monaco-editor textarea", "Control+A");
        await page.press(".monaco-editor textarea", "Delete");
        await page.fill(".monaco-editor textarea", "");
        await page.fill(".monaco-editor textarea", code);
    };

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    const getRunPlotOpacity = async (page: Page) => {
        const plot = await page.locator(".run-model-plot");
        return plot.evaluate((el) => window.getComputedStyle(el).getPropertyValue("opacity"));
    };

    test("can update code, compile and run model", async ({ page }) => {
        // Update code - see update message and graph fade.
        // We seem to have to delete the old code here with key presses - 'fill' just prepends. I guess this relates to
        // how monaco responds to DOM events.
        await writeCode(page, newValidCode);

        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to view updated graph.", {
                timeout
            }
        );
        await expect(await getRunPlotOpacity(page)).toBe("0.5");
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");
        const compileBtn = await page.locator("#compile-btn");
        expect(await compileBtn.isDisabled()).toBe(false);

        // Compile code - see new update message
        await page.click("#compile-btn");
        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been recompiled or options have been updated. Run Model to view updated graph.", {
                timeout
            }
        );
        await expect(await getRunPlotOpacity(page)).toBe("0.5");
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");

        // Run code - should no longer need update, and traces should have changed
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText("", { timeout });
        await expect(await getRunPlotOpacity(page)).toBe("1");
        const legendTextSelector = ".js-plotly-plot .legendtext";
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("y1");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("y2");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("y3");
    });

    test("can see code not valid msg when update code with syntax error", async ({ page }) => {
        const invalidCode = "deriv(y1) test * faker";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to view updated graph.", {
                timeout
            }
        );
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is not valid");
        const compileBtn = await page.locator("#compile-btn");
        expect(await compileBtn.isDisabled()).toBe(true);
    });

    test("can reset code editor", async ({ page }) => {
        const defaultCode = await page.innerText(".wodin-left .wodin-content .editor-container");
        const invalidCode = "faker\n";
        await writeCode(page, invalidCode);
        await expect(await page.locator(".run-tab .run-update-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to view updated graph.", {
                timeout
            }
        );
        await expect(await page.innerText(".wodin-left .wodin-content #reset-btn")).toBe("Reset");
        expect(await page.innerText(".wodin-left .wodin-content .editor-container")).not.toBe(defaultCode);
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is not valid");
        await page.click("#reset-btn");
        await page.waitForResponse((response) => response.url().includes("/odin"));
        expect(await page.innerText(".wodin-left .wodin-content .editor-container")).toBe(defaultCode);
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");
    });
});
