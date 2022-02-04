describe("configReader", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it("returns null when config not found", () => {
        const mockExistsSync = jest.fn().mockReturnValue(false);
        jest.mock('fs', () => {
            return {existsSync: mockExistsSync}
        });

        const ConfigReader = require("../src/configReader");

        const result = new ConfigReader("root").readConfigFile("test.config");

        expect(result).toBeNull();
        expect(mockExistsSync.mock.calls.length).toBe(1);
        expect(mockExistsSync.mock.calls[0][0]).toBe("root/test.config");
    });

    it("returns parsed config file contents", () => {
        const mockExistsSync = jest.fn().mockReturnValue(true);
        const mockReadFileSync = jest.fn().mockReturnValue(`{"test": "value"}`);
        jest.mock('fs', () => {
            return {
                existsSync: mockExistsSync,
                readFileSync: mockReadFileSync
            }
        });

        const ConfigReader = require("../src/configReader");

        const result = new ConfigReader("root").readConfigFile("test.config");

        expect(result).toStrictEqual({test: "value"});

        expect(mockExistsSync.mock.calls.length).toBe(1);
        expect(mockExistsSync.mock.calls[0][0]).toBe("root/test.config");

        expect(mockReadFileSync.mock.calls.length).toBe(1);
        expect(mockReadFileSync.mock.calls[0][0]).toBe("root/test.config");
        expect(mockReadFileSync.mock.calls[0][1]).toStrictEqual({encoding: "utf-8"});
    });
});

