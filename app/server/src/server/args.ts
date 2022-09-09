const yargs = require("yargs/yargs");
const path = require("path");
const { hideBin } = require("yargs/helpers");

const { argv } = yargs(hideBin(process.argv));
const configPathGiven = argv.config;
if (!configPathGiven) {
    throw new Error("Please provide a 'config' argument specifying path to the config folder");
}
const configPath = path.resolve(configPathGiven);

console.log(`Config path: ${configPathGiven} (${configPath})`);

module.exports = { configPath };
