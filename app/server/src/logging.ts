import { Application, Request, Response } from "express";

const morgan = require("morgan");

export const initialiseLogging = (app: Application) => {
    morgan.token("error-detail", (req: Request) => { return (req as any).errorDetail; });
    morgan.token("error", (req: Request) => { return (req as any).error; });

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
            tokens.error(req)
        ].join(" ");
    };

    app.use(morgan(customFormat));
};
