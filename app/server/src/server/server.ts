#!/usr/bin/env node

import { ConfigReader } from "../configReader";
import { WodinConfig } from "../types";
import { registerViews } from "./views";
import { registerRoutes } from "../routes";
import { AppFileReader } from "../appFileReader";
import { handleError } from "../errors/handleError";
import { initialiseLogging } from "../logging";
import { redisConnection } from "../redis";
import { version as wodinVersion } from "../version";
import { processArgs } from "./args";

const express = require("express");
const path = require("path");
const compression = require("compression");

const app = express();
initialiseLogging(app);

app.use(compression({ level: 9 })); // Use best compression

const rootDir = path.resolve(path.join(__dirname, "../.."));

// Get command line args
const options = processArgs();

// Global config
const pathResolved = path.resolve(options.path);
const configReader = new ConfigReader(pathResolved, options.overrides);

console.log(`Reading config from ${pathResolved} (${options.path})`);
if (Object.keys(options.overrides).length > 0) {
    console.log("Applying configuration overrides:");
    console.log(options.overrides);
}

const wodinConfig = configReader.readConfigFile("wodin.config.json") as WodinConfig;
const {
    port, appsPath, baseUrl, odinApi
} = wodinConfig;
const defaultCodeReader = new AppFileReader(`${pathResolved}/defaultCode`, "R");
const appHelpReader = new AppFileReader(`${pathResolved}/help`, "md");

const redis = redisConnection(
    wodinConfig.redisUrl,
    () => { throw Error(`Failed to connect to redis server ${wodinConfig.redisUrl}`); }
);

// Make app locals available to controllers
Object.assign(app.locals, {
    appsPath,
    baseUrl,
    configPath: pathResolved,
    configReader,
    defaultCodeReader,
    appHelpReader,
    odinApi,
    redis,
    wodinConfig,
    wodinVersion
});

// Static content
app.use(express.static(path.join(rootDir, "public")));
app.use("/files", express.static(path.join(pathResolved, "files")));
app.use("/help", express.static(path.join(pathResolved, "help")));

// Views
registerViews(app, rootDir);

// Routes
app.use("/", registerRoutes(app));

// Error handler
app.use(handleError);

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`);
});
