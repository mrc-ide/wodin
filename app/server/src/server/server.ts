#!/usr/bin/env node

import { ConfigReader } from "../configReader";
import { WodinConfig } from "../types";
import { registerViews } from "./views";
import { registerRoutes } from "../routes";
import { DefaultCodeReader } from "../defaultCodeReader";
import { handleError } from "../errors/handleError";
import { initialiseLogging } from "../logging";

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
initialiseLogging(app);

const rootDir = path.join(__dirname, "../..");

// Get command line args
const { configPath } = require("./args");

// Global config
const configReader = new ConfigReader(configPath);
const wodinConfig = configReader.readConfigFile("wodin.config.json") as WodinConfig;
const { port, appsPath, odinAPI } = wodinConfig;
const defaultCodeReader = new DefaultCodeReader(`${configPath}/defaultCode`);

// Use WODIN version from package.json
const wodinVersion = process.env.npm_package_version;

// Make app locals available to controllers
Object.assign(app.locals, {
    appsPath, configPath, configReader, defaultCodeReader, odinAPI, wodinConfig, wodinVersion
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
