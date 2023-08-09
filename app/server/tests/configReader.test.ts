import * as fs from "fs";
import { ConfigReader } from "../src/configReader";

describe("configReader", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("copes with BOM markers", () => {
        // This test needs to go before the mocks below
        const res: any = new ConfigReader(__dirname).readConfigFile("examples/bom.json");
        expect((res as any).title).toBe("Ebola Project");
    });

    it("returns null when config not found", () => {
        const mockExistsSync = jest.spyOn(fs, "existsSync").mockReturnValue(false);

        const result = new ConfigReader("root").readConfigFile("test.config");

        expect(result).toBeNull();
        expect(mockExistsSync.mock.calls.length).toBe(1);
        expect(mockExistsSync.mock.calls[0][0]).toBe("root/test.config");
    });

    it("returns parsed config file contents", () => {
        const mockExistsSync = jest.spyOn(fs, "existsSync").mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue("{\"test\": \"value\"}");

        const result = new ConfigReader("root").readConfigFile("test.config");

        expect(result).toStrictEqual({ test: "value" });

        expect(mockExistsSync.mock.calls.length).toBe(1);
        expect(mockExistsSync.mock.calls[0][0]).toBe("root/test.config");

        expect(mockReadFileSync.mock.calls.length).toBe(1);
        expect(mockReadFileSync.mock.calls[0][0]).toBe("root/test.config");
        expect(mockReadFileSync.mock.calls[0][1]).toStrictEqual({ encoding: "utf-8" });
    });
});
