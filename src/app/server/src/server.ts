import {Request, Response} from 'express';

const express = require("express");
const path = require("path");
const fs = require("fs");
const hbs = require("hbs");

const app = express();
const port = process.env.PORT || 3000;
const rootDir = path.join(__dirname, "..");

app.use(express.static(path.join(rootDir, "public")));
app.use("/files", express.static(path.join(rootDir, "config/files")));

app.set("view engine", "hbs");
app.set("views", path.join(rootDir, "views"));

hbs.registerHelper('json', function(context: (...args: any[]) => any) {
    return JSON.stringify(context);
});

const wodinConfig = JSON.parse(fs.readFileSync(path.join(rootDir, "config", "wodin.config.json")));

const getAppConfig = (appName: string) => {
    const filename = path.join(rootDir, "config", wodinConfig.appsPath, `${appName}.config.json`);
    if (fs.existsSync(filename)) {
        const configText = fs.readFileSync(filename, {encoding: "utf-8"});
        return JSON.parse(configText);
    }
    return null;
};

app.get("/", (req: Request, res: Response) => {
    const filename = path.join(rootDir, "config", "index.html");
    res.sendFile(filename);
});

app.get(`/${wodinConfig.appsPath}/:appName`, (req: Request, res: Response) => {
    const appName = req.params["appName"];
    const config = getAppConfig(appName);
    if (config) {
        res.render("app", {config});
    } else {
        res.status(404).render("404", {appName});
    }
});

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`)
});
