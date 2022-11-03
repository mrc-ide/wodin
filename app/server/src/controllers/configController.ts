import { Request, Response } from "express";
import { ConfigReader } from "../configReader";
import { jsonResponseSuccess } from "../jsonResponse";
import { AppConfig, AppLocals } from "../types";
import { AppFileReader } from "../appFileReader";
import { ErrorType } from "../errors/errorType";
import { WodinError } from "../errors/wodinError";

export class ConfigController {
    private static _readAppConfigFile = (
        appName: string,
        appsPath: string,
        baseUrl: string,
        configReader: ConfigReader,
        defaultCodeReader: AppFileReader,
        appHelpReader: AppFileReader
    ) => {
        const result = configReader.readConfigFile(appsPath, `${appName}.config.json`) as AppConfig;
        if (result) {
            result.defaultCode = defaultCodeReader.readFile(appName);
            const appHelp = appHelpReader.readFile(appName);
            if (appHelp.length) {
                if (!result.help) {
                    result.help = {};
                }
                result.help.markdown = appHelp;
            }
            result.baseUrl = baseUrl;
        }
        return result;
    };

    static getConfig = (req: Request, res: Response) => {
        const { appName } = req.params;
        const {
            configReader, appsPath, defaultCodeReader, appHelpReader, baseUrl
        } = req.app.locals as AppLocals;

        const config = this._readAppConfigFile(
            appName,
            appsPath,
            baseUrl,
            configReader,
            defaultCodeReader,
            appHelpReader
        );
        if (config) {
            jsonResponseSuccess(config, res);
        } else {
            throw new WodinError(`App with name ${appName} is not configured.`, 404, ErrorType.NOT_FOUND);
        }
    };
}
