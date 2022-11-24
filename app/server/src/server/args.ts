const doc = `
Usage:
  server [options] <path>

Options:
  --base-url=URL   Base url for app
  --odin-api=URL   Url to find odin api
  --redis-url=URL  Url to find Redis
`;

const { docopt } = require("docopt");
const { version } = require("../version");

type Option = string | null;

export const processArgs = (argv: string[] = process.argv) => {
    const opts = docopt(doc, { argv: argv.slice(2), version, exit: false });
    const path = opts["<path>"] as string;
    const given = {
        baseUrl: opts["--base-url"] as Option,
        odinApi: opts["--odin-api"] as Option,
        redisUrl: opts["--redis-url"] as Option
    };
    const overrides = Object.fromEntries(Object.entries(given).filter((o) => o[1] !== null));
    return { path, overrides };
};
