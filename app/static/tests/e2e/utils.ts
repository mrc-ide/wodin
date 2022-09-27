import {expect, Page} from "@playwright/test";

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
    await expect(await page.innerText("#select-param-msg"))
        .toBe("Please select at least one parameter to vary during model fit.");
    await page.click(":nth-match(input.vary-param-check, 1)");
    await expect(await page.innerText("#select-param-msg")).toBe("");

    // run fit
    await expect(await page.innerText(".wodin-right .wodin-content .nav-tabs .active")).toBe("Fit");
    await page.click(".wodin-right .wodin-content div.mt-4 button#fit-btn");
};

export const waitForModelFitCompletion = async (page: Page) => {
    await expect(await page.getAttribute(".wodin-plot-container .vue-feather", "data-type")).toBe("check");
};
