import { Application, Request, Response } from "express";
import {ErrorType, WodinError} from "./errors";

const morgan = require("morgan");

export const initialiseLogging = (app: Application) => {
    console.log("INITIALISING LOGGING");
    morgan.token("error-detail", (req: Request, res: Response) => { return (req as any).errorDetail; });
    morgan.token("error-stack", (req: Request) => { return (req as any).errorStack; });


    const customFormat = (tokens: any, req: Request, res: Response) => {
        return [
            tokens["remote-addr"](req, res),
            tokens["remote-user"](req, res),
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, "content-length"), "-",
            tokens["response-time"](req, res), "ms",
            tokens["error-detail"](req),
            tokens["error-stack"](req)
        ].join(" ");
    };

    app.use(morgan(customFormat));
};
