const doc = `
Usage:
  server [options] <path>

Options:
  --base-url=URL   Base url for app
  --odin-api=URL   Url to find odin api
  --redis-url=URL  Url to find Redis
`;

const { version } = require("./version");
const { docopt } = require("docopt");

type Option = string | undefined;

const dropUndefined = (options: Record<string, Option>): Record<string, string> => {
    return Object.fromEntries(options.entries.filter((o) => o !== undefined));
}

export const processArgs = (opts: any) => {
    const configPath = path.resolve(opts["<path>"] as string);
    const options = dropUndefined({
        baseUrl: opts["--base-url"] as Option,
        odinApi: opts["--odin-api"] as Option,
        redisUrl: opts["--redis-url"] as Option
    });
    return { configPath, options };
}

const options = processArgs(docopt(doc, { version }));

console.log("Command line configuration");
options.entries.forEach((entry) => {
    console.log(`  * ${entry[0]}: ${entry[1]}`);
});

module.exports = { options };
