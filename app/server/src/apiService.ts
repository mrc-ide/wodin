import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { AppLocals } from "./types";

export class APIService {
    private readonly _req: Request;

    private readonly _res: Response;

    private readonly _odinAPI: string;

    constructor(req: Request, res: Response) {
        this._req = req;
        this._res = res;
        this._odinAPI = (req.app.locals as AppLocals).odinAPI;
    }

    private passThroughResponse = (apiResponse: AxiosResponse) => {
        this._res.status(apiResponse.status);
        Object.keys(apiResponse.headers).forEach((key: string) => {
            this._res.header(key, apiResponse.headers[key]);
        });
        this._res.end(apiResponse.data);
    };

    private getRequestConfig = () => {
        // Pass through headers from front end
        const headers = {} as Record<string, string>;
        Object.keys(this._req.headers).forEach((key: string) => {
            if (this._req.headers[key]) {
                headers[key] = this._req.headers[key]!.toString();
            }
        });

        // do not parse json response before passing through
        const transformResponse = (data: string) => data;

        return { headers, transformResponse };
    };

    private fullUrl = (url: string) => {
        return `${this._odinAPI}${url}`;
    };

    get = async (url: string) => {
        const apiResponse = await axios.get(this.fullUrl(url), this.getRequestConfig());
        this.passThroughResponse(apiResponse);
    };

    post = async (url: string, body: string) => {
        const apiResponse = await axios.post(this.fullUrl(url), body, this.getRequestConfig());
        this.passThroughResponse(apiResponse);
    };
}
