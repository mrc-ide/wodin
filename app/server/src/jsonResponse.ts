import { Response } from "express";

export enum ErrorCode {
    NOT_FOUND = "NOT_FOUND"
}

const addContentType = (res: Response) => {
    res.header("Content-Type", "application/json");
};

export const jsonResponseSuccess = (data: any, res: Response) => {
    addContentType(res);
    const responseObject = {
        status: "success",
        errors: null,
        data
    };
    res.end(JSON.stringify(responseObject));
};

export const jsonResponseError = (httpStatus: number, error: ErrorCode, detail: string, res: Response) => {
    addContentType(res);
    const responseObject = {
        status: "failure",
        errors: [
            { error, detail }
        ],
        data: null
    };
    res.status(httpStatus).end(JSON.stringify(responseObject));
};
