import { Page } from "@playwright/test";

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
