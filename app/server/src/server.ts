import { Request, Response } from "express";
import { ConfigReader } from "./configReader";
import { ConfigController } from "./controllers/configController";
import { WodinConfig } from "./types";

const express = require("express");
const path = require("path");
const hbs = require("hbs");

const app = express();
const rootDir = path.join(__dirname, "..");
const configPath = path.join(rootDir, "../../config");

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
        res.render(view, { appName, title: config.title });
    } else {
        res.status(404).render("app-not-found", { appName });
    }
});

const configController = new ConfigController(configReader, appsPath);
configController.init(app);

app.use((req: Request, res: Response) => {
    const { url } = req;
    res.status(404).render("page-not-found", { url });
});

app.listen(port, () => {
    console.log(`WODIN server listening on port ${port}`);
});
