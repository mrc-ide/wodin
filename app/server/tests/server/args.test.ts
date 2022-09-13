describe("args", () => {
    const mockConsoleLog = jest.fn();
    const realConsoleLog = console.log;
    const realArgs = process.argv;

    beforeAll(() => {
        console.log = mockConsoleLog;
    });

    afterAll(() => {
        console.log = realConsoleLog;
        process.argv = realArgs;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("throws error if no config path arg", () => {
        process.argv = ["node", "/wodinPath"];
        expect(() => { require("../../src/server/args"); })
            .toThrow("Please provide a 'config' argument specifying path to the config folder");
    });

    it("returns config path arg", () => {
        process.argv = ["node", "/wodinPath", "--config=/testConfig"];
        const args = require("../../src/server/args");
        expect(args.configPath).toBe("/testConfig");
        expect(mockConsoleLog).toBeCalledTimes(1);
        expect(mockConsoleLog.mock.calls[0][0]).toBe("Config path: /testConfig (/testConfig)");
    });
});
