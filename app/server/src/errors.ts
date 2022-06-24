import { Request, Response } from "express";
import { uid } from "uid";
import { jsonResponseError } from "./jsonResponse";

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

export const handleError = (err: Error, req: Request, res: Response, next: any) => {
    // TODO: option to render view rather than json
    const wodinError = err instanceof WodinError;

    const status = wodinError ? err.status : 500;
    const type = wodinError ? err.errorType : ErrorType.OTHER_ERROR;

    // Do not return raw messages from unexpected errors to the front end
    const detail = wodinError ? err.message : `An unexpected error occurred. Please contact support and quote error code ${uid()}`;

    // Set error detail and stack on req so morgan logs them
    (req as any).errorStack = err.stack;
    (req as any).errorDetail = detail;
    jsonResponseError(status, type, detail, res);
};
