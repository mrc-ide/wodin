import { processArgs } from "../../src/static-site-builder/args";

describe("args", () => {
    const realArgs = process.argv;
    afterEach(() => {
        process.argv = realArgs;
    });

    const builderPath = "/builder",
          cfgPath = "/configPath",
          destPath = "/destPath";

    it("throws error if no config path or dest path arg", () => {
        const argv = ["node", builderPath];
        expect(() => { processArgs(argv); })
            .toThrow("Usage:");

        const argv1 = ["node", builderPath, cfgPath];
        expect(() => { processArgs(argv1); })
            .toThrow("Usage:");
    });

    it("returns config path and dest path", () => {
        const argv = ["node", builderPath, cfgPath, destPath];
        const args = processArgs(argv);
        expect(args.configPath).toBe(cfgPath);
        expect(args.destPath).toBe(destPath);
    });
});
