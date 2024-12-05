import fs from "fs";
import path from "path";

export function stripBom(str: string): string {
    // Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
    // conversion translates it to FEFF (UTF-16 BOM).
    if (str.charCodeAt(0) === 0xFEFF) {
        return str.slice(1);
    }
    return str;
}

export function readFile(filename: string): string {
    return stripBom(fs.readFileSync(filename, { encoding: "utf-8" }));
}

export class ConfigReader {
    rootDir: string;

    overrides: object;

    constructor(rootDir: string, overrides: object = {}) {
        this.rootDir = rootDir;
        this.overrides = overrides;
    }

    readConfigFile(...filePath: string[]): object | null {
        const fullPath = [this.rootDir, ...filePath];
        const filename = path.join(...fullPath);
        if (fs.existsSync(filename)) {
            const configText = readFile(filename);
            return { ...JSON.parse(configText), ...this.overrides };
        }
        return null;
    }
}
