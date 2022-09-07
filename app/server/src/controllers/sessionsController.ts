import { Request, Response } from "express";
import { AppLocals, SessionMetadata } from "../types";
import { SessionStore } from "../db/sessionStore";
import { ErrorType } from "../errors/errorType";
import { jsonResponseError, jsonResponseSuccess, jsonStringResponseSuccess } from "../jsonResponse";

export const serialiseSession = (session: string | null, res: Response) => {
    if (session === null) {
        jsonResponseError(404, ErrorType.NOT_FOUND, "Session not found", res);
    } else {
        // Because we store the session in the db as a jsonified
        // string, we can't use jsonResponseSuccess and
        // re-stringify the json, jsonStringResponseSuccess will
        // interpolate an existing json string into a json object.
        jsonStringResponseSuccess(session, res);
    }
};

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

    static postSessionLabel = async (req: Request, res: Response) => {
        const { redis, wodinConfig } = req.app.locals as AppLocals;
        const { appName, id } = req.params;
        const store = new SessionStore(redis, wodinConfig.savePrefix, appName);
        await store.saveSessionLabel(id, req.body as string);
        res.end();
    };

    static getSession = async (req: Request, res: Response) => {
        const { redis, wodinConfig } = req.app.locals as AppLocals;
        const { appName, id } = req.params;
        const store = new SessionStore(redis, wodinConfig.savePrefix, appName);
        const session = await store.getSession(id);
        serialiseSession(session, res);
    };

    static generateFriendlyId = async (req: Request, res: Response) => {
        const { redis, wodinConfig } = req.app.locals as AppLocals;
        const { appName, id } = req.params;
        const store = new SessionStore(redis, wodinConfig.savePrefix, appName);
        const friendly = store.generateFriendlyId(id);
        res.header("Content-Type", "application/json");
        res.end(friendly);
    };
}
