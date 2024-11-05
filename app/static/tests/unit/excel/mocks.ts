export const mockAoaToSheet = vi.fn().mockImplementation((data) => ({ data, type: "aoa" }));
export const mockBookNew = vi.fn().mockImplementation(() => ({ sheets: [] }) as any);
export const mockWriteFile = vi.fn();
export const mockBookAppendSheet = vi.fn().mockImplementation((workbook: any, worksheet: any, name: string) => {
    (workbook as any).sheets.push({ ...worksheet, name });
});
const mockJsonToSheet = vi.fn().mockImplementation((data) => ({ data, type: "json" }));

vi.mock("xlsx", () => ({
    writeFile: (data: string, fileName: string) => mockWriteFile(data, fileName),
    utils: {
        aoa_to_sheet: (data: any) => mockAoaToSheet(data),
        json_to_sheet: (data: any) => mockJsonToSheet(data),
        book_new: () => mockBookNew(),
        book_append_sheet: (wb: any, ws: any, name: string) => mockBookAppendSheet(wb, ws, name)
    }
}));
