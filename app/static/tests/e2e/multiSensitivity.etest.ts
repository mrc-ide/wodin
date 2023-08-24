import { expect, Page, test } from "@playwright/test";
import { SensitivityScaleType, SensitivityVariationType } from "../../src/app/store/sensitivity/state";

test.describe("Multi-sensitivity tests", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/apps/day1");
        // Open Options tab
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        // Open Multi-sensitivity tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)");
    });

    const expectOptionsTabParamSettings = async (page: Page, index: number, param: string, scale: SensitivityScaleType, variation: SensitivityVariationType,
        percentage: number | null, from: number | null, to: number | null, runs: number, values: string) => {
        const section = await page.locator(`:nth-match(.sensitivity-options-settings, ${index})`);
        const listItems = await section.locator("ul li");
        await expect(await listItems.nth(0).innerText()).toBe(`Parameter: ${param}`);
        await expect(await listItems.nth(1).innerText()).toBe(`Scale Type: ${scale}`);
        await expect(await listItems.nth(2).innerText()).toBe(`Variation Type: ${variation}`);
        if (variation === SensitivityVariationType.Percentage) {
            await expect(await listItems.nth(3).innerText()).toBe(`Variation (%): ${percentage}`);
            await expect(await listItems.nth(4).innerText()).toBe(`Number of runs: ${runs}`);
        } else {
            await expect(await listItems.nth(3).innerText()).toBe(`From: ${from}`);
            await expect(await listItems.nth(4).innerText()).toBe(`To: ${to}`);
            await expect(await listItems.nth(5).innerText()).toBe(`Number of runs: ${runs}`);
        }

        await expect(await section.locator(".alert-success").innerText()).toBe(` ${values}`);
    };

    const expectModalParamSettings = async (page: Page, index: number, param: string, scale: SensitivityScaleType, variation: SensitivityVariationType,
        percentage: number | null, from: number | null, central: number | null, to: number | null,
        runs: number, values: string) => {
        await expect(await page.inputValue(`:nth-match(.multi-sens-edit .edit-param-to-vary select, ${index})`)).toBe(param);
        await expect(await page.inputValue(`:nth-match(.multi-sens-edit .edit-scale-type select, ${index})`)).toBe(scale);
        await expect(await page.inputValue(`:nth-match(.multi-sens-edit .edit-variation-type select, ${index})`)).toBe(variation);
        // We cant index directly to controls which aren't present in all settings sections, so get to the section first
        const section = await page.locator(`:nth-match(.multi-sens-edit, ${index})`);
        if (variation === SensitivityVariationType.Percentage) {
            await expect(await section.locator(".edit-percent input").inputValue()).toBe(percentage!.toString());
        } else {
            await expect(await section.locator(".edit-from input").inputValue()).toBe(from!.toString());
            await expect(await section.locator(".param-central-value").innerText()).toBe(central!.toString());
            await expect(await section.locator(".edit-to input").inputValue()).toBe(to!.toString());
        }

        await expect(await page.inputValue(`:nth-match(.multi-sens-edit .edit-runs input, ${index})`)).toBe(runs.toString());

        await expect(await page.innerText(`:nth-match(.multi-sens-edit .alert-success, ${index})`)).toBe(` ${values}`);
    };

    test("can edit Multi-sensitivity options", async ({ page }) => {
        // check default param settings
        await expect(await page.locator(".sensitivity-options-settings").count()).toBe(1);
        await expectOptionsTabParamSettings(page, 1, "beta", SensitivityScaleType.Arithmetic, SensitivityVariationType.Percentage,
            10, null, null, 10, "3.600, 3.689, 3.778, ..., 4.400");

        // open edit param settings dialog and check values
        await page.click("#sensitivity-options .btn-primary");
        await expect(await page.locator(".multi-sens-edit").count()).toBe(1);
        await expectModalParamSettings(page, 1, "beta", SensitivityScaleType.Arithmetic, SensitivityVariationType.Percentage,
            10, null, null, null, 10, "3.600, 3.689, 3.778, ..., 4.400");

        // should be no delete button on first param settings
        await expect(await page.locator(".delete-param-to-vary").count()).toBe(0);

        // edit default params settings
        await page.selectOption(".edit-variation-type select", "Range");
        await expect(await page.isDisabled("#ok-settings")).toBe(true); // default range is invalid
        await page.fill(".edit-to input", "9");
        await expect(await page.isEnabled("#ok-settings")).toBe(true);

        // Add two new settings, and edit one of them
        await page.click("#add-param-to-vary");
        await expect(await page.locator(".multi-sens-edit").count()).toBe(2);
        await expectModalParamSettings(page, 2, "I0", SensitivityScaleType.Arithmetic, SensitivityVariationType.Percentage,
            10, null, null, null, 10, "0.900, 0.922, 0.944, ..., 1.100");

        await page.click("#add-param-to-vary");
        await expect(await page.locator(".multi-sens-edit").count()).toBe(3);
        await expectModalParamSettings(page, 3, "N", SensitivityScaleType.Arithmetic, SensitivityVariationType.Percentage,
            10, null, null, null, 10, "900000.000, 922222.222, 944444.444, ..., 1100000.000");
        // change parameter
        await page.selectOption(":nth-match(.multi-sens-edit .edit-param-to-vary select, 3)", "sigma");
        await expectModalParamSettings(page, 3, "sigma", SensitivityScaleType.Arithmetic, SensitivityVariationType.Percentage,
            10, null, null, null, 10, "1.800, 1.844, 1.889, ..., 2.200");
        // change percent
        const section = page.locator(":nth-match(.multi-sens-edit, 3)");
        await section.locator(".edit-percent input").fill("5");
        await expectModalParamSettings(page, 3, "sigma", SensitivityScaleType.Arithmetic, SensitivityVariationType.Percentage,
            5, null, null, null, 10, "1.900, 1.922, 1.944, ..., 2.100");

        // Delete one settings
        await page.click(":nth-match(.delete-param-to-vary, 1)");
        await expect(await page.locator(".multi-sens-edit").count()).toBe(2);
        await expectModalParamSettings(page, 1, "beta", SensitivityScaleType.Arithmetic, SensitivityVariationType.Range,
            null, 0, 4, 9, 10, "0.000, 1.000, 2.000, ..., 9.000");
        await expectModalParamSettings(page, 2, "sigma", SensitivityScaleType.Arithmetic, SensitivityVariationType.Percentage,
            5, null, null, null, 10, "1.900, 1.922, 1.944, ..., 2.100");

        // Save
        await page.click("#ok-settings");

        // check param settings visible on tab
        await expect(await page.locator(".sensitivity-options-settings").count()).toBe(2);
        await expectOptionsTabParamSettings(page, 1, "beta", SensitivityScaleType.Arithmetic, SensitivityVariationType.Range,
            null, 0, 9, 10, "0.000, 1.000, 2.000, ..., 9.000");
        await expectOptionsTabParamSettings(page, 2, "sigma", SensitivityScaleType.Arithmetic, SensitivityVariationType.Percentage,
            5, null, null, 10, "1.900, 1.922, 1.944, ..., 2.100");
    });
});
