import { Application, Request, Response } from "express";
import { ConfigReader } from "../configReader";
import { ErrorCode, jsonResponseError, jsonResponseSuccess } from "../jsonResponse";

export class ConfigController {
    private readonly _path = "/config";

    private readonly _configReader: ConfigReader;

    private readonly _appsPath: string;

    constructor(configReader: ConfigReader, appsPath: string) {
        this._configReader = configReader;
        this._appsPath = appsPath;
    }

    private _readAppConfigFile = (appName: string) => {
        return this._configReader.readConfigFile(this._appsPath, `${appName}.config.json`);
    };

    registerRoutes = (app: Application) => {
        app.get(`${this._path}/:appName`, this.getConfig);
    };

    getConfig = (req: Request, res: Response) => {
        const { appName } = req.params;
        const config = this._readAppConfigFile(appName);
        if (config) {
            jsonResponseSuccess(config, res);
        } else {
            jsonResponseError(404, ErrorCode.NOT_FOUND, `App with name ${appName} is not configured.`, res);
        }
    };
}
