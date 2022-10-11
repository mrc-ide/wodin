import { expect, test, Page } from "@playwright/test";

test.describe("Errors tests", () => {
    const expectShareNotFoundError = async (page: Page) => {
        await expect(await page.innerText(".alert-danger")).toContain("Share id not found: very-happy-toad");
    };

    test("basic app shows error if load with unknown share id", async ({ page }) => {
        await page.goto("/apps/day1?share=very-happy-toad");
        await expectShareNotFoundError(page);
    });

    test("fit app shows error if load with unknown share id", async ({ page }) => {
        await page.goto("/apps/day2?share=very-happy-toad");
        await expectShareNotFoundError(page);
    });

    test("stochastic app shows error if load with unknown share id", async ({ page }) => {
        await page.goto("/apps/day3?share=very-happy-toad");
        await expectShareNotFoundError(page);
    });
});
