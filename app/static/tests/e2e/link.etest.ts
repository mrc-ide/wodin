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
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");

    });
});
