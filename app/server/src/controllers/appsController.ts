import { Request, Response } from "express";
import { AppLocals } from "../types";
import { ErrorType } from "../errors/errorType";
import { WodinWebError } from "../errors/wodinWebError";
import {getSessionStore} from "../db/sessionStore";

export class AppsController {
    static getApp = async (req: Request, res: Response) => {
        const {
            configReader, appsPath, wodinConfig, wodinVersion
        } = req.app.locals as AppLocals;
        const { appName } = req.params;
        // client can pass either sessionId or share (friendly id) parameter to identify session to reload
        let sessionId = req.query.sessionId as string | undefined | null;
        const { share } = req.query;

        if (share) {
            const store = getSessionStore(req);
            sessionId = await store.getSessionIdFromFriendlyId(share as string);
        }

        const config = configReader.readConfigFile(appsPath, `${appName}.config.json`) as any;
        if (config) {
            const view = `${config.appType}-app`;
            // TODO: validate config against schema for app type
            const viewOptions = {
                appName,
                appTitle: config.title,
                courseTitle: wodinConfig.courseTitle,
                wodinVersion,
                loadSessionId: sessionId || ""
            };
            res.render(view, viewOptions);
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
