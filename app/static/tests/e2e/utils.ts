import {Page} from "@playwright/test";

export const uploadCSVData = async (page: Page, data: string) => {
    const file = {
        name: "file.csv",
        mimeType: "text/plain",
        buffer: Buffer.from(data)
    };
    await page.setInputFiles("#fitDataUpload", file);
};
