import { Response } from "express";

const addContentType = (res: Response) => {
    res.header("Content-Type", "application/json");
};

// This is needed to support passing back data as a json string nicely
// (we store json in redis so use this to pass it back without doing a
// deserialise/serialise roundtrip)
export const jsonStringResponseSuccess = (data: string, res: Response) => {
    addContentType(res);
    res.end(`{"status":"success","errors":null,"data":${data}}`);
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

export const jsonResponseError = (
    httpStatus: number,
    error: string,
    detail: string,
    res: Response
) => {
    addContentType(res);
    const responseObject = {
        status: "failure",
        errors: [
            { error, detail }
        ],
        data: null
    };
    res.status(httpStatus);
    res.end(JSON.stringify(responseObject));
};
