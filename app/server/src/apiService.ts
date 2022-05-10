import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { AppLocals } from "./types";

export class APIService {
    private static passThroughResponse = (apiResponse: AxiosResponse, res: Response) => {
        res.status(apiResponse.status);
        Object.keys(apiResponse.headers).forEach((key: string) => {
            res.header(key, apiResponse.headers[key]);
        });
        res.end(apiResponse.data);
    };

    private static headersFromRequest = (req: Request) => {
        const result = {} as Record<string, string>;
        Object.keys(req.headers).forEach((key: string) => {
            if (req.headers[key]) {
                result[key] = req.headers[key]!.toString();
            }
        });
        return result;
    };

    private static fullUrl = (req: Request, url: string) => {
        const { odinAPI } = req.app.locals as AppLocals;
        return `${odinAPI}${url}`;
    };

    static get = async (url: string, req: Request, res: Response) => {
        const apiResponse = await axios.get(APIService.fullUrl(req, url), APIService.headersFromRequest(req));
        APIService.passThroughResponse(apiResponse, res);
    };

    static post = async (url: string, body: string, req: Request, res: Response) => {
        const apiResponse = await axios.post(APIService.fullUrl(req, url), body, APIService.headersFromRequest(req));
        APIService.passThroughResponse(apiResponse, res);
    };
}
