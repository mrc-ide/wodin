import {expect, test} from "@playwright/test";

test.describe("Index tests", () => {

    test("renders heading",async ({page}) => {
        await page.goto("/");
        expect(await page.innerText("h1")).toBe("Example WODIN configuration");
    });

    test("day1 link goes to Basic app", async ({page}) => {
        await page.goto("/");
        await page.click("a[href='apps/day1']");

        expect(await page.innerText("h1")).toBe("Day 1 - Basic Model");
        expect(await page.innerText("#app-type")).toBe("App Type: basic");
        expect(await page.innerText("#basic-prop")).toBe("Basic Prop: day1 basic value");
    });

    test("day2 link goes to Fit app", async ({page}) => {
        await page.goto("/");
        await page.click("a[href='apps/day2']");

        expect(await page.innerText("h1")).toBe("Day 2 - Model Fit");
        expect(await page.innerText("#app-type")).toBe("App Type: fit");
        expect(await page.innerText("#fit-prop")).toBe("Fit Prop: day2 fit value");
    });

    test("day3 link goes to Stochastic app", async ({page}) => {
        await page.goto("/");
        await page.click("a[href='apps/day3']");

        expect(await page.innerText("h1")).toBe("Day 3 - Stochastic Model");
        expect(await page.innerText("#app-type")).toBe("App Type: stochastic");
        expect(await page.innerText("#stochastic-prop")).toBe("Stochastic Prop: day3 stochastic value");
    });

    //TODO: test can download sample files
});
