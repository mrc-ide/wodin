import { Request, Response } from "express";
import { AppLocals } from "../types";
import { SessionStore } from "../db/sessionStore";

export const serialiseSession = (session: string | null) => {
    // On failure to get a session we could return 404 with some
    // rich error response, but we don't really have nice handlers
    // set up for this yet. So instead let's return a json null
    // which is basically the same as what redis is giving us
    // anyway, and we can look to handle this in the front end.
    //
    // The other trick we have is that because we store the session in
    // the db as a jsonified string, we can't use jsonResponseSuccess
    // and re-stringify the json, so instead we manually construct a
    // json string, making sure that the case where we fail to find a
    // session is reasonable.
    return `{"status":"success","errors":null,"data":${session || "null"}}`;
};

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
        res.header("Content-Type", "application/json");
        res.end(serialiseSession(session));
    };
}
