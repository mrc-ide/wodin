const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { argv } = yargs(hideBin(process.argv));
const configPath = argv.config;
if (!configPath) {
    throw new Error("Please provide a 'config' argument specifying path to the config folder");
}
console.log(`Config path: ${configPath}`);

module.exports = { configPath };
