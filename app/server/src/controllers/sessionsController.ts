import { Request, Response } from "express";
import {AppLocals} from "../types";
import {SessionStore} from "../db/sessionStore";

export class SessionsController {
    static postSession = async (req: Request, res: Response) => {
        console.log("posting session")
        const { redis, wodinConfig } = req.app.locals as AppLocals;
        const { appName, id } = req.params;
        const store = new SessionStore(redis, wodinConfig.courseTitle, appName);
        console.log("created store")
        await store.saveSession(id, req.body);
        console.log("saved session")
        res.end();
    };
}
