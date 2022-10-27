import { expect, test, Page } from "@playwright/test";
import * as fs from "fs";
import { realisticFitData } from "./utils";

test.describe("Index tests", () => {
    const tmpPath = "tmp";

    test.beforeAll(() => {
        if (fs.existsSync(tmpPath)) {
            fs.rmdirSync(tmpPath, { recursive: true });
        }
        fs.mkdirSync(tmpPath);
    });

    test.afterAll(() => {
        fs.rmdirSync(tmpPath, { recursive: true });
    });

    test("renders heading", async ({ page }) => {
        await page.goto("/");
        await expect(await page.innerText("h1")).toBe("Example WODIN configuration");
    });

    test("day1 link goes to Basic app", async ({ page }) => {
        await page.goto("/");
        await page.click("a[href='apps/day1']");

        await expect(await page.title()).toBe("Day 1 - Basic Model - WODIN Example");
        await expect(await page.innerText("nav .navbar-app")).toBe("Day 1 - Basic Model");
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Code");
        await expect(await page.locator(".alert-danger")).not.toBeVisible();
    });

    test("day2 link goes to Fit app", async ({ page }) => {
        await page.goto("/");
        await page.click("a[href='apps/day2']");

        await expect(await page.title()).toBe("Day 2 - Model Fit - WODIN Example");
        await expect(await page.innerText("nav .navbar-app")).toBe("Day 2 - Model Fit");
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Data");
        await expect(await page.locator(".alert-danger")).not.toBeVisible();
    });

    test("day3 link goes to Stochastic app", async ({ page }) => {
        await page.goto("/");
        await page.click("a[href='apps/day3']");

        await expect(await page.title()).toBe("Day 3 - Stochastic Model - WODIN Example");
        await expect(await page.innerText("nav .navbar-app")).toBe("Day 3 - Stochastic Model");
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Code");
        await expect(await page.locator(".alert-danger")).not.toBeVisible();

        await page.waitForResponse((response) => response.url().includes("/odin/model"));
        await expect(await page.innerText("#code-status")).toBe(" Code is valid");
        await expect(await page.innerText("#stochastic-run-placeholder")).toBe("Stochastic series count: 14");
    });

    const testDownloadFile = async (href: string, localFileName: string, expectedContent: string, page: Page) => {
        await page.goto("/");

        const [download] = await Promise.all([
            page.waitForEvent("download"), // wait for download to start
            page.click(`a[href='${href}']`)
        ]);
        const downloadPath = `${tmpPath}/${localFileName}`;
        await download.saveAs(downloadPath);
        const downloadContent = fs.readFileSync(downloadPath, { encoding: "utf-8" });
        await expect(downloadContent).toBe(expectedContent);
    };

    test("can download day 2 sample file", async ({ page }) => {
        await testDownloadFile("files/day2/influenza_data.csv", "influenza_data.csv", realisticFitData, page);
    });

    test("can download day 3 sample file", async ({ page }) => {
        await testDownloadFile("files/day3/sample1.csv", "sample3-1.csv", "3,3\n", page);
    });
});
