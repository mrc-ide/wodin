import * as fs from "fs";
import * as path from "path";

export class ConfigReader {
    rootDir: string;

    constructor(rootDir: string) {
        this.rootDir = rootDir;
    }

    readConfigFile(...filePath: string[]): Object | null {
        const fullPath = [this.rootDir, ...filePath];
        const filename = path.join(...fullPath);
        if (fs.existsSync(filename)) {
            const configText = fs.readFileSync(filename, { encoding: "utf-8" });
            return JSON.parse(configText);
        }
        return null;
    }
}
