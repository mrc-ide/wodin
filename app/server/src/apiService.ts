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

    private static getRequestConfig = (req: Request) => {
        // Pass through headers from front end
        const headers = {} as Record<string, string>;
        Object.keys(req.headers).forEach((key: string) => {
            if (req.headers[key]) {
                headers[key] = req.headers[key]!.toString();
            }
        });

        // do not parse json response before passing through
        const transformResponse = (data: string) => data;

        return { headers, transformResponse };
    };

    private static fullUrl = (req: Request, url: string) => {
        const { odinAPI } = req.app.locals as AppLocals;
        return `${odinAPI}${url}`;
    };

    static get = async (url: string, req: Request, res: Response) => {
        const apiResponse = await axios.get(APIService.fullUrl(req, url), APIService.getRequestConfig(req));
        APIService.passThroughResponse(apiResponse, res);
    };

    static post = async (url: string, body: string, req: Request, res: Response) => {
        const apiResponse = await axios.post(APIService.fullUrl(req, url), body, APIService.getRequestConfig(req));
        APIService.passThroughResponse(apiResponse, res);
    };
}
