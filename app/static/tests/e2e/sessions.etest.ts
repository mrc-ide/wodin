import {
    expect, test, chromium, Page
} from "@playwright/test";
import * as os from "os";
import {
    writeCode,
    newFitCode,
    realisticFitData,
    startModelFit,
    waitForModelFitCompletion, expectWodinPlotDataSummary
} from "./utils";
import PlaywrightConfig from "../../playwright.config";

const appUrl = "/apps/day2";
const saveSessionTimeout = 3000;

const enterSessionLabel = async (page: Page, dialogId: string, newLabel: string) => {
    await expect(await page.locator(`#${dialogId} #edit-session-label label`)).toBeVisible();
    await page.fill(`#${dialogId} #edit-session-label input`, newLabel);
    await page.click(`#${dialogId} #ok-session-label`);
};

test.describe("Sessions tests", () => {
    const { timeout } = PlaywrightConfig;

    test("can use Sessions page", async () => {
        console.log("0")
        // We need to use a browser with persistent context instead of the default incognito browser so that
        // we can use the session ids in local storage
        const userDataDir = os.tmpdir();
        const browser = await chromium.launchPersistentContext(userDataDir);
        const page = await browser.newPage();

        await page.goto(appUrl);

        // change code in this session, which we will later reload and check that we can see the code changes
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await writeCode(page, newFitCode);
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.", {
                timeout
            }
        );

        // compile and re-run
        await page.click("#compile-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: model code has been recompiled. Run model to update.", {
                timeout
            }
        );
        await page.click("#run-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText("", { timeout });

        // Upload data, link, select variables to vary and run fit
        await page.click(":nth-match(.wodin-left .nav-tabs a, 1)");
        await startModelFit(page, realisticFitData);
        await waitForModelFitCompletion(page);

        // Run sensitivity
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)");
        page.click("#run-sens-btn");
        const hidden = await page.locator(".wodin-plot-data-summary").getAttribute("hidden");
        expect(hidden).not.toBe(null);
        // 5 * 10 sensitivity traces, 5 central traces, 1 data plot
        expect(await page.locator(".wodin-plot-data-summary-series").count()).toBe(56);

        // give the page a chance to save the session to back end
        await page.waitForTimeout(saveSessionTimeout);

        // Reload the page to get fresh session, and give it time to save new session Id
        await page.goto(appUrl);
        await page.waitForTimeout(saveSessionTimeout);

        // Get storage state in order to test that something has been written to it
        const storageState = await browser.storageState();
        expect(storageState.origins.length).toBe(1); // check there's something in storage state

        await page.click("#sessions-menu");
        await page.click("#all-sessions-link");

        await expect(await page.innerText(".container h2")).toBe("Sessions");
        await expect(await page.innerText(":nth-match(.session-col-header, 1)")).toBe("Saved");
        await expect(await page.innerText(":nth-match(.session-col-header, 2)")).toBe("Label");
        await expect(await page.innerText(":nth-match(.session-col-header, 3)")).toBe("Edit Label");
        await expect(await page.innerText(":nth-match(.session-col-header, 4)")).toBe("Load");
        await expect(await page.innerText(":nth-match(.session-col-header, 5)")).toBe("Delete");
        await expect(await page.innerText(":nth-match(.session-col-header, 6)")).toBe("Shareable Link");

        await expect(await page.innerText(".session-label")).toBe("--no label--");

        // Can copy code and link for a session
        await page.click(":nth-match(.session-copy-code, 2)");
        await expect(await page.innerText(":nth-match(.session-copy-confirm, 2)"))
            .toContain("Copied: ");
        const copiedCodeText = await page.evaluate("navigator.clipboard.readText()");
        expect(copiedCodeText).toContain("-");

        await page.click(":nth-match(.session-copy-link, 2)");
        await expect(await page.innerText(":nth-match(.session-copy-confirm, 2)"))
            .toContain("Copied: http://localhost:3000/apps/day2/?share=");
        const copiedLinkText = await page.evaluate("navigator.clipboard.readText()") as string;
        expect(copiedLinkText).toContain("http://localhost:3000/apps/day2/?share=");

        // Set the current session label from the nav menu and check it updates on menu title and in the sessions list
        await page.click("#sessions-menu");
        await page.click("#edit-current-session-label");
        await enterSessionLabel(page, "header-edit-session-label", "current session label");
        await expect(await page.locator(":nth-match(.session-label, 1)")).toHaveText(
            "current session label", { timeout }
        );
        await expect(await page.innerText("#sessions-menu")).toBe("Session: current session label");

        // Set the current session label on a previous session
        await page.click(":nth-match(.session-edit-label i, 2)");
        await enterSessionLabel(page, "page-edit-session-label", "previous session label");
        await expect(await page.locator(":nth-match(.session-label, 2)")).toHaveText(
            "previous session label", { timeout }
        );

        // NB this will load the second load link, i.e. the older session, not the current one
        await page.click(":nth-match(.session-load a, 3)"); // 3rd because there are two of these on the current

        // Check all session values have been rehydrated:

        // Check data
        await page.waitForTimeout(saveSessionTimeout);
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Data");
        await expect(await page.innerText("#data-upload-success")).toBe(" Uploaded 32 rows and 2 columns");

        // Check code
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Code");
        const editorSelector = ".wodin-left .wodin-content .editor-container .editor-scrollable";
        // wait until there is some text in the code editor
        await page.waitForFunction((selector) => !!document.querySelector(selector)?.textContent, editorSelector);
        await expect(await page.innerText(editorSelector)).toContain("# JUST CHANGE A COMMENT");

        // Check options
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)"); // Options tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)"); // Fit tab
        await expect(await page.inputValue("#link-data select")).toBe("I");
        expect((await page.inputValue(":nth-match(#model-params .row .parameter-input, 1)")).startsWith("0.4925"))
            .toBe(true);
        await expect(await page.inputValue(":nth-match(#model-params .row .parameter-input, 2)")).toBe("1");
        await expect(await page.inputValue(":nth-match(#model-params .row .parameter-input, 3)")).toBe("1.5");
        await expect(await page.isChecked(":nth-match(#model-params .row .form-check-input, 1)")).toBeTruthy();
        await expect(await page.isChecked(":nth-match(#model-params .row .form-check-input, 2)")).toBeFalsy();
        await expect(await page.isChecked(":nth-match(#model-params .row .form-check-input, 3)")).toBeFalsy();

        // Check run plot
        await page.click(":nth-match(.wodin-right .nav-tabs a, 1)"); // Run tab
        expect(await page.locator(".wodin-plot-data-summary-series").count()).toBe(6);
        const summary1 = await page.locator(":nth-match(.wodin-plot-data-summary-series, 1)");
        await expectWodinPlotDataSummary(summary1, "S", 1000, 0, 31, 154.64, 369, "lines", "#2e5cb8", null);
        const summary2 = await page.locator(":nth-match(.wodin-plot-data-summary-series, 2)");
        await expectWodinPlotDataSummary(summary2, "E", 1000, 0, 31, 0, 16.12, "lines", "#39ac73", null);
        const summary3 = await page.locator(":nth-match(.wodin-plot-data-summary-series, 3)");
        await expectWodinPlotDataSummary(summary3, "I", 1000, 0, 31, 0.3, 7.9, "lines", "#cccc00", null);
        const summary4 = await page.locator(":nth-match(.wodin-plot-data-summary-series, 4)");
        await expectWodinPlotDataSummary(summary4, "R", 1000, 0, 31, 0, 214.52, "lines", "#ff884d", null);
        const summary5 = await page.locator(":nth-match(.wodin-plot-data-summary-series, 5)");
        await expectWodinPlotDataSummary(summary5, "onset", 1000, 0, 31, 0.09, 16.12, "lines", "#cc0044", null);
        const summary6 = await page.locator(":nth-match(.wodin-plot-data-summary-series, 6)");
        await expectWodinPlotDataSummary(summary6, "Cases", 32, 0, 31, 0, 13, "markers", null, "#cccc00");

        // Check fit plot
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)"); // Fit tab
        expect(await page.locator(".wodin-plot-data-summary-series").count()).toBe(2);
        const fitSummary1 = await page.locator(":nth-match(.wodin-plot-data-summary-series, 1)");
        await expectWodinPlotDataSummary(fitSummary1, "I", 1000, 0, 31, 0.3, 7.9, "lines", "#cccc00", null);
        const fitSummary2 = await page.locator(":nth-match(.wodin-plot-data-summary-series, 2)");
        await expectWodinPlotDataSummary(fitSummary2, "Cases", 32, 0, 31, 0, 13, "markers", null, "#cccc00");

        // Check sensitivity plot - but not every trace!
        await page.click(":nth-match(.wodin-right .nav-tabs a, 3)"); // Sensitivity tab
        expect(await page.locator(".wodin-plot-data-summary-series").count()).toBe(56);
        const sensitivitySummary = await page.locator(":nth-match(.wodin-plot-data-summary-series, 1)");
        await expectWodinPlotDataSummary(sensitivitySummary, "S (D=0.443)", 1000, 0, 31, 154.28, 369, "lines",
            "#2e5cb8", null);
        const centralSummary = await page.locator(":nth-match(.wodin-plot-data-summary-series, 51)");
        await expectWodinPlotDataSummary(centralSummary, "S", 1000, 0, 31, 154.64, 369, "lines", "#2e5cb8", null);
        const sensitivityDataSummary = await page.locator(":nth-match(.wodin-plot-data-summary-series, 56)");
        await expectWodinPlotDataSummary(sensitivityDataSummary, "Cases", 32, 0, 31, 0, 13, "markers", null, "#cccc00");

        // Expect to be able to navigate to the share link we copied earlier - check it has some rehydrated data
        await page.goto(copiedLinkText);
        await expect(await page.innerText("#data-upload-success")).toBe(" Uploaded 32 rows and 2 columns");

        // can delete session
        console.log("1")
        await page.goto(`${appUrl}/sessions`);
        console.log("2")
        await expect(await page.locator("#app .container .row").count()).toBeGreaterThan(2);
        console.log("3")
        const row = await page.locator(":nth-match(#app .container .row, 3)");
        console.log("4")
        await row.locator(".session-edit-label i").click();
        console.log("5")
        await enterSessionLabel(page, "page-edit-session-label", "delete me");
        console.log("6")
        await expect(await row.locator(".session-label")).toHaveText(
            "delete me", { timeout }
        );
        console.log("7")
        await row.locator(".session-delete i").click();
        console.log("8")
        await expect(await page.locator("#confirm-yes")).toBeVisible();
        console.log("9")
        await page.click("#confirm-yes");
        console.log("10")
        await expect(await page.locator("#app")).not.toHaveText("delete me");
        console.log("11")

        await browser.close();
        console.log("12")
    });
});
