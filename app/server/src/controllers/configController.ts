import { Request, Response } from "express";
import { ConfigReader } from "../configReader";
import { ErrorCode, jsonResponseError, jsonResponseSuccess } from "../jsonResponse";
import { AppConfig, AppLocals } from "../types";
import { DefaultCodeReader } from "../defaultCodeReader";

export class ConfigController {
    private static _readAppConfigFile = (
        appName: string,
        appsPath: string,
        configReader: ConfigReader,
        defaultCodeReader: DefaultCodeReader
    ) => {
        const result = configReader.readConfigFile(appsPath, `${appName}.config.json`) as AppConfig;
        result.defaultCode = defaultCodeReader.readDefaultCode(appName);
        return result;
    };

    static getConfig = (req: Request, res: Response) => {
        const { appName } = req.params;
        const { configReader, appsPath, defaultCodeReader } = req.app.locals as AppLocals;

        const config = this._readAppConfigFile(appName, appsPath, configReader, defaultCodeReader);
        if (config) {
            jsonResponseSuccess(config, res);
        } else {
            jsonResponseError(404, ErrorCode.NOT_FOUND, `App with name ${appName} is not configured.`, res);
        }
    };
}
