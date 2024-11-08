import { expect, test, chromium, Page } from "@playwright/test";
import * as os from "os";
import * as fs from "fs";
import {
    writeCode,
    newFitCode,
    realisticFitData,
    startModelFit,
    waitForModelFitCompletion,
    expectWodinPlotDataSummary,
    expectCanRunMultiSensitivity,
    saveSessionTimeout
} from "./utils";
import PlaywrightConfig from "../../playwright.config";

const appUrl = "/apps/day2";

const enterSessionLabel = async (page: Page, dialogId: string, newLabel: string) => {
    await expect(await page.locator(`#${dialogId} #edit-session-label label`)).toBeVisible();
    await page.fill(`#${dialogId} #edit-session-label input`, newLabel);
    await page.click(`#${dialogId} #ok-session-label`);
};

const loadAppPage = async (page: Page) => {
    // Reload the page to get fresh session, and give it time to save new session Id
    await page.goto(appUrl);
    await page.waitForTimeout(saveSessionTimeout);
};

const newSessionFromAppPage = async (page: Page) => {
    await loadAppPage(page);
    if (await page.isVisible("#new-session")) {
        await page.click("#new-session");
    }
};

const expectNewFitCode = async (page: Page) => {
    const editorSelector = ".wodin-left .wodin-content .editor-container .editor-scrollable";
    // wait until there is some text in the code editor
    await page.waitForFunction((selector) => !!document.querySelector(selector)?.textContent, editorSelector);
    await expect(await page.innerText(editorSelector)).toContain("# JUST CHANGE A COMMENT");
};

const expectReloadedSession = async (page: Page) => {
    await page.click(":nth-match(.wodin-left .nav-tabs a, 2)"); // select code tab
    await expectNewFitCode(page);
    await expect(await page.locator("#sessions-menu")).toHaveText("Session: session to reload");
};

