import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";

test.describe("Wodin Tabs tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    const getRunPlotOpacity = async (page: Page) => {
        const plot = await page.locator(".run-model-plot");
        return plot.evaluate((el) => window.getComputedStyle(el).getPropertyValue("opacity"));
    };

    const newValidCode = `## Derivatives
deriv(y1) <- sigma * (y2 - y1)
deriv(y2) <- R * y1 - y2 - y1 * y3
deriv(y3) <- -b * y3 + y1 * y2

## Initial conditions
initial(y1) <- 10.0
initial(y2) <- 1.0
initial(y3) <- 1.0

## parameters
sigma <- 10.0
R     <- 28.0
b     <-  8.0 / 3.0
`;
    test("can update code, compile and run model", async ({ page }, done) => {
        // Update code - see update message and graph fade.
        // We seem to have to delete the old code here with key presses - 'fill' just prepends. I guess this relates to
        // how monaco responds to DOM events.
        await page.press(".monaco-editor textarea", "Control+A");
        await page.press(".monaco-editor textarea", "Delete");
        await page.fill(".monaco-editor textarea", newValidCode);

        await expect(page.locator(".run-tab .run-update-msg")).toHaveText(
            "Code has been updated. Compile code and Run Model to view graph for latest code.", {
                timeout
            }
        );
        expect(await getRunPlotOpacity(page)).toBe("0.5");
        expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");
        const compileBtn = await page.locator("#compile-btn");
        expect(await compileBtn.isDisabled()).toBe(false);

        // Compile code - see new update message
        await page.click("#compile-btn");
        await expect(page.locator(".run-tab .run-update-msg")).toHaveText(
            "Code has been recompiled. Run Model to view graph for latest code.", {
                timeout
            }
        );
        expect(await getRunPlotOpacity(page)).toBe("0.5");
        expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");

        // Run code - should no longer need update, and traces should have changed
        await page.click("#run-btn");
        await expect(page.locator(".run-tab .run-update-msg")).toHaveText("", { timeout });
        expect(await getRunPlotOpacity(page)).toBe("1");
        const legendTextSelector = ".js-plotly-plot .legendtext";
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("y1");
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("y2");
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("y3");
    });

    test("can see code not valid msg when update code with syntax error", async ({ page }) => {
        const invalidCode = "deriv(y1) sigma * (y2 - y1)";
        await page.press(".monaco-editor textarea", "Control+A");
        await page.press(".monaco-editor textarea", "Delete");
        await page.fill(".monaco-editor textarea", invalidCode);

        await expect(page.locator(".run-tab .run-update-msg")).toHaveText(
            "Code has been updated. Compile code and Run Model to view graph for latest code.", {
                timeout
            }
        );
        expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is not valid");
        const compileBtn = await page.locator("#compile-btn");
        expect(await compileBtn.isDisabled()).toBe(true);
    });
});
