import { NextFunction, Request, Response } from "express";
import { SessionMetadata } from "../types";
import { getSessionStore } from "../db/sessionStore";
import { ErrorType } from "../errors/errorType";
import { jsonResponseError, jsonResponseSuccess, jsonStringResponseSuccess } from "../jsonResponse";
import asyncControllerHandler from "../errors/asyncControllerHandler";

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
    static postSession = async (req: Request, res: Response, next: NextFunction) => {
        await asyncControllerHandler(next, async () => {
            const { id } = req.params;
            const store = getSessionStore(req);
            await store.saveSession(id, req.body as string);
            res.end();
        });
    };

    static getSessionsMetadata = async (req: Request, res: Response, next: NextFunction) => {
        await asyncControllerHandler(next, async () => {
            const sessionIdsString = req.query.sessionIds as string;
            let metadata: SessionMetadata[] = [];
            if (sessionIdsString) {
                const sessionIds = sessionIdsString.split(",");
                const store = getSessionStore(req);
                metadata = await store.getSessionsMetadata(sessionIds);
            }
            jsonResponseSuccess(metadata, res);
        });
    };

    static postSessionLabel = async (req: Request, res: Response, next: NextFunction) => {
        await asyncControllerHandler(next, async () => {
            const { id } = req.params;
            const store = getSessionStore(req);
            await store.saveSessionLabel(id, req.body as string);
            res.end();
        });
    };

    static getSession = async (req: Request, res: Response, next: NextFunction) => {
        await asyncControllerHandler(next, async () => {
            const { id } = req.params;
            const store = getSessionStore(req);
            const session = await store.getSession(id);
            serialiseSession(session, res);
        });
    };

    static generateFriendlyId = async (req: Request, res: Response, next: NextFunction) => {
        await asyncControllerHandler(next, async () => {
            const { id } = req.params;
            const store = getSessionStore(req);
            const friendly = await store.generateFriendlyId(id);
            jsonResponseSuccess(friendly, res);
        });
    };
}
