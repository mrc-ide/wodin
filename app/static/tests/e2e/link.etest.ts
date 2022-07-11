import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import {uploadCSVData} from "./utils";


test.describe("Link Variables tests", () => {
    const {timeout} = PlaywrightConfig;

    test.beforeEach(async ({page}) => {
        await page.goto("/apps/day2");
        uploadCSVData(page, "Day,Cases,Admissions\n1,2,1\n3,4,2\n5,6,3\n7,8,4\n9,10,5");
    });

    test("displays expected link interface after data upload", async ({page}) => {
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.innerText(":nth-match(.collapse-title, 1)")).toBe("Link");
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const rows = await linkContainer.locator(".row");
        await expect(rows).toHaveCount(2);
        await expect(await page.innerText(":nth-match(.collapse label, 1)")).toBe("Cases");
        await expect(await page.inputValue(":nth-match(.collapse select, 1)")).toBe("");
        const select1 = await linkContainer.locator(":nth-match(select, 1)");
        const options1 = await select1.locator("option");
        const expectedVariableOptions = ["-- no link --", "S", "I", "R"];
        await expect(options1).toHaveCount(4);
        await expect(await options1.allInnerTexts()).toStrictEqual(expectedVariableOptions);

        await expect(await page.innerText(":nth-match(.collapse label, 2)")).toBe("Admissions");
        await expect(await page.inputValue(":nth-match(.collapse select, 2)")).toBe("");
        const select2 = await linkContainer.locator(":nth-match(select, 2)");
        const options2 = await select2.locator("option");
        await expect(options2).toHaveCount(4);
        await expect(await options2.allInnerTexts()).toStrictEqual(expectedVariableOptions);
    });

    test("can change link variables selections, which are retained on tab change", async ({page}) => {
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
        const select1 = await linkContainer.locator(":nth-match(select, 1)");
        await select1.selectOption("I");
        const select2 = await linkContainer.locator(":nth-match(select, 2)");
        await select2.selectOption("R");

        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        await expect(await page.innerText("h3")).toBe("Upload data");

        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
        await expect(await page.inputValue(":nth-match(.collapse select, 1)")).toBe("I");
        await expect(await page.inputValue(":nth-match(.collapse select, 2)")).toBe("R");
    });
});
