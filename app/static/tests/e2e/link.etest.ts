import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { uploadCSVData } from "./utils";
import { newValidCode } from "./code.etest";

export const newVariableCode = `# variables
deriv(S) <-  - beta * S * J / N
deriv(J) <- beta * S * J / N - sigma * J
deriv(R) <- sigma * J
# initial conditions
initial(S) <- N - I0
initial(J) <- I0
initial(R) <- 0
# parameters
N <- user(1e6)
I0 <- user(1)
beta <- user(4)
sigma <- user(2)
`;

test.describe("Link Variables tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day2");
        uploadCSVData(page, "Day,Cases,Admissions\n1,2,1\n3,4,2\n5,6,3\n7,8,4\n9,10,5");
    });

    const makeInitialLinkSelections = async (page: Page) => {
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        await expect(linkContainer.locator(':nth-match(select, 1) option:has-text("I")')).toBeEnabled({ timeout });
        const select1 = await linkContainer.locator(":nth-match(select, 1)");
        await select1.selectOption("I");
        const select2 = await linkContainer.locator(":nth-match(select, 2)");
        await select2.selectOption("R");
    };

    test("displays expected link interface after data upload", async ({ page }) => {
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.innerText(":nth-match(.collapse-title, 1)")).toBe("Link");
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const rows = await linkContainer.locator(".row");
        await expect(rows).toHaveCount(2);
        await expect(await page.innerText(":nth-match(.collapse label, 1)")).toBe("Cases");
        await expect(await page.inputValue(":nth-match(.collapse select, 1)")).toBe("");
        const select1 = await linkContainer.locator(":nth-match(select, 1)");
        const options1 = await select1.locator("option");
        const expectedVariableOptions = ["-- no link --", "S", "E", "I", "R", "onset"];
        await expect(options1).toHaveCount(6);
        await expect(await options1.allInnerTexts()).toStrictEqual(expectedVariableOptions);

        await expect(await page.innerText(":nth-match(.collapse label, 2)")).toBe("Admissions");
        await expect(await page.inputValue(":nth-match(.collapse select, 2)")).toBe("");
        const select2 = await linkContainer.locator(":nth-match(select, 2)");
        const options2 = await select2.locator("option");
        await expect(options2).toHaveCount(6);
        await expect(await options2.allInnerTexts()).toStrictEqual(expectedVariableOptions);
    });

    test("can change link variables selections, which are retained on tab change", async ({ page }) => {
        await makeInitialLinkSelections(page);

        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        await expect(await page.innerText("h3")).toBe("Upload data");

        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.inputValue(":nth-match(.collapse select, 1)")).toBe("I");
        await expect(await page.inputValue(":nth-match(.collapse select, 2)")).toBe("R");
    });

    test("link variables selections are retained on upload new data where possible", async ({ page }) => {
        await makeInitialLinkSelections(page);

        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        uploadCSVData(page, "Day,Cases,AdmissionsNew\n1,2,1\n3,4,2\n5,6,3\n7,8,4\n9,10,5");

        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.innerText(":nth-match(.collapse label, 1)")).toBe("Cases");
        await expect(await page.inputValue(":nth-match(.collapse select, 1)")).toBe("I");
        await expect(await page.innerText(":nth-match(.collapse label, 2)")).toBe("AdmissionsNew");
        await expect(await page.inputValue(":nth-match(.collapse select, 2)")).toBe("");
    });

    test("link variables selections are retained on select new time variable where possible", async ({ page }) => {
        await makeInitialLinkSelections(page);
        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        await page.selectOption("#select-time-variable", "Cases");

        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.innerText(":nth-match(.collapse label, 1)")).toBe("Day");
        await expect(await page.inputValue(":nth-match(.collapse select, 1)")).toBe("");
        await expect(await page.innerText(":nth-match(.collapse label, 2)")).toBe("Admissions");
        await expect(await page.inputValue(":nth-match(.collapse select, 2)")).toBe("R");
    });

    test("link variables selections are retained on recompile code where possible", async ({ page }) => {
        await makeInitialLinkSelections(page);
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");

        // new code replaces I variable with J
        await page.press(".monaco-editor textarea", "Control+A");
        await page.press(".monaco-editor textarea", "Delete");
        await page.fill(".monaco-editor textarea", newVariableCode);

        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );
        await page.click("#compile-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: model code has been recompiled. Run model to update.", {
                timeout
            }
        );

        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.innerText(":nth-match(.collapse label, 1)")).toBe("Cases");
        await expect(await page.inputValue(":nth-match(.collapse select, 1)")).toBe("");
        await expect(await page.innerText(":nth-match(.collapse label, 2)")).toBe("Admissions");
        await expect(await page.inputValue(":nth-match(.collapse select, 2)")).toBe("R");

        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const select1 = await linkContainer.locator(":nth-match(select, 1)");
        const options1 = await select1.locator("option");
        const expectedVariableOptions = ["-- no link --", "S", "J", "R"];
        await expect(options1).toHaveCount(4);
        await expect(await options1.allInnerTexts()).toStrictEqual(expectedVariableOptions);
        const select2 = await linkContainer.locator(":nth-match(select, 2)");
        const options2 = await select2.locator("option");
        await expect(options2).toHaveCount(4);
        await expect(await options2.allInnerTexts()).toStrictEqual(expectedVariableOptions);
    });
});
