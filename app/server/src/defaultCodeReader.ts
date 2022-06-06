import * as path from "path";
import * as fs from "fs";

export class DefaultCodeReader {
    private readonly _codeDir: string;

    constructor(codeDir: string) {
        this._codeDir = codeDir;
    }

    readDefaultCode(appName: string): string[] {
        const filename = path.join(this._codeDir, `${appName}.R`);
        if (fs.existsSync(filename)) {
            const lines = fs.readFileSync(filename, { encoding: "utf-8" });
            return lines.split("\n");
        }
        return [];
    }
}
