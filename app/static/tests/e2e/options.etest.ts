import { expect, test, Page } from "@playwright/test";

test.describe("Options Tab tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
    });

    test("can see default parameters", async ({ page }) => {
        expect(await page.innerText(".collapse-title")).toContain("Model Parameters");
        expect(await page.getAttribute(".collapse-title a i", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#model-params")).not.toBeHidden();

        expect(await page.innerText(":nth-match(#model-params label, 1)")).toBe("beta");
        expect(await page.inputValue(":nth-match(#model-params input, 1)")).toBe("4");
        expect(await page.innerText(":nth-match(#model-params label, 2)")).toBe("I0");
        expect(await page.inputValue(":nth-match(#model-params input, 2)")).toBe("1");
        expect(await page.innerText(":nth-match(#model-params label, 3)")).toBe("N");
        expect(await page.inputValue(":nth-match(#model-params input, 3)")).toBe("1000000");
        expect(await page.innerText(":nth-match(#model-params label, 4)")).toBe("sigma");
        expect(await page.inputValue(":nth-match(#model-params input, 4)")).toBe("2");
    });

    test("can collapse and expand parameters panel", async ({ page }) => {
        // collapse
        await page.click(".collapse-title a");
        expect(await page.getAttribute(".collapse-title a i", "data-name")).toBe("chevron-down");
        await expect(await page.locator("#model-params")).toBeHidden();

        // expand
        await page.click(".collapse-title a");
        expect(await page.getAttribute(".collapse-title a i", "data-name")).toBe("chevron-up");
        await expect(await page.locator("#model-params")).not.toBeHidden();
    });
});
