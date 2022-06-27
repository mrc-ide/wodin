import { Request, Response } from "express";
import { uid } from "uid";
import { jsonResponseError } from "./jsonResponse";
import { reqWithError } from "./logging";

export const enum ErrorType {
    NOT_FOUND = "NOT_FOUND",
    OTHER_ERROR = "OTHER_ERROR"
}

export class WodinError extends Error {
    status: number;

    errorType: ErrorType;

    constructor(message: string, status: number, errorType: ErrorType) {
        super(message);

        this.name = "WodinError";
        this.status = status;
        this.errorType = errorType;
    }
}

export class WodinWebError extends WodinError {
    view: string;

    options: object;

    constructor(message: string, status: number, errorType: ErrorType, view: string, options: object) {
        super(message, status, errorType);

        this.view = view;
        this.options = options;
    }
}

// Need to include the unused next var for this to be used correctly as and error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleError = (err: Error, req: Request, res: Response, _: Function) => {
    const wodinError = err instanceof WodinError;
    const wodinWebError = err instanceof WodinWebError;

    const status = wodinError ? err.status : 500;
    const type = wodinError ? err.errorType : ErrorType.OTHER_ERROR;

    // Do not return raw messages from unexpected errors to the front end
    const detail = wodinError ? err.message
        : `An unexpected error occurred. Please contact support and quote error code ${uid()}`;

    // Set error type, detail and stack on req so morgan logs them
    reqWithError(req).errorType = type;
    reqWithError(req).errorDetail = detail;
    reqWithError(req).errorStack = err.stack;

    // If unexpected server error, check if requested content type is json - if not, render default error view rather
    // than json response
    let view = wodinWebError ? err.view : null;
    let options = wodinWebError ? err.options : {};
    if (!wodinError && !(req.headers.Accept && req.headers.Accept.includes("application/json"))) {
        view = "unexpected-error";
        options = { detail };
    }

    if (view) {
        res.status(status).render(view, options);
    } else {
        jsonResponseError(status, type, detail, res);
    }
};
