import { Application, Request, Response } from "express";
import { ConfigReader } from "../configReader";

export class ConfigController {

    private readonly path = "/config";
    private readonly configReader: ConfigReader;
    private readonly appsPath: string;

    constructor(configReader: ConfigReader, appsPath: string, app: Application) {
        this.configReader = configReader;
        this.appsPath = appsPath;
        app.get(`${this.path}/basic/:appName`, this.getBasicConfig); //TODO: content type
        // TODO: other app types
    }

    private readAppConfigFile = (appName: string) => {
        return this.configReader.readConfigFile(this.appsPath, `${appName}.config.json`)
    };

    private writeResponse(responseObject: Object, res: Response) {
        //TODO: standard response wrapper - make this separate middleware like in kotlin apps
        res.end(JSON.stringify(responseObject));
    };

    private getConfig = (req: Request, res: Response, jsonSchema: string) => {
        const { appName } = req.params;
        const config = this.readAppConfigFile(appName);
        // TODO: validate config against schema
        if (config) {
            this.writeResponse(config, res);
        } else {
            //TODO: 404
        }
    };

    getBasicConfig = (req: Request, res: Response) => {
        this.getConfig(req, res, "basic");
    };
}
