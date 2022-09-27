import {
    expect, test, chromium, Page
} from "@playwright/test";
import * as os from "os";
import {
    writeCode,
    newFitCode,
    realisticFitData,
    startModelFit,
    waitForModelFitCompletion
} from "./utils";
import PlaywrightConfig from "../../playwright.config";

const appUrl = "/apps/day2";
const saveSessionTimeout = 3000;

test.describe("Sessions tests", () => {
    const { timeout } = PlaywrightConfig;

    test("can navigate to Sessions page from navbar, and load a session", async () => {
        // We need to use a browser with persistent context instead of the default incognito browser so that
        // we can use the session ids in local storage
        const userDataDir = os.tmpdir();
        const browser = await chromium.launchPersistentContext(userDataDir);
        const page = await browser.newPage();

        await page.goto(appUrl);

        // change code in this session, which we will later reload and check that we can see the code changes
        console.log("2")
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await writeCode(page, newFitCode);
        console.log("3")
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );

        // compile and re-run
        await page.click("#compile-btn");
        console.log("3.1")
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: model code has been recompiled. Run model to update.", {
                timeout
            }
        );
        console.log("3.2")
        await page.click("#run-btn");
        console.log("3.3")
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("", { timeout });
        console.log("3.4")

        // Upload data, link, select variables to vary and run fit
        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        console.log("3.5")
        await startModelFit(page, realisticFitData);
        console.log("3.6")
        await waitForModelFitCompletion(page);
        console.log("3.7")

        // Run sensitivity
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)");
        page.click("#run-sens-btn");

        // TODO: replace this with hidden element check
        const linesSelector = `.wodin-right .wodin-content .js-plotly-plot .scatterlayer .trace .lines path`;
        expect((await page.locator(`:nth-match(${linesSelector}, 30)`).getAttribute("d"))!.startsWith("M36")).toBe(true);

        // give the page a chance to save the session to back end
        await page.waitForTimeout(saveSessionTimeout);

        // Reload the page to get fresh session, and give it time to save new session Id
        await page.goto(appUrl);
        console.log("4")

        // Get storage state in order to test that something has been written to it - but reading it here also seems
        // to force Playwright to wait long enough for storage values to be available in the next page, so the session
        // ids can be read by the Sessions page - this is required by CI but not locally
        const storageState = await browser.storageState();
        expect(storageState.origins.length).toBe(1); // check there's something in storage state

        await page.click("#sessions-menu");
        await page.click("#all-sessions-link");

        console.log("5")
        await expect(await page.innerText(".container h2")).toBe("Sessions");
        await expect(await page.innerText(":nth-match(.session-col-header, 1)")).toBe("Saved");
        await expect(await page.innerText(":nth-match(.session-col-header, 2)")).toBe("Label");
        await expect(await page.innerText(":nth-match(.session-col-header, 3)")).toBe("Load");

        await expect(await page.innerText(".session-label")).toBe("--no label--");


        console.log("6")

        // NB this will load the second load link, i.e. the older session, not the current one
        await page.click(":nth-match(.session-load a, 2)");

        console.log("7")

        // Check data
        await page.waitForTimeout(saveSessionTimeout);
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Data");
        await expect(await page.innerText("#data-upload-success")).toBe(" Uploaded 32 rows and 2 columns");

        console.log("8")

        // Check code
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Code");
        const editorSelector = ".wodin-left .wodin-content .editor-container .editor-scrollable";
        // wait until there is some text in the code editor
        await page.waitForFunction((selector) => !!document.querySelector(selector)?.textContent, editorSelector);
        // Check edited code
        await expect(await page.innerText(editorSelector)).toContain("# JUST CHANGE A COMMENT");

        // Check options
        console.log("9")

        // Check that run, fit and sensitivity have been run

        await browser.close();
    });
});
