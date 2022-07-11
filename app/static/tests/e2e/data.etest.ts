import { expect, test, Page } from "@playwright/test";
import PlaywrightConfig from "../../playwright.config";

test.describe("Data tab tests", () => {
    const { timeout } = PlaywrightConfig;

    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day2");
    });

    const uploadCSVData = async (page: Page, data: string) => {
        const file = {
            name: "file.csv",
            mimeType: "text/plain",
            buffer: Buffer.from(data)
        };
        await page.setInputFiles("#fitDataUpload", file);
    };

    test("can upload valid csv file", async ({ page }) => {
        await uploadCSVData(page, "a,b\n1,2\n3,4\n5,6\n");
        await expect(await page.locator("#data-upload-success")).toHaveText(
            "Uploaded 3 rows and 2 columns", {
                timeout
            }
        );
        await expect(await page.innerText("#left-tabs .text-danger")).toBe("");
    });

    test("can see expected error when upload invalid csv file", async ({ page }) => {
        await uploadCSVData(page, "a,b\n1,hello\n");
        await expect(await page.locator("#left-tabs .text-danger")).toHaveText(
            "An error occurred when loading data: Data contains non-numeric values: 'hello'", {
                timeout
            }
        );
        await expect(page.locator("#data-upload-success")).toHaveCount(0);
    });
});
