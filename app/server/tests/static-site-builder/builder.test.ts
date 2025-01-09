import path from "path";
import fs from "fs";
import { tmpdirTest } from "./tempDirTestHelper"
import { buildWodinStaticSite } from "../../src/static-site-builder/builder"

const buildSite = async (tmpdir: string) => {
    await buildWodinStaticSite("../../config-static", tmpdir);
}

const {
    mockRunnerOde, mockRunnerDiscrete,
    mockModel, mockGet, mockPost
} = vi.hoisted(() => {
    const mockRunnerOde = "var odinRunnerOde;";
    const mockRunnerDiscrete = "var odinRunnerDiscrete;";
    const mockModel = "class odinModel {};";
    const mockGet = vi.fn().mockImplementation((url: string) => {
        if (url === "http://localhost:8001/support/runner-ode") {
            return { data: { data: mockRunnerOde } };
        } else if (url === "http://localhost:8001/support/runner-discrete") {
            return { data: { data: mockRunnerDiscrete } };
        }
    });
    const mockPost = vi.fn().mockImplementation((url: string) => {
        if (url === "http://localhost:8001/compile") {
            return { data: { data: mockModel } };
        }
    });
    return {
        mockRunnerOde, mockRunnerDiscrete,
        mockModel, mockGet, mockPost
    };
});

vi.mock("axios", () => {
    return {
        default: {
            get: mockGet,
            post: mockPost
        }
    }
});

const p = path.resolve;

const expectPath = (...paths: string[]) => {
    expect(fs.existsSync(p(...paths))).toBe(true);
};

const expectPathContent = (content: string, ...paths: string[]) => {
    expect(fs.readFileSync(p(...paths)).toString()).toBe(content);
}

const expectPathContentContains = (content: string, ...paths: string[]) => {
    expect(fs.readFileSync(p(...paths)).toString()).toContain(content);
}

describe("Wodin builder", () => {
    tmpdirTest("creates dest dir if it doesn't exist", async ({ tmpdir }) => {
        fs.rmdirSync(tmpdir);
        await buildSite(tmpdir);
        expectPath(tmpdir);
    });

    tmpdirTest("generates site with correct files and folder structure", async ({ tmpdir }) => {
        const storesPath = p(tmpdir, "stores");
        await buildSite(tmpdir);

        expectPath(tmpdir, "index.html");
        
        expectPath(storesPath, "runnerOde.js");
        expectPathContent(mockRunnerOde, storesPath, "runnerOde.js");
        expectPath(storesPath, "runnerDiscrete.js");
        expectPathContent(mockRunnerDiscrete, storesPath, "runnerDiscrete.js");

        expectPath(storesPath, "basic", "model.json");
        expectPathContentContains(mockModel, storesPath, "basic", "model.json");
        expectPath(storesPath, "basic", "config.json");
    });

    tmpdirTest("overwrites existing stores folder", async ({ tmpdir }) => {
        const storesPath = p(tmpdir, "stores");
        fs.mkdirSync(storesPath);
        fs.writeFileSync(p(storesPath, "trash.txt"), "whats up");

        await buildSite(tmpdir);

        expect(fs.existsSync(p(storesPath, "trash.txt"))).toBe(false)
    });
})