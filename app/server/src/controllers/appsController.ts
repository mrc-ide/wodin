import { Request, Response } from "express";
import { AppLocals } from "../types";
import { ErrorType } from "../errors/errorType";
import { WodinWebError } from "../errors/wodinWebError";

export class AppsController {
    static getApp = (req: Request, res: Response) => {
        const { configReader, appsPath } = req.app.locals as AppLocals;
        const { appName } = req.params;
        const config = configReader.readConfigFile(appsPath, `${appName}.config.json`) as any;
        if (config) {
            const view = `${config.appType}-app`;
            // TODO: validate config against schema for app type
            res.render(view, { appName, title: config.title });
        } else {
            throw new WodinWebError(
                `App not found: ${appName}`,
                404,
                ErrorType.NOT_FOUND,
                "app-not-found",
                { appName }
            );
        }
    };
}
