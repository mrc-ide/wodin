#!/usr/bin/env node

import { Request, Response } from "express";
import { ConfigReader } from "./configReader";
import { WodinConfig } from "./types";

const express = require("express");
const path = require("path");
const hbs = require("hbs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const app = express();

const rootDir = path.join(__dirname, "..");

const { argv } = yargs(hideBin(process.argv));
const configPath = argv.config;
if (!configPath) {
    throw new Error("Please provide a 'config' argument specifying path to the config folder");
}
console.log(`Config path: ${configPath}`);

app.use(express.static(path.join(rootDir, "public")));
app.use("/files", express.static(path.join(configPath, "files")));

app.set("view engine", "hbs");
app.set("views", path.join(rootDir, "views"));

hbs.registerHelper("json", (context: any) => {
    return JSON.stringify(context);
});

const configReader = new ConfigReader(configPath);
const wodinConfig = configReader.readConfigFile("wodin.config.json") as WodinConfig;

const { port, appsPath } = wodinConfig;

app.get("/", (req: Request, res: Response) => {
    const filename = path.join(configPath, "index.html");
    res.sendFile(filename);
});

app.get(`/${appsPath}/:appName`, (req: Request, res: Response) => {
    const { appName } = req.params;
    const config = configReader.readConfigFile(appsPath, `${appName}.config.json`) as any;
    if (config) {
        const view = `${config.appType}-app`;
        // TODO: validate config against schema for app type
        res.render(view, { appName, title: config.title });
    } else {
        res.status(404).render("app-not-found", { appName });
    }
});

app.set("configPath", configPath); //TODO: consts for these
app.set("appsPath", appsPath);
app.locals.testy = "testy";
const routes = require('./routes');
app.use("/", routes);

app.use((req: Request, res: Response) => {
    const { url } = req;
    res.status(404).render("page-not-found", { url });
});

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`);
});
