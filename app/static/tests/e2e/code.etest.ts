import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { saveSessionTimeout, writeCode, expectGraphVariables } from "./utils";

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

const editorGlyphs: Record<EditorStates, string> = {
    error: "fa-circle-xmark",
    warning: "fa-triangle-exclamation"
};

enum EditorStates {
    error = "error",
    warning = "warning"
}

test.beforeEach(async ({ page }) => {
    await page.goto("/apps/day1");
});

const expectMonacoDecoration = async (state: EditorStates, line: number, numOfLines: number, page: Page) => {
    // check that the correct line has the correct background color here by looping through
    // each line
    for (let i = 0; i < numOfLines; i += 1) {
        const lineElement = await page.locator(`.view-overlays div:nth-child(${i + 1}) >> div`);
        if (i === line - 1) {
            await expect(lineElement).toHaveClass(`cdr editor-${state}-background`);
        } else if (i === numOfLines - 1) {
            await expect(lineElement).toHaveClass("current-line");
        } else {
            await expect(lineElement).toHaveCount(0);
        }
    }

    // check that the glyph (our error/warning icon) is vertically aligned with the
    // correct line number, monaco editor just sets a "top" css property to vertically
    // align it next to the line number so we calculate what that translation should be
    // by multiplying the line-height by the number of lines down we have to go down
    const lineHeight = await page.locator(".margin-view-overlays").evaluate(el => {
        return window.getComputedStyle(el).getPropertyValue("line-height");
    });
    const glyphTop = await page.locator(`.${editorGlyphs[state]}`).evaluate(el => {
        return window.getComputedStyle(el).getPropertyValue("top");
    });
    expect(glyphTop).toBe(`${(line - 1) * parseInt(lineHeight)}px`);
};

const expectMonacoHover = async (type: "glyph" | "content", line: number, message: string, page: Page) => {
    const hoverElem = type === "content" ?
        `.view-overlays div:nth-child(${line}) >> div` :
        ".glyph-margin-widgets .fa-solid";
    await page.hover(hoverElem, { force: true });
    await expect(await page.getByText(message)).toBeVisible()
};

