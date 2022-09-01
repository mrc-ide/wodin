import { Request, Response } from "express";
import { AppLocals, SessionMetadata } from "../types";
import { SessionStore } from "../db/sessionStore";
import { jsonResponseSuccess } from "../jsonResponse";

export class SessionsController {
    private static getStore = (req: Request) => {
        const { redis, wodinConfig } = req.app.locals as AppLocals;
        const { appName } = req.params;
        return new SessionStore(redis, wodinConfig.savePrefix, appName);
    };

    static postSession = async (req: Request, res: Response) => {
        const { id } = req.params;
        const store = SessionsController.getStore(req);
        await store.saveSession(id, req.body as string);
        res.end();
    };

    static getSessionsMetadata = async (req: Request, res: Response) => {
        const sessionIdsString = req.query.sessionIds as string;
        let metadata: SessionMetadata[] = [];
        if (sessionIdsString) {
            const sessionIds = sessionIdsString.split(",");
            const store = SessionsController.getStore(req);
            metadata = await store.getSessionsMetadata(sessionIds);
        }
        jsonResponseSuccess(metadata, res);
    };
}
