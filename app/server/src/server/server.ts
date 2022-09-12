#!/usr/bin/env node

import { ConfigReader } from "../configReader";
import { WodinConfig } from "../types";
import { registerViews } from "./views";
import { registerRoutes } from "../routes";
import { DefaultCodeReader } from "../defaultCodeReader";
import { handleError } from "../errors/handleError";
import { initialiseLogging } from "../logging";
import { redisConnection } from "../redis";
import { version as wodinVersion } from "../version";

const express = require("express");
const path = require("path");

const app = express();
initialiseLogging(app);

const rootDir = path.join(__dirname, "../..");

// Get command line args
const { configPath } = require("./args");

// Global config
const configReader = new ConfigReader(configPath);
const wodinConfig = configReader.readConfigFile("wodin.config.json") as WodinConfig;
const { port, appsPath, odinAPI } = wodinConfig;
const defaultCodeReader = new DefaultCodeReader(`${configPath}/defaultCode`);

const redis = redisConnection(
    wodinConfig.redisURL,
    () => { throw Error(`Failed to connect to redis server ${wodinConfig.redisURL}`); }
);

// Make app locals available to controllers
Object.assign(app.locals, {
    appsPath, configPath, configReader, defaultCodeReader, odinAPI, redis, wodinConfig, wodinVersion
});

// Static content
app.use(express.static(path.join(rootDir, "public")));
app.use("/files", express.static(path.join(configPath, "files")));

// Views
registerViews(app, rootDir);

// Routes
app.use("/", registerRoutes(app));

// Error handler
app.use(handleError);

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`);
});
