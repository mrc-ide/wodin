import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";

test.describe("Basic app tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
    });

    const expectBothMode = async (page: Page) => {
        expect(await page.innerText(".wodin-mode-both .wodin-left .wodin-content .nav-tabs .active"))
            .toBe("Code");
        expect(await page.locator(".wodin-mode-both .wodin-right .wodin-content .js-plotly-plot")).toBeVisible();
        expect(await page.locator(".wodin-collapse-controls #collapse-left")).toBeVisible();
        expect(await page.locator(".wodin-collapse-controls #collapse-right")).toBeVisible();
        expect(await page.locator(".wodin-left .view-left").isHidden()).toBe(true);
        expect(await page.locator(".wodin-right .view-right").isHidden()).toBe(true);
    };

    const expectRightMode = async (page: Page) => {
        expect(await page.locator(".wodin-mode-right .wodin-right .wodin-content .js-plotly-plot")).toBeVisible();
        expect(await page.locator(".wodin-mode-right .wodin-left .wodin-content").isHidden()).toBe(true);
        expect(await page.locator(".wodin-collapse-controls #collapse-left").isHidden()).toBe(true);
        expect(await page.locator(".wodin-collapse-controls #collapse-right")).toBeVisible();
        expect(await page.locator(".wodin-left .view-left")).toBeVisible();
        expect(await page.locator(".wodin-right .view-right").isHidden()).toBe(true);
    };

    const expectLeftMode = async (page: Page) => {
        expect(await page.locator(".wodin-mode-left .wodin-right .wodin-content").isHidden()).toBe(true);
        expect(await page.locator(".wodin-mode-left .wodin-left .wodin-content")).toBeVisible();
        expect(await page.locator(".wodin-collapse-controls #collapse-left")).toBeVisible();
        expect(await page.locator(".wodin-collapse-controls #collapse-right").isHidden()).toBe(true);
        expect(await page.locator(".wodin-left .view-left").isHidden()).toBe(true);
        expect(await page.locator(".wodin-right .view-right")).toBeVisible();
    };

    const getRunPlotOpacity = async (page: Page) => {
        const plot = await page.locator(".run-model-plot");
        return plot.evaluate((el) => window.getComputedStyle(el).getPropertyValue("opacity"));
    };

    test("can collapse and expand left panel", async ({ page }) => {
        await expectBothMode(page);

        await page.click("#collapse-left");
        await expectRightMode(page);

        await page.click("#collapse-right");
        await expectBothMode(page);
    });

    test("can collapse and expand right panel", async ({ page }) => {
        await expectBothMode(page);

        await page.click("#collapse-right");
        await expectLeftMode(page);

        await page.click("#collapse-left");
        await expectBothMode(page);
    });

    test("'View Options' shows both panels", async ({ page }) => {
        await page.click("#collapse-left");

        expect(await page.innerText(".view-left")).toBe("View Options");
        await page.click(".view-left");
        await expectBothMode(page);
    });

    test("'View Charts' shows both panels", async ({ page }) => {
        await page.click("#collapse-right");

        expect(await page.innerText(".view-right")).toBe("View Charts");
        await page.click(".view-right");
        await expectBothMode(page);
    });

    test("renders Code tab", async ({ page }) => {
        expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Code");
        expect(await page.inputValue(".monaco-editor textarea")).toContain("# variables");
        expect(await page.innerText(".wodin-left .wodin-content button")).toBe("Compile");
        expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");
    });

    test("can change to Options tab and back", async ({ page }) => {
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Options");
        expect(await page.innerText(".wodin-left .wodin-content div.mt-4")).toBe("Coming soon: Options editor.");
    });

    test("renders plot in Run tab", async ({ page }) => {
        expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Run");

        const plotSelector = ".wodin-right .wodin-content div.mt-4 .js-plotly-plot";

        // Test line is plotted for each of 3 traces
        const linesSelector = `${plotSelector} .scatterlayer .trace .lines path`;
        expect((await page.locator(`:nth-match(${linesSelector}, 1)`).getAttribute("d"))!.startsWith("M0")).toBe(true);
        expect((await page.locator(`:nth-match(${linesSelector}, 2)`).getAttribute("d"))!.startsWith("M0")).toBe(true);
        expect((await page.locator(`:nth-match(${linesSelector}, 3)`).getAttribute("d"))!.startsWith("M0")).toBe(true);

        // Test traces appear on legend
        const legendTextSelector = `${plotSelector} .legendtext`;
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("S");
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("I");
        expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("R");

        // Test modebar menu is present
        expect(await page.isVisible(`${plotSelector} .modebar`)).toBe(true);
    });

    test("can change to Sensitivity tab and back", async ({ page }) => {
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
        expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Sensitivity");
        expect(await page.innerText(".wodin-right .wodin-content div.mt-4")).toBe("Coming soon: Sensitivity plot");
    });

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
