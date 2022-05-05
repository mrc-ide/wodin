#!/usr/bin/env node

import { ConfigReader } from "../configReader";
import { WodinConfig } from "../types";
import { registerViews } from "./views";
import { registerRoutes } from "../routes";

const express = require("express");
const path = require("path");

const app = express();

const rootDir = path.join(__dirname, "../..");

// Get command line args
const { configPath } = require("./args");

// Global config
const configReader = new ConfigReader(configPath);
const wodinConfig = configReader.readConfigFile("wodin.config.json") as WodinConfig;
const { port, appsPath } = wodinConfig;

// Make app locals available to controllers
Object.assign(app.locals, { appsPath, configPath, configReader });

// Static content
app.use(express.static(path.join(rootDir, "public")));
app.use("/files", express.static(path.join(configPath, "files")));

// Views
registerViews(app, rootDir);

// Routes
const routes = registerRoutes(app);

app.use("/", routes);

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`);
});
