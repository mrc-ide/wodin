import {Application, Request, Response} from "express";
import {ConfigReader} from "../configReader";
import {ErrorCode, jsonResponseError, jsonResponseSuccess} from "../jsonResponse";

export class ConfigController {

    private readonly _path = "/config";
    private readonly _configReader: ConfigReader;
    private readonly _appsPath: string;

    constructor(configReader: ConfigReader, appsPath: string, app: Application) {
        this._configReader = configReader;
        this._appsPath = appsPath;
        app.get(`${this._path}/basic/:appName`, this.getBasicConfig);
        app.get(`${this._path}/fit/:appName`, this.getFitConfig);
        app.get(`${this._path}/stochastic/:appName`, this.getStochasticConfig);
    }
_
    private _readAppConfigFile = (appName: string) => {
        return this._configReader.readConfigFile(this._appsPath, `${appName}.config.json`)
    };

    private _getConfig = (req: Request, res: Response, jsonSchema: string) => {
        const { appName } = req.params;
        const config = this._readAppConfigFile(appName);
        if (config) {
            // TODO: validate config against schema for app type
            jsonResponseSuccess(config, res);
        } else {
            jsonResponseError(404, ErrorCode.NOT_FOUND, `App with name ${appName} is not configured.`, res);
        }
    };

    getBasicConfig = (req: Request, res: Response) => {
        this._getConfig(req, res, "basic");
    };

    getFitConfig = (req: Request, res: Response) => {
        this._getConfig(req, res, "fit");
    };

    getStochasticConfig = (req: Request, res: Response) => {
        this._getConfig(req, res, "stochastic");
    };
}
