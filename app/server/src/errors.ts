import { Request, Response, Application } from "express";
import { uid } from "uid";
import { ErrorType, jsonResponseError } from "./jsonResponse";

export class WodinError extends Error {
    status: number;

    errorType: ErrorType;

    constructor(message: string, status: number, errorType: ErrorType) {
        super(message);

        // Set the prototype explicitly.
        // TODO: need this?
        Object.setPrototypeOf(this, WodinError.prototype);

        this.status = status;
        this.errorType = errorType;
    }
}



export const handleError = (err: Error, req: Request, res: Response) => {
    // TODO: option to render view rather than json

    const wodinError = err instanceof WodinError;
    const status = wodinError ? err.status : 500;
    const type = wodinError ? err.errorType : ErrorType.OTHER_ERROR;

    // Do not return raw messages from unexpected errors to the front end
    const detail = wodinError ? err.message : `An unexpected error occurred. Please contact support and quote error code ${uid()}`;

    // Set error and detail on req so morgan logs them
    (req as any).error = err;
    (req as any).errorDetail = detail;
    jsonResponseError(status, type, detail, res);
};
