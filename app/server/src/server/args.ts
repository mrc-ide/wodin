const doc = `
Usage:
  server [options] <path>

Options:
  --base-url=URL     Base url for app
  --odin-api=URL     Url to find odin api
  --redis-url=URL    Url to find Redis
  --hot-reload=true  true to enable hot reloading otherwise false
  --port=PORT        Port to serve on
`;

const { docopt } = require("docopt");
const { version } = require("../version");

type Perhaps<T> = T | null;

const parseArgInteger = (arg: string | null, name: string): Perhaps<number> => {
    if (arg === null) {
        return null;
    }
    if (!arg.match(/^[0-9]+$/)) {
        throw Error(`Expected an integer for ${name}`);
    }
    return parseInt(arg, 10);
};

const parseArgBoolean = (arg: string | null, name: string): Perhaps<boolean> => {
    if (arg === null) {
        return null;
    }
    if (arg.toLowerCase() !== "true" && arg.toLowerCase() !== "false") {
        throw Error(`Expected a boolean for ${name}`);
    }
    return arg.toLowerCase() === "true";
};

export const processArgs = (argv: string[] = process.argv) => {
    const opts = docopt(doc, { argv: argv.slice(2), version, exit: false });
    const path = opts["<path>"] as string;
    const given = {
        baseUrl: opts["--base-url"] as Perhaps<string>,
        odinApi: opts["--odin-api"] as Perhaps<string>,
        redisUrl: opts["--redis-url"] as Perhaps<string>,
        hotReload: parseArgBoolean(opts["--hot-reload"], "hot-reload"),
        port: parseArgInteger(opts["--port"], "port")
    };
    const { hotReload, ...prodGiven } = given;
    const overrides = Object.fromEntries(Object.entries(prodGiven).filter((o) => o[1] !== null));
    return { path, overrides, hotReload };
};
