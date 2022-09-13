import { expect, test, chromium } from "@playwright/test";
import * as os from 'os';

const placeholderCode = `# Code for rehydration!
initial(S) <- N - I_0`;

test.describe("Sessions tests", () => {
    test("can navigate to Sessions page from navbar, and load a session", async ({}) => {
        // We need to use a browser with persistent context instead of the default incognito browser so that
        // we can use the session ids in local storage
        const userDataDir = os.tmpdir();
        const browser = await chromium.launchPersistentContext(userDataDir);
        //const browser = await chromium.launch({s})
        //await use(browser);

        const page = await browser.newPage();
        await page.goto("/apps/day1");
        //await page.waitForURL("/apps/day1");
        await page.waitForTimeout(1000);  //This got the test past the point of loading the session!

        await page.click("#sessions-menu");
        await page.click("#all-sessions-link");

        await expect(await page.innerText(".container h2")).toBe("Sessions");
        await expect(await page.innerText(":nth-match(.session-col-header, 1)")).toBe("Saved");
        await expect(await page.innerText(":nth-match(.session-col-header, 2)")).toBe("Label");
        await expect(await page.innerText(":nth-match(.session-col-header, 3)")).toBe("Load");

        await expect(await page.innerText(".session-label")).toBe("--no label--");

        await page.click(".session-load a");

        // Check placeholder code
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Code");
        expect(await page.innerText(".wodin-left .wodin-content .editor-container")).toBe(placeholderCode);

        await browser.close();
    });
});
