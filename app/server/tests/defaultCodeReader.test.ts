import * as fs from "fs";
import { DefaultCodeReader } from "../src/defaultCodeReader";

describe("DefaultCodeReader", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns lines from file when file exists", () => {
        const mockExistsSync = jest.spyOn(fs, "existsSync").mockReturnValue(true);
        const mockReadFileSync = jest.spyOn(fs, "readFileSync").mockReturnValue("line1\nline2\nline3");

        const result = new DefaultCodeReader("/testDir").readDefaultCode("TestApp");
        expect(result).toStrictEqual(["line1", "line2", "line3"]);
        expect(mockExistsSync.mock.calls[0][0]).toBe("/testDir/TestApp.R");
        expect(mockReadFileSync.mock.calls[0][0]).toBe("/testDir/TestApp.R");
        expect(mockReadFileSync.mock.calls[0][1]).toStrictEqual({ encoding: "utf-8" });
    });

    it("returns empty string array when file does not exist", () => {
        const mockExistsSync = jest.spyOn(fs, "existsSync").mockReturnValue(false);
        const mockReadFileSync = jest.spyOn(fs, "readFileSync");

        const result = new DefaultCodeReader("/testDir").readDefaultCode("TestApp");
        expect(result).toStrictEqual([]);
        expect(mockExistsSync.mock.calls[0][0]).toBe("/testDir/TestApp.R");
        expect(mockReadFileSync).not.toBeCalled();
    });
});
