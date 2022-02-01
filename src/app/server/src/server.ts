import {Request, Response} from 'express';

const express = require("express");
const path = require("path");
const hbs = require("hbs");
const {ConfigReader} = require("./configReader");

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

const configReader = new ConfigReader(path.join(rootDir, "config"));
const wodinConfig = configReader.readConfigFile("wodin.config.json");

app.get("/", (req: Request, res: Response) => {
    const filename = path.join(rootDir, "config", "index.html");
    res.sendFile(filename);
});

app.get(`/${wodinConfig.appsPath}/:appName`, (req: Request, res: Response) => {
    const appName = req.params["appName"];
    const config = configReader.readConfigFile(wodinConfig.appsPath, `${appName}.config.json`);
    if (config) {
        res.render("app", {config});
    } else {
        res.status(404).render("404", {appName});
    }
});

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`)
});
