import { test } from "vitest";
import os from "node:os";
import path from "path";
import fs from "fs";

type TmpDirTestFixture = { tmpdir: string; }

const createTempDir = () => {
    const ostmpdir = os.tmpdir();
    const tmpdir = path.resolve(ostmpdir, "static-site-builder-tests-");
    return fs.mkdtempSync(tmpdir);
};

export const tmpdirTest = test.extend<TmpDirTestFixture>({
    // eslint-disable-next-line no-empty-pattern
    tmpdir: async ({}, use) => {
        const dir = createTempDir();
        await use(dir);

        fs.rmSync(dir, { recursive: true })
    }
});