test.describe("Code Tab tests", () => {
    const { timeout } = PlaywrightConfig;

    const getRunPlotOpacity = async (page: Page) => {
        const plotEl = await page.locator(".wodin-plot-container");
        return plotEl.evaluate((el) => window.getComputedStyle(el).getPropertyValue("opacity"));
    };

    test("can update code, compile and run model", async ({ page }) => {
        // Update code - see update message and graph fade.
        // We seem to have to delete the old code here with key presses - 'fill' just prepends. I guess this relates to
        // how monaco responds to DOM events.
        await writeCode(page, newValidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
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
            "Plot is out of date: model code has been recompiled. Run model to update.",
            {
                timeout
            }
        );
        await expect(await getRunPlotOpacity(page)).toBe("0.5");
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is valid");

        // Run code - should no longer need update, and traces should have changed
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("", { timeout });
        await expect(await getRunPlotOpacity(page)).toBe("1");

        // TODO when legend is added - mrc-6826
        // const legendTextSelector = ".js-plotly-plot .legendtext";
        // await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 1)`)).toBe("y1");
        // await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 2)`)).toBe("y2");
        // await expect(await page.innerHTML(`:nth-match(${legendTextSelector}, 3)`)).toBe("y3");
    });

    test("code loading on input renders as expected", async ({ page }) => {
        await page.press(".monaco-editor textarea", "Control+A");
        await page.press(".monaco-editor textarea", "Delete");
        await page.fill(".monaco-editor textarea", "blah");
        await expect(page.locator("#code-status")).toHaveClass("mt-2 code-validating-text");
        await expect(page.locator("#code-status").locator("i")).toHaveClass(
            "vue-feather vue-feather--check inline-icon me-1 code-validating-icon"
        );
    });

    test("can see code not valid msg when update code with syntax error", async ({ page }) => {
        const invalidCode = "deriv(y1) test * faker";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
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
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expectMonacoDecoration(EditorStates.error, 2, 3, page);
    });

    test("can see glyph hover message with correct text with syntax error", async ({ page }) => {
        const invalidCode = "alpha <- 2\nderiv(y1) test * faker\nbeta <- 10";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expectMonacoHover("glyph", 2, "unexpected symbol", page);
    });

    test("can see line content hover message with correct text with syntax error", async ({ page }) => {
        const invalidCode = "alpha <- 2\nderiv(y1) test * faker\nbeta <- 10";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expectMonacoHover("content", 2, "unexpected symbol", page);
    });

    test("can see orange background and warning glyph when update code with unused var", async ({ page }) => {
        const warningCode = "beta <- 10\nderiv(I) <- beta * 2\nalpha <- 2\ninitial(I) <- 2";
        await writeCode(page, warningCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expectMonacoDecoration(EditorStates.warning, 3, 4, page);
    });

    test("can see glyph hover message with correct text with warning", async ({ page }) => {
        const warningCode = "beta <- 10\nderiv(I) <- beta * 2\nalpha <- 2\ninitial(I) <- 2";
        await writeCode(page, warningCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expectMonacoHover("glyph", 3, "Unused equation: alpha", page);
    });

    test("can see line content hover message with correct text with warning", async ({ page }) => {
        const warningCode = "beta <- 10\nderiv(I) <- beta * 2\nalpha <- 2\ninitial(I) <- 2";
        await writeCode(page, warningCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expectMonacoHover("content", 3, "Unused equation: alpha", page);
    });

    test("can reset code editor ", async ({ page }) => {
        await page.waitForTimeout(saveSessionTimeout);
        const defaultCode = await page.innerText(".wodin-left .wodin-content .editor-container");
        const invalidCode = "faker\n";
        await writeCode(page, invalidCode);
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expect(await page.innerText(".wodin-left .wodin-content #reset-btn")).toBe("Reset");
        expect(await page.innerText(".wodin-left .wodin-content .editor-container")).not.toBe(defaultCode);
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is not valid");
        await page.click("#reset-btn");
        await page.waitForResponse((response) => response.url().includes("/odin"));
        await page.waitForTimeout(saveSessionTimeout);
        expect(await page.innerText(".wodin-left .wodin-content .editor-container")).toBe(defaultCode);
        await expect(page.getByText("Code is valid")).toBeVisible();
    });

    test("can display error message on code tab", async ({ page }) => {
        const invalidCode = "faker\n";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expect(await page.innerText(".wodin-left .wodin-content #code-status")).toContain("Code is not valid");
        await expect(await page.innerText(".wodin-left .wodin-content #error-info")).toBe(
            "Code error: Error on line 1: Every line must contain an assignment, a compare statement " +
                "or a debug statement"
        );
    });

    test("can display model error message when running model", async ({ page }) => {
        const defaultCode = await page.innerText(".wodin-left .wodin-content .editor-container");
        await writeCode(page, newInvalidCode);
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
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

        await expect(await page.innerText(".run-tab #error-info")).toBe(
            "An error occurred while running the model: Integration failure: too many steps at 0"
        );
    });

    test("can hide and unhide variables", async ({ page }) => {
        // drag I to Hidden Variables
        const iVariable = await page.locator(":nth-match(.graph-config-panel span.variable, 2)");
        const hiddenVariables = await page.locator(".hidden-variables-panel");
        await iVariable.dragTo(hiddenVariables);

        // check plot no longer contains R series
        await expectGraphVariables(page, 0, ["S", "R"]);

        // drag I back to Graph panel
        const iVariableHidden = await page.locator(".hidden-variables-panel .variable");
        const graphVariablesPanel = await page.locator(".graph-config-panel .drop-zone");
        await iVariableHidden.dragTo(graphVariablesPanel);
        await expectGraphVariables(page, 0, ["S", "I", "R"]);

        // Can also click x button to hide variable
        await page.click(":nth-match(.graph-config-panel .variable-delete, 1)");
        await expectGraphVariables(page, 0, ["I", "R"]);
    });

    test("can add a graph, drag variables onto it and delete it", async ({ page }) => {
        // Add graph
        await page.click("#add-graph-btn");

        // Check second graph has appeared with placeholder text, and second graph config panel is there
        expect(
            await page.locator(":nth-match(.wodin-plot-container, 2)")
                .locator(".plot-placeholder")
                .textContent()
        ).toBe(
            "No variables are selected."
        );
        expect(await page.locator(":nth-match(.graph-config-panel .drop-zone, 2)").textContent()).toContain(
            "Drag variables here to select them for this graph."
        );

        // Drag variable to second graph
        const sVariable = await page.locator(":nth-match(.graph-config-panel .variable, 1)");
        const dragPositions = {
            sourcePosition: { x: 5, y: 5 },
            targetPosition: { x: 5, y: 5 }
        };
        await sVariable.dragTo(page.locator(":nth-match(.graph-config-panel .drop-zone, 2)"), dragPositions);

        await expectGraphVariables(page, 0, ["I", "R"]);
        await expectGraphVariables(page, 1, ["S"]);
        await expect(page.locator(".hidden-variables-panel .variable")).toHaveCount(0);

        // Drag a variable with Ctrl key to make copy
        const iVariable = await page.locator(":nth-match(.graph-config-panel .variable, 1)");
        await page.keyboard.down("Control");
        await iVariable.dragTo(page.locator(":nth-match(.graph-config-panel .drop-zone, 2)"), dragPositions);
        await page.keyboard.up("Control");
        await expectGraphVariables(page, 0, ["I", "R"]);
        await expectGraphVariables(page, 1, ["S", "I"]);

        // Delete second graph
        await page.click(":nth-match(.graph-config-panel .delete-graph, 2)");
        await expect(page.locator(".graph-config-panel")).toHaveCount(1);
        await expectGraphVariables(page, 0, ["I", "R"]);

        // First graph should not be deletable
        await expect(page.locator(".delete-graph")).toHaveCount(0);
    });

    test("can display help dialog", async ({ page }) => {
        await page.click("div.code-tab i.generic-help-icon");
        await expect((await page.innerText(".draggable-dialog .dragtarget")).trim()).toBe("Write odin code");
        await expect(await page.innerText(".draggable-dialog .draggable-content")).toContain("Write code in this editor");

        // close dialog
        await page.click("i.vue-feather--x");
        await expect(await page.locator(".draggable-dialog")).not.toBeVisible();
    });

    test("can see error after changing tabs and coming back", async ({ page }) => {
        const invalidCode = "alpha <- 2\nderiv(y1) test * faker\nbeta <- 10";
        await writeCode(page, invalidCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expectMonacoDecoration(EditorStates.error, 2, 3, page);

        await page.click(".nav-tabs a:has-text('Options')");
        await page.click(".nav-tabs a:has-text('Code')");
        const lineElement = await page.locator(`.view-overlays div:nth-child(${2}) >> div`);
        await expect(lineElement).toHaveClass("cdr editor-error-background");
    });

    test("can see warning after changing tabs and coming back", async ({ page }) => {
        const warningCode = "beta <- 10\nderiv(I) <- beta * 2\nalpha <- 2\ninitial(I) <- 2";
        await writeCode(page, warningCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );
        await expectMonacoDecoration(EditorStates.warning, 3, 4, page);

        await page.click(".nav-tabs a:has-text('Options')");
        await page.click(".nav-tabs a:has-text('Code')");
        const lineElement = await page.locator(`.view-overlays div:nth-child(${3}) >> div`);
        await expect(lineElement).toHaveClass("cdr editor-warning-background");
    });

    test("can change graph setting for log scale y axis from code tab", async ({ page }) => {
        await page.locator(".log-scale-y-axis input").click();
        // should update y axis tick
        const yAxis = page.locator(`g[id^="y-axes"]`);
        const firstTick = yAxis.locator(".tick").first();
        await expect(await firstTick.textContent()).toBe("100p");
        // change back to linear
        await page.locator(".log-scale-y-axis input").click();
        await expect(await firstTick.textContent()).toBe("0M");
    });
});
