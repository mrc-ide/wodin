import { expect, Page, Locator } from "@playwright/test";

export const saveSessionTimeout = 3000;

export const newFitCode = `# JUST CHANGE A COMMENT
initial(S) <- N - I_0
initial(E) <- 0
initial(I) <- I_0
initial(R) <- 0

# equations
deriv(S) <- -beta * S * I / N
deriv(E) <- beta * S * I / N - gamma * E
deriv(I) <- gamma * E - sigma * I
deriv(R) <- sigma * I

# parameter values
R_0 <- user(1.5)
L <- user(1)
D <- user(1)
I_0 <- 1 # default value
N <- 370

# convert parameters
gamma <- 1 / L
sigma <- 1 / D
beta <- R_0 * sigma

#Output
output(onset) <- if(t == 0) I_0 else gamma*E
`;

export const realisticFitData = `Day,Cases
0,1
1,1
2,0
3,2
4,5
5,3
6,3
7,3
8,6
9,2
10,5
11,9
12,13
13,12
14,13
15,11
16,12
17,6
18,6
19,6
20,3
21,1
22,0
23,2
24,0
25,0
26,0
27,0
28,2
29,0
30,2
31,0
`;

export const uploadCSVData = async (page: Page, data: string) => {
    const file = {
        name: "file.csv",
        mimeType: "text/plain",
        buffer: Buffer.from(data)
    };
    await page.setInputFiles("#fitDataUpload", file);
};

export const writeCode = async (page: Page, code: string) => {
    await page.press(".monaco-editor textarea", "Control+A");
    await page.press(".monaco-editor textarea", "Delete");
    await page.fill(".monaco-editor textarea", "");
    await page.fill(".monaco-editor textarea", code);
};

export const startModelFit = async (page: Page, data: string = realisticFitData) => {
    // Upload data
    await uploadCSVData(page, data);
    await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");

    // link variables
    await page.click(":nth-match(.wodin-left .nav-tabs a, 3)");
    await expect(await page.innerText("#optimisation")).toBe(
        "Please link at least one column in order to set target to fit."
    );
    const linkContainer = await page.locator(":nth-match(.collapse .container, 1)");
    const select1 = await linkContainer.locator(":nth-match(select, 1)");
    await select1.selectOption("I");

    await expect(await page.innerText("#optimisation label#target-fit-label")).toBe("Cases ~ I");

    // select param to vary
    await page.click(":nth-match(.wodin-right .nav-tabs a, 2)");
    await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Fit");
    await expect(await page.innerText("#select-param-msg")).toBe(
        "Please select at least one parameter to vary during model fit."
    );
    await page.click(":nth-match(input.vary-param-check, 1)");
    await expect(await page.innerText("#select-param-msg")).toBe("");

    // run fit
    await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Fit");
    await page.click(".wodin-right .wodin-content div.mt-4 button#fit-btn");
};

export const waitForModelFitCompletion = async (page: Page) => {
    await expect(await page.getAttribute(".wodin-plot-container .vue-feather", "data-type")).toBe("check");
};

export const expectWodinPlotDataSummary = async (
    summaryLocator: Locator,
    name: string,
    count: number,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    mode: string,
    lineColor: string | null,
    markerColor: string | null
) => {
    expect(await summaryLocator.getAttribute("name")).toBe(name);
    expect(await summaryLocator.getAttribute("count")).toBe(count.toString());
    const attrXMin = (await summaryLocator.getAttribute("x-min")) as string;
    expect(parseFloat(attrXMin)).toBeCloseTo(xMin);
    const attrXMax = (await summaryLocator.getAttribute("x-max")) as string;
    expect(parseFloat(attrXMax)).toBeCloseTo(xMax);
    const attrYMin = (await summaryLocator.getAttribute("y-min")) as string;
    expect(parseFloat(attrYMin)).toBeCloseTo(yMin);
    const attrYMax = (await summaryLocator.getAttribute("y-max")) as string;
    expect(parseFloat(attrYMax)).toBeCloseTo(yMax);
    expect(await summaryLocator.getAttribute("mode")).toBe(mode);
    expect(await summaryLocator.getAttribute("line-color")).toBe(lineColor);
    expect(await summaryLocator.getAttribute("marker-color")).toBe(markerColor);
};

export const expectSummaryValues = async (
    page: Page,
    idx: number,
    name: string,
    count: number,
    color: string,
    dash: string | null = null,
    xMin = "0",
    xMax = "100",
    yMin: string | null = null,
    yMax: string | null = null
) => {
    const summary = ".wodin-plot-data-summary-series";
    const locator = `:nth-match(${summary}, ${idx})`;
    expect(await page.getAttribute(locator, "name")).toBe(name);
    expect(await page.getAttribute(locator, "count")).toBe(count.toString());
    expect(await page.getAttribute(locator, "x-min")).toBe(xMin);
    expect(await page.getAttribute(locator, "x-max")).toBe(xMax);
    expect(await page.getAttribute(locator, "mode")).toBe("lines");
    expect(await page.getAttribute(locator, "line-color")).toBe(color);
    expect(await page.getAttribute(locator, "line-dash")).toBe(dash);
    if (yMin) {
        expect(await page.getAttribute(locator, "y-min")).toBe(yMin);
    }
    if (yMax) {
        expect(await page.getAttribute(locator, "y-max")).toBe(yMax);
    }
};

export const expectCanRunMultiSensitivity = async (page: Page, timeout = 10000) => {
    // add a second varying parameter with default 10 values - should get 100 solutions from the 2 varying
    await page.click("#add-param-settings");
    await expect(await page.locator("#edit-param-to-vary select")).toBeVisible();
    await page.click("#ok-settings");
    await expect(await page.locator(".sensitivity-options-settings").count()).toBe(2);

    await expect(await page.innerText(".multi-sensitivity-status")).toBe("Multi-sensitivity has not been run.");
    await page.click("#run-multi-sens-btn");
    await expect(await page.locator("#run-multi-sens-btn")).toBeEnabled();
    await expect(await page.locator(".multi-sensitivity-status")).toHaveText(
        "Multi-sensitivity run produced 100 solutions.",
        { timeout }
    );
    await expect(await page.locator("#download-summary-btn")).toBeEnabled();
};
