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

    const expectOptionsTabParamSettings = async (page: Page, index: number, param: string, scale: SensitivityScaleType,
        variation: SensitivityVariationType, percentage: number | null, from: number | null, to: number | null,
        runs: number, values: string) => {
        const section = await page.locator(`:nth-match(.sensitivity-options-settings, ${index})`);
        const listItems = await section.locator("ul li");
        await expect(await listItems.nth(0).innerText()).toBe(`Parameter: ${param}`);
        await expect(await listItems.nth(1).innerText()).toBe(`Variation Type: ${variation}`);
        await expect(await listItems.nth(2).innerText()).toBe(`Scale Type: ${scale}`);
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

    const expectModalParamSettings = async (page: Page, param: string, scale: SensitivityScaleType,
        variation: SensitivityVariationType, percentage: number | null, from: number | null, central: number | null,
        to: number | null, runs: number, values: string) => {
        await expect(await page.inputValue("#edit-param-to-vary select")).toBe(param);
        await expect(await page.inputValue("#edit-variation-type select")).toBe(variation);
        await expect(await page.inputValue("#edit-scale-type select")).toBe(scale);
        if (variation === SensitivityVariationType.Percentage) {
            await expect(await page.inputValue("#edit-percent input")).toBe(percentage!.toString());
        } else {
            await expect(await page.inputValue("#edit-from input")).toBe(from!.toString());
            await expect(await page.innerText("#param-central-value")).toBe(central!.toString());
            await expect(await page.inputValue("#edit-to input")).toBe(to!.toString());
        }

        await expect(await page.inputValue("#edit-runs input")).toBe(runs.toString());
        await expect(await page.innerText("#edit-param .alert-success")).toBe(` ${values}`);
    };

    test("can edit Multi-sensitivity options", async ({ page }) => {
        // check default param settings
        await expect(await page.locator(".sensitivity-options-settings").count()).toBe(1);
        await expectOptionsTabParamSettings(page, 1, "beta", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 10, null, null, 10, "3.600, 3.689, 3.778, ..., 4.400");

        // should be no delete button on first param settings
        await expect(await page.locator(".delete-param-to-vary").count()).toBe(0);

        // open edit param settings dialog and check values
        await page.click(":nth-match(.edit-param-settings, 1)");
        await expect(await page.locator("#edit-param").count()).toBe(1);
        await expectModalParamSettings(page, "beta", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 10, null, null, null, 10, "3.600, 3.689, 3.778, ..., 4.400");

        // edit default params settings
        await page.selectOption("#edit-variation-type select", "Range");
        await expect(await page.isDisabled("#ok-settings")).toBe(true); // default range is invalid
        await page.fill("#edit-to input", "9");
        await expect(await page.isEnabled("#ok-settings")).toBe(true);
        await page.click("#ok-settings");

        // checked edited settings saved correctly
        await expectOptionsTabParamSettings(page, 1, "beta", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Range, null, 0, 9, 10, "0.000, 1.000, 2.000, ..., 9.000");

        // Add two new settings, and edit one of them
        await page.click("#add-param-settings");
        await expect(await page.locator(".sensitivity-options-settings").count()).toBe(2);
        await expectOptionsTabParamSettings(page, 2, "I0", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 10, null, null, 10, "0.900, 0.922, 0.944, ..., 1.100");

        await page.click("#add-param-settings");
        await expect(await page.locator(".sensitivity-options-settings").count()).toBe(3);
        await expectOptionsTabParamSettings(page, 3, "N", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 10, null, null, 10,
            "900000.000, 922222.222, 944444.444, ..., 1100000.000");

        // change a parameter
        await page.click(":nth-match(.edit-param-settings, 3)");
        await page.selectOption("#edit-param-to-vary select", "sigma");
        await expectModalParamSettings(page, "sigma", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 10, null, null, null, 10, "1.800, 1.844, 1.889, ..., 2.200");
        // change percent
        await page.fill("#edit-percent input", "5");
        await expectModalParamSettings(page, "sigma", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 5, null, null, null, 10, "1.900, 1.922, 1.944, ..., 2.100");

        // Save
        await page.click("#ok-settings");
        await expectOptionsTabParamSettings(page, 1, "beta", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Range, null, 0, 9, 10, "0.000, 1.000, 2.000, ..., 9.000");
        await expectOptionsTabParamSettings(page, 2, "I0", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 10, null, null, 10, "0.900, 0.922, 0.944, ..., 1.100");
        await expectOptionsTabParamSettings(page, 3, "sigma", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 5, null, null, 10, "1.900, 1.922, 1.944, ..., 2.100");

        // Delete one settings
        await page.click(":nth-match(.delete-param-settings, 2)");

        await expect(await page.locator(".sensitivity-options-settings").count()).toBe(2);
        await expectOptionsTabParamSettings(page, 1, "beta", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Range, null, 0, 9, 10, "0.000, 1.000, 2.000, ..., 9.000");
        await expectOptionsTabParamSettings(page, 2, "sigma", SensitivityScaleType.Arithmetic,
            SensitivityVariationType.Percentage, 5, null, null, 10, "1.900, 1.922, 1.944, ..., 2.100");
    });
});
