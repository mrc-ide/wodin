import { Request, Response } from "express";
import { AppLocals } from "../types";
import { SessionStore } from "../db/sessionStore";

export class SessionsController {
    static postSession = async (req: Request, res: Response) => {
        const { redis, wodinConfig } = req.app.locals as AppLocals;
        const { appName, id } = req.params;
        const store = new SessionStore(redis, wodinConfig.savePrefix, appName);
        await store.saveSession(id, req.body as string);
        res.end();
    };

    static postSessionLabel = async (req: Request, res: Response) => {
        const { redis, wodinConfig } = req.app.locals as AppLocals;
        const { appName, id } = req.params;
        const store = new SessionStore(redis, wodinConfig.savePrefix, appName);
        await store.saveSessionLabel(id, req.body as string);
        res.end();
    };
}
