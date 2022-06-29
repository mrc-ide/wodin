import { Request, Response } from "express";
import { AppLocals } from "../types";

export class AppsController {
    static getApp = (req: Request, res: Response) => {
        const {
            configReader, appsPath, wodinConfig, wodinVersion
        } = req.app.locals as AppLocals;
        const { appName } = req.params;
        const config = configReader.readConfigFile(appsPath, `${appName}.config.json`) as any;
        if (config) {
            const view = `${config.appType}-app`;
            // TODO: validate config against schema for app type
            const viewOptions = {
                appName, appTitle: config.title, courseTitle: wodinConfig.courseTitle, wodinVersion
            };
            res.render(view, viewOptions);
        } else {
            res.status(404).render("app-not-found", { appName });
        }
    };
}
