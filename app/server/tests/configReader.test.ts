import { ConfigReader } from "../src/configReader";
import * as fs from "fs";

describe("configReader", () => {
    beforeEach(() => {
        jest.resetAllMocks()
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