test.describe("Sessions tests", () => {
    const { timeout } = PlaywrightConfig;

    const usePersistentContext = async () => {
        // We need to use a browser with persistent context instead of the default incognito browser so that
        // we can use the session ids in local storage
        const userDataDir = fs.mkdtempSync(`${os.tmpdir()}/`);
        return chromium.launchPersistentContext(userDataDir);
    };

    test.use({
        permissions: ["clipboard-read", "clipboard-write"]
    })

    test("can use Sessions page", async () => {
        const browser = await usePersistentContext();
        const page = await browser.newPage();
        await page.goto(appUrl);

        // change code in this session, which we will later reload and check that we can see the code changes
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await writeCode(page, newFitCode);
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Model code has been updated. Compile code and Run Model to update.",
            {
                timeout
            }
        );

        // compile and re-run
        await page.click("#compile-btn");
        await expect(await page.locator(".run-tab .action-required-msg")).toHaveText(
            "Plot is out of date: model code has been recompiled. Run model to update.",
            {
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

        // Run multi-sensitivity
        await page.click(":nth-match(.wodin-right .nav-tabs a, 4)");
        expectCanRunMultiSensitivity(page, timeout);

        // give the page a chance to save the session to back end
        await page.waitForTimeout(saveSessionTimeout);

        // Reload the page to get fresh session, and give it time to save new session Id
        await newSessionFromAppPage(page);

        // Get storage state in order to test that something has been written to it
        const storageState = await browser.storageState();
        expect(storageState.origins.length).toBe(1); // check there's something in storage state

        await page.click("#sessions-menu");
        await page.click("#all-sessions-link");

        await expect(await page.innerText(".container h2")).toBe("Sessions");
        await expect(await page.innerText(":nth-match(#current-session p, 1)")).toBe(
            "Return to the current session or make a copy of the current session."
        );
        await expect(await page.innerText(":nth-match(.session-col-header, 1)")).toBe("Saved");
        await expect(await page.innerText(":nth-match(.session-col-header, 2)")).toBe("Label");
        await expect(await page.innerText(":nth-match(.session-col-header, 3)")).toBe("Edit Label");
        await expect(await page.innerText(":nth-match(.session-col-header, 4)")).toBe("Load");
        await expect(await page.innerText(":nth-match(.session-col-header, 5)")).toBe("Delete");
        await expect(await page.innerText(":nth-match(.session-col-header, 6)")).toBe("Shareable Link");

        const noLabel = "--no label--";
        await expect(await page.locator(".session-label")).toHaveText(noLabel);

        // Can copy code and link for a session
        await page.click(":nth-match(.session-copy-code, 2)");
        await expect(await page.innerText(":nth-match(.session-copy-confirm, 2)")).toContain("Copied: ");
        const copiedCodeText = await page.evaluate("navigator.clipboard.readText()");
        expect(copiedCodeText).toContain("-");

        await page.click(":nth-match(.session-copy-link, 2)");
        await expect(await page.innerText(":nth-match(.session-copy-confirm, 2)")).toContain(
            "Copied: http://localhost:3000/apps/day2/?share="
        );
        const copiedLinkText = (await page.evaluate("navigator.clipboard.readText()")) as string;
        expect(copiedLinkText).toContain("http://localhost:3000/apps/day2/?share=");

        // Set the current session label from the nav menu and check it updates on menu title
        await page.click("#sessions-menu");
        await page.click("#edit-current-session-label");
        await enterSessionLabel(page, "header-edit-session-label", "current session label");
        await expect(await page.innerText("#sessions-menu")).toBe("Session: current session label");

        // Toggle 'Show unlabelled sessions' - all historic sessions should be filtered out
        const unlabelledCount = await page.locator(".previous-session-row").count();
        await expect(unlabelledCount).toBeGreaterThan(0);
        await page.click("input#show-unlabelled-check");
        await expect(await page.locator(".previous-session-row")).toHaveCount(0);
        await page.click("input#show-unlabelled-check");
        await expect(await page.locator(".previous-session-row")).toHaveCount(unlabelledCount);

        // We now have a current session with a label, and we are not filtering unlabelled sessions.
        // We'll test filtering out duplicate sessions, by adding three new sessions - only the latest of these should
        // be displayed above the previous labelled sessions initially...
        await newSessionFromAppPage(page);
        await newSessionFromAppPage(page);
        await newSessionFromAppPage(page);

        await page.goto(`${appUrl}/sessions`);
        await expect(await page.isChecked("#show-duplicates-check")).toBe(false);
        await expect(await page.innerText(":nth-match(.session-label, 1)")).toBe(noLabel);
        await expect(await page.innerText(":nth-match(.session-label, 2)")).toBe("current session label");

        // ... then after checking "Show duplicate sessions", all new sessions should be displayed...
        await page.check("#show-duplicates-check");
        await expect(await page.locator(":nth-match(.session-label, 1)")).toHaveText(noLabel, { timeout });
        await expect(await page.locator(":nth-match(.session-label, 2)")).toHaveText(noLabel, { timeout });
        await expect(await page.locator(":nth-match(.session-label, 3)")).toHaveText(noLabel, { timeout });
        await expect(await page.locator(":nth-match(.session-label, 4)")).toHaveText("current session label", {
            timeout
        });

        // ...then unchecking should filter out the earlier unlabelled duplicates again
        await page.uncheck("#show-duplicates-check");
        await expect(await page.locator(":nth-match(.session-label, 1)")).toHaveText(noLabel, { timeout });
        await expect(await page.locator(":nth-match(.session-label, 2)")).toHaveText("current session label", {
            timeout
        });

        // Adding a label to the earliest duplicate session means it should be displayed when we uncheck
        // "Show duplicates"
        await page.check("#show-duplicates-check");
        // wait for second no label to appear
        await expect(await page.locator(":nth-match(.session-label, 3)")).toHaveText(noLabel, { timeout });
        await page.click(":nth-match(.session-edit-label i, 3)");
        await enterSessionLabel(page, "page-edit-session-label", "earlier duplicate");
        await expect(await page.locator(":nth-match(.session-label, 3)")).toHaveText("earlier duplicate", { timeout });

        await page.uncheck("#show-duplicates-check");
        // the newly labelled duplicate should still be visible after unchecking, as should the latest (unlabelled) one,
        // but the middle duplicate should be removed
        await expect(await page.locator(":nth-match(.session-label, 1)")).toHaveText(noLabel, { timeout });
        await expect(await page.locator(":nth-match(.session-label, 2)")).toHaveText("earlier duplicate", { timeout });
        await expect(await page.locator(":nth-match(.session-label, 3)")).toHaveText("current session label", {
            timeout
        });

        // Load previously run session
        await page.click(":nth-match(.session-load a, 4)");

        // Check all session values have been rehydrated:
        // Check data
        await page.waitForTimeout(saveSessionTimeout);
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Data");
        await expect(await page.innerText("#data-upload-success")).toBe(" Uploaded 32 rows and 2 columns");

        // Check code
        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)");
        await expect(await page.innerText(".wodin-left .nav-tabs .active")).toBe("Code");
        await expectNewFitCode(page);

        // Check options
        await page.click(":nth-match(.wodin-left .nav-tabs a, 3)"); // Options tab
        await page.click(":nth-match(.wodin-right .nav-tabs a, 2)"); // Fit tab
        await expect(await page.inputValue("#link-data select")).toBe("I");
        expect((await page.inputValue(":nth-match(#model-params .row .parameter-input, 1)")).startsWith("0.4925")).toBe(
            true
        );
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
        await expectWodinPlotDataSummary(
            sensitivitySummary,
            "S (D=0.443)",
            1000,
            0,
            31,
            154.28,
            369,
            "lines",
            "#2e5cb8",
            null
        );
        const centralSummary = await page.locator(":nth-match(.wodin-plot-data-summary-series, 51)");
        await expectWodinPlotDataSummary(centralSummary, "S", 1000, 0, 31, 154.64, 369, "lines", "#2e5cb8", null);
        const sensitivityDataSummary = await page.locator(":nth-match(.wodin-plot-data-summary-series, 56)");
        await expectWodinPlotDataSummary(sensitivityDataSummary, "Cases", 32, 0, 31, 0, 13, "markers", null, "#cccc00");

        // Check multi-sensitivity result
        await page.click(":nth-match(.wodin-right .nav-tabs a, 4)"); // Multi-sensitivity tab
        await expect(await page.locator(".multi-sensitivity-status")).toHaveText(
            "Multi-sensitivity run produced 100 solutions.",
            { timeout }
        );
        await expect(await page.locator("#download-summary-btn")).toBeEnabled();
        await expect(await page.locator("#run-multi-sens-btn")).toBeEnabled();

        // Expect to be able to navigate to the share link we copied earlier - check it has some rehydrated data
        await page.goto(copiedLinkText);
        await expect(await page.innerText("#data-upload-success")).toBe(" Uploaded 32 rows and 2 columns");

        // can delete session
        await page.goto(`${appUrl}/sessions`);
        await expect(await page.locator("#app .container .row").count()).toBeGreaterThan(3);
        await page.locator(":nth-match(#app .container .row, 4) .session-edit-label i").click();
        await enterSessionLabel(page, "page-edit-session-label", "delete me");

        await expect(await page.locator(".row:has-text('delete me')")).toBeVisible({ timeout });
        await page.locator(".row:has-text('delete me') .session-delete i").click();
        await expect(await page.locator("#confirm-yes")).toBeVisible();
        await page.click("#confirm-yes");
        await expect(await page.locator("#app")).not.toContainText("delete me");

        await browser.close();
    });

    test("can load session from code", async ({ page }) => {
        await page.goto("/apps/day1/sessions");
        await page.fill("#session-code-input", "good-dog");
        await page.click("#load-session-from-code");
        await expect(await page.url()).toBe("http://localhost:3000/apps/day1/?share=good-dog");
    });

    test("session initialise modal behaves as expected", async () => {
        const browser = await usePersistentContext();
        const page = await browser.newPage();
        await loadAppPage(page);

        // We don't see the modal on load first session...
        await expect(await page.locator("#session-initialise-modal .modal")).not.toBeVisible({ timeout });

        // ..but we should on the second
        await loadAppPage(page);
        await expect(await page.locator("#session-initialise-modal .modal")).toBeVisible({ timeout });

        // select new session and make some changes, including set label
        await page.click("#new-session");
        await expect(await page.locator("#session-initialise-modal .modal")).not.toBeVisible({ timeout });

        await page.click(":nth-match(.wodin-left .nav-tabs a, 2)"); // select code tab
        await writeCode(page, newFitCode);
        await page.click("#sessions-menu");
        await page.click("#edit-current-session-label");
        await enterSessionLabel(page, "header-edit-session-label", "session to reload");
        await page.waitForTimeout(saveSessionTimeout);

        // refresh page and select reload latest - should see the changes and new label
        await loadAppPage(page);
        await expect(await page.locator("#session-initialise-modal .modal")).toBeVisible({ timeout });
        await page.click("#reload-session");
        await expectReloadedSession(page);

        // navigate to sessions page - should also be able to reload from there
        await page.goto(`${appUrl}/sessions`);
        await page.waitForTimeout(saveSessionTimeout);
        await page.click("#reload-session");
        await expectReloadedSession(page);

        await browser.close();
    });
});
