import { expect, test } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";
import { uploadCSVData } from "./utils";

test.describe("Data tab tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day2");
    });

    test("can upload valid csv file", async ({ page }) => {
        await uploadCSVData(page, "a,b\n1,2\n3,4\n5,6\n7,8\n9,10");
        await expect(await page.locator("#data-upload-success")).toHaveText("Uploaded 5 rows and 2 columns", {
            timeout
        });
        await expect(await page.innerText("#left-tabs .text-danger")).toBe("");
    });

    test("can see expected error when upload invalid csv file", async ({ page }) => {
        await uploadCSVData(page, "a,b\n1,hello\n3,4\n5,6\n7,8\n9,10\n");
        await expect(await page.locator("#left-tabs .text-danger")).toHaveText(
            "An error occurred when loading data: Data contains non-numeric values: 'hello'",
            {
                timeout
            }
        );
        await expect(page.locator("#data-upload-success")).toHaveCount(0);
    });

    test("can select time variable", async ({ page }) => {
        await uploadCSVData(page, "a,b,c\n1,2,10\n3,4,9\n5,6,10\n7,8,11\n9,10,12");
        await expect(await page.locator("#data-upload-success")).toHaveText("Uploaded 5 rows and 3 columns", {
            timeout
        });

        const options = await page.locator("#select-time-variable option");
        await expect(options).toHaveCount(2);
        await expect(await options.allInnerTexts()).toStrictEqual(["a", "b"]);

        await expect(await page.inputValue("#select-time-variable")).toBe("a");

        await page.selectOption("#select-time-variable", "b");
        await expect(await page.inputValue("#select-time-variable")).toBe("b");

        // Check selected time variable persists across tab changes
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Code");
        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        await expect(await page.innerText(".wodin-left .wodin-content .nav-tabs .active")).toBe("Data");
        await expect(await page.inputValue("#select-time-variable")).toBe("b");
    });
});
