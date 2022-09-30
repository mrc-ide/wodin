import {
    expect, test, chromium, Page
} from "@playwright/test";
import * as os from "os";
import { writeCode } from "./utils";

const appUrl = "/apps/day1";
const saveSessionTimeout = 3000;

const enterSessionLabel = async (page: Page, dialogId: string, newLabel: string) => {
    await expect(await page.locator(`#${dialogId} #edit-session-label label`)).toBeVisible();
    await page.fill(`#${dialogId} #edit-session-label input`, newLabel);
    await page.click(`#${dialogId} #ok-session-label`);
};

test.describe("Sessions tests", () => {
    test("can navigate to Sessions page from navbar, and load a session", async () => {
        // We need to use a browser with persistent context instead of the default incognito browser so that
        // we can use the session ids in local storage
        const userDataDir = os.tmpdir();
        const browser = await chromium.launchPersistentContext(userDataDir);
        const page = await browser.newPage();

        await page.goto(appUrl);
        // change code in this session, which we will later reload and check that we can see the code changes
        await writeCode(page, "## NEW CODE FOR LOADED SESSION");
        // give the page a chance to save the session to back end
        await page.waitForTimeout(saveSessionTimeout);

        // Reload the page to get fresh session, and give it time to save new session Id
        await page.goto(appUrl);
        await page.waitForTimeout(saveSessionTimeout);

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
        await expect(await page.innerText(":nth-match(.session-col-header, 3)")).toBe("Edit Label");
        await expect(await page.innerText(":nth-match(.session-col-header, 4)")).toBe("Load");

        await expect(await page.innerText(".session-label")).toBe("--no label--");

        // Set the current session label from the nav menu and check it updates on menu title and in the sessions list
        await page.click("#sessions-menu")
        await page.click("#edit-current-session-label");
        await enterSessionLabel(page, "header-edit-session-label", "current session label");
        await expect(await page.innerText(":nth-match(.session-label, 1)")).toBe("current session label");
        await expect(await page.innerText("#sessions-menu")).toBe("Session: current session label");

        // Set the current session label on a previous session
        await page.click(":nth-match(.session-edit-label i, 2)");
        await enterSessionLabel(page, "page-edit-session-label", "previous session label");
        await expect(await page.innerText(":nth-match(.session-label, 2)")).toBe("previous session label");

        // NB this will load the second load link, i.e. the older one
        // If we loaded the most recent (i.e. current session), it would do just do a vue router navigate, not a
        // reload+rehydrate, so we would not see the placeholder code
        await page.click(":nth-match(.session-load a, 2)");

        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Code");
        const editorSelector = ".wodin-left .wodin-content .editor-container .editor-scrollable";
        // wait until there is some text in the code editor
        await page.waitForFunction((selector) => !!document.querySelector(selector)?.textContent, editorSelector);

        // Check edited code
        await expect(await page.innerText(editorSelector)).toBe("## NEW CODE FOR LOADED SESSION");

        await browser.close();
    });
});
