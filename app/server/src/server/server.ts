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
const wodinConfig = configReader.readConfigFile("wodin.config.json") as WodinConfig;
const {
    port, appsPath, baseUrl, odinAPI
} = wodinConfig;
const defaultCodeReader = new AppFileReader(`${options.path}/defaultCode`, "R");
const appHelpReader = new AppFileReader(`${options.path}/help`, "md");

const redis = redisConnection(
    wodinConfig.redisURL,
    () => { throw Error(`Failed to connect to redis server ${wodinConfig.redisURL}`); }
);

// Make app locals available to controllers
Object.assign(app.locals, {
    appsPath,
    baseUrl,
    configPath: options.path,
    configReader,
    defaultCodeReader,
    appHelpReader,
    odinAPI,
    redis,
    wodinConfig,
    wodinVersion
});

// Static content
app.use(express.static(path.join(rootDir, "public")));
app.use("/files", express.static(path.join(options.path, "files")));
app.use("/help", express.static(path.join(options.path, "help")));

// Views
registerViews(app, rootDir);

// Routes
app.use("/", registerRoutes(app));

// Error handler
app.use(handleError);

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`);
});
