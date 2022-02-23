import { Request, Response } from "express";
import { ConfigReader } from "./configReader";
import { ConfigController } from "./controllers/configController";

const express = require("express");
const path = require("path");
const hbs = require("hbs");

const app = express();
const rootDir = path.join(__dirname, "..");

app.use(express.static(path.join(rootDir, "public")));
app.use("/files", express.static(path.join(rootDir, "config/files")));

app.set("view engine", "hbs");
app.set("views", path.join(rootDir, "views"));

hbs.registerHelper("json", (context: any) => {
    return JSON.stringify(context);
});

const configReader = new ConfigReader(path.join(rootDir, "config"));
const wodinConfig = configReader.readConfigFile("wodin.config.json") as any; //TODO..

const { port } = wodinConfig;

app.get("/", (req: Request, res: Response) => {
    const filename = path.join(rootDir, "config", "index.html");
    res.sendFile(filename);
});

app.get(`/${wodinConfig.appsPath}/:appName`, (req: Request, res: Response) => {
    const { appName } = req.params;
    const config = configReader.readConfigFile(wodinConfig.appsPath, `${appName}.config.json`) as any; //TODO..
    if (config) {
        const view =  `${config.appType}-app`;
        res.render(view, { appName, title: config.title });
    } else {
        res.status(404).render("app-not-found", { appName });
    }
});

new ConfigController(configReader, wodinConfig.appsPath, app); //TODO: check if more sensible way to use app router

app.use((req: Request, res: Response) => {
    const { url } = req;
    res.status(404).render("page-not-found", { url });
});

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`);
});
