import { NextFunction, Request, Response } from "express";
import { AppLocals } from "../types";
import { ErrorType } from "../errors/errorType";
import { WodinWebError } from "../errors/wodinWebError";
import { getSessionStore } from "../db/sessionStore";
import asyncControllerHandler from "../errors/asyncControllerHandler";

export class AppsController {
    static getApp = async (req: Request, res: Response, next: NextFunction) => {
        await asyncControllerHandler(next, async () => {
            const {
                configReader, appsPath, wodinConfig, wodinVersion
            } = req.app.locals as AppLocals;
            const { appName } = req.params;
            // client can pass either sessionId or share (friendly id) parameter to identify session to reload
            let sessionId = req.query.sessionId as string | undefined | null;
            const { share } = req.query;

            let shareNotFound = null;
            if (share) {
                const store = getSessionStore(req);
                sessionId = await store.getSessionIdFromFriendlyId(share as string);

                if (!sessionId) {
                    shareNotFound = share;
                }
            }

            const config = configReader.readConfigFile(appsPath, `${appName}.config.json`) as any;
            if (config) {
                const baseUrl = wodinConfig.baseUrl.replace(/\/$/, "");
                // TODO: validate config against schema for app type
                const viewOptions = {
                    appName,
                    baseUrl,
                    appsPath,
                    appType: config.appType,
                    title: `${config.title} - ${wodinConfig.courseTitle}`,
                    appTitle: config.title,
                    courseTitle: wodinConfig.courseTitle,
                    wodinVersion,
                    loadSessionId: sessionId || "",
                    shareNotFound: shareNotFound || "",
                    mathjaxSrc: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
                };
                res.render("app", viewOptions);
            } else {
                throw new WodinWebError(
                    `App not found: ${appName}`,
                    404,
                    ErrorType.NOT_FOUND,
                    "app-not-found",
                    { appName }
                );
            }
        });
    };
}
