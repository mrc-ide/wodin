import { processArgs } from "../../src/server/args";

describe("args", () => {
    const realArgs = process.argv;
    afterEach(() => {
        process.argv = realArgs;
    });

    it("throws error if no config path arg", () => {
        const argv = ["node", "/wodinPath"];
        expect(() => { processArgs(argv); })
            .toThrow("Usage:");
    });

    it("returns config path arg", () => {
        const argv = ["node", "/wodinPath", "/testConfig"];
        const args = processArgs(argv);
        expect(args.path).toBe("/testConfig");
        expect(args.overrides).toStrictEqual({});
    });

    it("collects overrides", () => {
        const argv = ["node", "/wodinPath",
            "--base-url", "http://example.com/wodin",
            "--redis-url=redis:6379",
            "--port=1234",
            "--hot-reload=true",
            "/testConfig"];
        const args = processArgs(argv);
        expect(args.path).toBe("/testConfig");
        expect(args.overrides).toStrictEqual({
            baseUrl: "http://example.com/wodin",
            redisUrl: "redis:6379",
            port: 1234
        });
        expect(args.hotReload).toBe(true);
    });

    it("falls back on process.argv", () => {
        process.argv = ["node", "wodin", "--odin-api=api", "somepath"];
        const args = processArgs();
        expect(args.path).toBe("somepath");
        expect(args.overrides).toStrictEqual({
            odinApi: "api"
        });
    });

    it("requires that port is an integer", () => {
        process.argv = ["node", "wodin", "--port=one", "somepath"];
        expect(() => processArgs()).toThrow("Expected an integer for port");
    });

    it("requires that hot-reload is a boolean", () => {
        process.argv = ["node", "wodin", "--hot-reload=T", "somepath"];
        expect(() => processArgs()).toThrow("Expected a boolean for hot-reload");
    });
});
