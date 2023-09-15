import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { writeCode } from "./utils";

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

const newInvalidCode = `# variables
deriv(S) <-  - beta * S * I / N
deriv(I) <- beta * S * I / N - sigma * I
deriv(R) <- sigma * I
# initial conditions
initial(S) <- N - I0
initial(I) <- I0
initial(R) <- 0
# parameters
N <- user(0)
I0 <- user(1)
beta <- user(4)
sigma <- user(2)
`;

const editorGlyphs: any = {
    error: "fa-solid fa-circle-xmark",
    warning: "fa-solid fa-triangle-exclamation"
};

enum EditorStates {
    error = "error",
    warning = "warning"
}

test.beforeEach(async ({ page }) => {
    await page.goto("/apps/day1");
});

const expectMonacoDecoration = async (state: EditorStates, line: number, numOfLines: number, page: any) => {
    for (let i = 0; i < numOfLines; i += 1) {
        const lineElement = await page.locator(`.view-overlays div:nth-child(${i + 1}) >> div`);
        const glyphElement = await page.locator(`.margin-view-overlays div:nth-child(${i + 1}) >> div`);
        if (i === line - 1) {
            expect(lineElement).toHaveClass(`cdr editor-${state}-background`);
            expect(glyphElement.nth(0)).toHaveClass(`cgmr codicon ${editorGlyphs[state]} ${state}-glyph-style ms-1`);
            expect(glyphElement.nth(1)).toHaveClass("line-numbers lh-odd");
        } else if (i === numOfLines - 1) {
            expect(lineElement).toHaveClass("current-line");
            expect(glyphElement.nth(0)).toHaveClass("current-line current-line-margin-both");
            expect(glyphElement.nth(1)).toHaveClass(/\bactive-line-number\b/);
            expect(glyphElement.nth(1)).toHaveClass(/\bline-numbers\b/);
            expect(glyphElement.nth(1)).toHaveClass(/\blh-odd\b/);
        } else {
            expect(lineElement).toHaveCount(0);
            expect(glyphElement).toHaveClass("line-numbers lh-odd");
        }
    }
};

const expectMonacoHover = async (type: "glyph" | "content", line: number, message: string, page: any) => {
    const isGlyph = type === "glyph";
    const hoverElem = `.${isGlyph ? "margin-" : ""}view-overlays div:nth-child(${line}) >> div`;
    const tooltipElem = `${isGlyph ? ".overlayWidgets" : ".overflowingContentWidgets"} .hover-contents div p`;
    await page.hover(hoverElem, { force: true });
    const tooltip = await page.locator(tooltipElem);
    await tooltip.waitFor({ timeout: 1000 });
    await expect(tooltip).toHaveText(message);
    await expect(tooltip).toHaveCSS("visibility", "visible");
};

