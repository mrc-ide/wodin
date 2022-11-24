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

const dropUndefined = (options: Record<string, Option>) => {
    return Object.fromEntries(Object.entries(options).filter((o) => o !== undefined));
}

export const processArgs = (opts: any) => {
    const path = opts["<path>"] as string;
    const overrides = dropUndefined({
        baseUrl: opts["--base-url"] as Option,
        odinApi: opts["--odin-api"] as Option,
        redisUrl: opts["--redis-url"] as Option
    });
    return { path, overrides };
}

const options = processArgs(docopt(doc, { version }));

console.log("Command line configuration");
console.log(options);

module.exports = { options };
