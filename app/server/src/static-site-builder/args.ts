const doc = `
Usage:
  builder <path-to-config> <dest-path> <path-to-mustache-views>
`;

import { docopt } from "docopt";
import { version } from "../version";

export const processArgs = (argv: string[] = process.argv) => {
    const opts = docopt(doc, { argv: argv.slice(2), version, exit: false });
    const configPath = opts["<path-to-config>"] as string;
    const destPath = opts["<dest-path>"] as string;
    const viewsPath = opts["<path-to-mustache-views>"] as string;
    return { configPath, destPath, viewsPath };
};