test.describe("Code Tab tests", () => {
    const { timeout } = PlaywrightConfig;

    const getRunPlotOpacity = async (page: Page) => {
        const plot = await page.locator(".wodin-plot-container");
        return plot.evaluate((el) => window.getComputedStyle(el).getPropertyValue("opacity"));
    };

    test("can update code, compile and run model", async ({ page }) => {
        // Update code - see update message and graph fade.
        // We seem to have to delete the old code here with key presses - 'fill' just prepends. I guess this relates to
        // how monaco responds to DOM events.
        await writeCode(page, newValidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expect(await getRunPlotOpacity(page)).toBe("0.5");
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");
        const compileBtn = await page.locator("#compile-btn");
        expect(await compileBtn.isDisabled()).toBe(false);

        // Compile code - see new update message
        await page.click("#compile-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: model code has been recompiled. Run model to update.", {
                timeout
            }
        );
        await expect(await getRunPlotOpacity(page)).toBe("0.5");
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");

        // Run code - should no longer need update, and traces should have changed
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("", { timeout });
        await expect(await getRunPlotOpacity(page)).toBe("1");
        const legendTextSelector = ".js-plotly-plot .legendtext";
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("y1");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("y2");
        await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("y3");
    });

    test("code loading on input renders as expected", async ({ page }) => {
        await page.press(".monaco-editor textarea", "Control+A");
        await page.press(".monaco-editor textarea", "Delete");
        page.fill(".monaco-editor textarea", "blah");
        expect(page.locator("#code-status")).toHaveClass("mt-2 code-validating-text");
        expect(page.locator("#code-status").locator("i"))
            .toHaveClass("vue-feather vue-feather--check inline-icon me-1 code-validating-icon");
    });

    test("can see code not valid msg when update code with syntax error", async ({ page }) => {
        const invalidCode = "deriv(y1) test * faker";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is not valid");
        const compileBtn = await page.locator("#compile-btn");
        expect(await compileBtn.isDisabled()).toBe(true);
    });

    test("can see red background and error glyph when update code with syntax error", async ({ page }) => {
        const invalidCode = "alpha <- 2\nderiv(y1) test * faker\nbeta <- 10";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expectMonacoDecoration(EditorStates.error, 2, 3, page);
    });

    test("can see glyph hover message with correct text with syntax error", async ({ page }) => {
        const invalidCode = "alpha <- 2\nderiv(y1) test * faker\nbeta <- 10";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expectMonacoHover("glyph", 2, "unexpected symbol", page);
    });

    test("can see line content hover message with correct text with syntax error", async ({ page }) => {
        const invalidCode = "alpha <- 2\nderiv(y1) test * faker\nbeta <- 10";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expectMonacoHover("content", 2, "unexpected symbol", page);
    });

    test("can see orange background and warning glyph when update code with unused var", async ({ page }) => {
        const warningCode = "beta <- 10\nderiv(I) <- beta * 2\nalpha <- 2\ninitial(I) <- 2";
        await writeCode(page, warningCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expectMonacoDecoration(EditorStates.warning, 3, 4, page);
    });

    test("can see glyph hover message with correct text with warning", async ({ page }) => {
        const warningCode = "beta <- 10\nderiv(I) <- beta * 2\nalpha <- 2\ninitial(I) <- 2";
        await writeCode(page, warningCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expectMonacoHover("glyph", 3, "Unused equation: alpha", page);
    });

    test("can see line content hover message with correct text with warning", async ({ page }) => {
        const warningCode = "beta <- 10\nderiv(I) <- beta * 2\nalpha <- 2\ninitial(I) <- 2";
        await writeCode(page, warningCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expectMonacoHover("content", 3, "Unused equation: alpha", page);
    });

    test("can reset code editor ", async ({ page }) => {
        const defaultCode = await page.innerText(".wodin-left .wodin-content .editor-container");
        const invalidCode = "faker\n";
        await writeCode(page, invalidCode);
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expect(await page.innerText(".wodin-left .wodin-content #reset-btn")).toBe("Reset");
        expect(await page.innerText(".wodin-left .wodin-content .editor-container")).not.toBe(defaultCode);
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is not valid");
        await page.click("#reset-btn");
        await page.waitForResponse((response) => response.url().includes("/odin"));
        expect(await page.innerText(".wodin-left .wodin-content .editor-container")).toBe(defaultCode);
        await expect(await page.locator(".wodin-left .wodin-content #code-status")).toHaveText("Code is valid");
    });

    test("can display error message on code tab", async ({ page }) => {
        const invalidCode = "faker\n";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is not valid");
        await expect(await page.innerText(".wodin-left .wodin-content #error-info"))
            .toBe("Code error: Error on line 1: Every line must contain an assignment, a compare statement "
                + "or a debug statement");
    });

    test("can display model error message when running model", async ({ page }) => {
        const defaultCode = await page.innerText(".wodin-left .wodin-content .editor-container");
        await writeCode(page, newInvalidCode);
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expect(await page.innerText(".wodin-left .wodin-content #reset-btn")).toBe("Reset");
        expect(await page.innerText(".wodin-left .wodin-content .editor-container")).not.toBe(defaultCode);
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");

        const compileBtn = await page.locator("#compile-btn");
        await expect(await compileBtn.isDisabled()).toBe(false);
        await compileBtn.click();

        const runBtn = await page.locator("#run-btn");
        await expect(await runBtn.isDisabled()).toBe(false);
        await runBtn.click();

        await expect(await page.innerText(".run-tab #error-info"))
            .toBe("An error occurred while running the model: Integration failure: too many steps at 0");
    });

    test("can select and unselect variables", async ({ page }) => {
        // unselect I
        const iVariable = await page.locator(":nth-match(.selected-variables-panel span.variable, 2)");
        await iVariable.click();

        // check plot no longer contains R series
        await expect(await page.locator(".wodin-plot-data-summary-series").count()).toBe(2);
        await expect(await page.locator(":nth-match(.wodin-plot-data-summary-series, 1)").getAttribute("name"))
            .toBe("S");
        await expect(await page.locator(":nth-match(.wodin-plot-data-summary-series, 2)").getAttribute("name"))
            .toBe("R");

        // re-select I
        await iVariable.click();
        await expect(await page.locator(".wodin-plot-data-summary-series").count()).toBe(3);
        await expect(await page.locator(":nth-match(.wodin-plot-data-summary-series, 1)").getAttribute("name"))
            .toBe("S");
        await expect(await page.locator(":nth-match(.wodin-plot-data-summary-series, 2)").getAttribute("name"))
            .toBe("I");
        await expect(await page.locator(":nth-match(.wodin-plot-data-summary-series, 3)").getAttribute("name"))
            .toBe("R");
    });

    test("can display help dialog", async ({ page }) => {
        await page.click("div.code-tab i.generic-help-icon");
        expect((await page.innerText(".draggable-dialog .dragtarget")).trim()).toBe("Write odin code");
        expect(await page.innerText(".draggable-dialog .draggable-content")).toContain("Write code in this editor");

        // close dialog
        await page.click("i.vue-feather--x");
        expect(await page.locator(".draggable-dialog")).not.toBeVisible();
    });

    test("can see error after changing tabs and coming back", async ({ page }) => {
        const invalidCode = "alpha <- 2\nderiv(y1) test * faker\nbeta <- 10";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expectMonacoDecoration(EditorStates.error, 2, 3, page);

        await page.click(".nav-tabs a:has-text('Options')");
        await page.click(".nav-tabs a:has-text('Code')");
        const lineElement = await page.locator(`.view-overlays div:nth-child(${2}) >> div`);
        expect(lineElement).toHaveClass("cdr editor-error-background");
    });

    test("can see warning after changing tabs and coming back", async ({ page }) => {
        const warningCode = "beta <- 10\nderiv(I) <- beta * 2\nalpha <- 2\ninitial(I) <- 2";
        await writeCode(page, warningCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await expectMonacoDecoration(EditorStates.warning, 3, 4, page);

        await page.click(".nav-tabs a:has-text('Options')");
        await page.click(".nav-tabs a:has-text('Code')");
        const lineElement = await page.locator(`.view-overlays div:nth-child(${3}) >> div`);
        expect(lineElement).toHaveClass("cdr editor-warning-background");
    });
});
