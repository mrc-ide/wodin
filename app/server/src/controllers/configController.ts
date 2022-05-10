import { Request, Response } from "express";
import { ConfigReader } from "../configReader";
import { ErrorCode, jsonResponseError, jsonResponseSuccess } from "../jsonResponse";
import { AppLocals } from "../types";

export class ConfigController {
    private static _readAppConfigFile = (appName: string, appsPath: string, configReader: ConfigReader) => {
        return configReader.readConfigFile(appsPath, `${appName}.config.json`);
    };

    static getConfig = (req: Request, res: Response) => {
        const { appName } = req.params;
        const { configReader, appsPath } = req.app.locals as AppLocals;

        const config = this._readAppConfigFile(appName, appsPath, configReader);
        if (config) {
            jsonResponseSuccess(config, res);
        } else {
            jsonResponseError(404, ErrorCode.NOT_FOUND, `App with name ${appName} is not configured.`, res);
        }
    };
}
