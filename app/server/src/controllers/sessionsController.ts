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

    static getSession = async (req: Request, res: Response) => {
        const { redis, wodinConfig } = req.app.locals as AppLocals;
        const { appName, id } = req.params;
        const store = new SessionStore(redis, wodinConfig.savePrefix, appName);
        const session = await store.getSession(id);
        // On failure to get a session we could return 404 with some
        // rich error response, but we don't really have nice handlers
        // set up for this yet. So instead let's return a json null
        // which is basically the same as what redis is giving us
        // anyway, and we can look to handle this in the front end.
        if (session === null) {
            res.json(null);
        } else {
            res.set("Content-Type", "application/json");
            res.send(Buffer.from(session));
        }
    };
}
