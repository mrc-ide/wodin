import { expect, test, chromium } from "@playwright/test";
import * as os from "os";

/* eslint-disable no-irregular-whitespace */
const placeholderCode = `# Code for rehydration!
initial(S) <- N - I_0`;

test.describe("Sessions tests", () => {
    test("can navigate to Sessions page from navbar, and load a session", async () => {
        // We need to use a browser with persistent context instead of the default incognito browser so that
        // we can use the session ids in local storage
        const userDataDir = os.tmpdir();
        const browser = await chromium.launchPersistentContext(userDataDir);
        const page = await browser.newPage();
        await page.goto("/apps/day1");

        // We need a short wait here to give the browser a chance to save a session id.
        await page.waitForTimeout(1000);

        // Get storage state in order to test that something has been written to it - but reading it here also seems
        // to force Playwright to wait long enough for storage values to be available in the next page, so the session
        // ids can be read by the Sessions page - this is required by CI but not locally
        const storageState = await browser.storageState();
        expect(storageState.origins.length).toBe(1); // check there's something in storage state

        await page.click("#sessions-menu");
        await page.click("#all-sessions-link");

        await expect(await page.innerText(".container h2")).toBe("Sessions");
        await expect(await page.innerText(":nth-match(.session-col-header, 1)")).toBe("Saved");
        await expect(await page.innerText(":nth-match(.session-col-header, 2)")).toBe("Label");
        await expect(await page.innerText(":nth-match(.session-col-header, 3)")).toBe("Load");

        await expect(await page.innerText(".session-label")).toBe("--no label--");

        await page.click(".session-load a");

        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Code");
        const editorSelector = ".wodin-left .wodin-content .editor-container .editor-scrollable";
        // wait until there is some text in the code editor
        await page.waitForFunction((selector) => !!document.querySelector(selector)?.textContent, editorSelector);

        // Check placeholder code
        expect(await page.innerText(editorSelector)).toBe(placeholderCode);

        await browser.close();
    });
});
