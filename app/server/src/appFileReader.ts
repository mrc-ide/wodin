import path from "path";
import fs from "fs";

export class AppFileReader {
    private readonly _codeDir: string;

    private readonly _suffix: string;

    constructor(codeDir: string, suffix: string) {
        this._codeDir = codeDir;
        this._suffix = suffix;
    }

    readFile(appName: string): string[] {
        const filename = path.join(this._codeDir, `${appName}.${this._suffix}`);
        if (fs.existsSync(filename)) {
            const lines = fs.readFileSync(filename, { encoding: "utf-8" });
            return lines.split("\n");
        }
        return [];
    }
}
