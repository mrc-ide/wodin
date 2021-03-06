/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios, { AxiosError, AxiosResponse } from "axios";
import { Commit } from "vuex";
import { freezer } from "./utils";
import { Error, ResponseSuccess, ResponseFailure } from "./types/responseTypes";
import { AppCtx } from "./types/utilTypes";
import { ErrorsMutation } from "./store/errors/mutations";

export interface ResponseWithType<T> extends ResponseSuccess {
    data: T
}

export function isAPIError(object: any): object is Error {
    return typeof object.error === "string"
        && (object.details === undefined || typeof object.details === "string");
}

export function isAPIResponseFailure(object: any): object is ResponseFailure {
    return object && object.status === "failure"
        && (Array.isArray(object.errors))
        && object.errors.every((e: any) => isAPIError(e));
}

export interface API<S, E> {

    withError: (type: E, root: boolean) => API<S, E>
    withSuccess: (type: S, root: boolean) => API<S, E>
    ignoreErrors: () => API<S, E>

    get<T>(url: string): Promise<void | ResponseWithType<T>>
}

type OnError = (failure: ResponseFailure) => void;
type OnSuccess = (success: ResponseSuccess) => void;

export class APIService<S extends string, E extends string> implements API<S, E> {
    private readonly _commit: Commit;

    constructor(context: AppCtx) {
        this._commit = context.commit;
    }

    private _ignoreErrors = false;

    private _freezeResponse = false;

    static getFirstErrorFromFailure = (failure: ResponseFailure) => {
        if (failure.errors.length === 0) {
            return APIService
                .createError("API response failed but did not contain any error information. Please contact support.");
        }
        return failure.errors[0];
    };

    static createError(detail: string): Error {
        return {
            error: "MALFORMED_RESPONSE",
            detail
        };
    }

    private _onError: OnError | null = null;

    private _onSuccess: OnSuccess | null = null;

    freezeResponse = () => {
        this._freezeResponse = true;
        return this;
    };

    withError = (type: E, root = false) => {
        this._onError = (failure: ResponseFailure) => {
            this._commit(type, APIService.getFirstErrorFromFailure(failure), { root });
        };
        return this;
    };

    ignoreErrors = () => {
        this._ignoreErrors = true;
        return this;
    };

    withSuccess = (type: S, root = false) => {
        this._onSuccess = (data: any) => {
            const finalData = this._freezeResponse ? freezer.deepFreeze(data) : data;
            this._commit(type, finalData, { root });
        };
        return this;
    };

    private _handleAxiosResponse(promise: Promise<AxiosResponse>) {
        return promise.then((axiosResponse: AxiosResponse) => {
            const success = axiosResponse && axiosResponse.data;
            const { data } = success;
            if (this._onSuccess) {
                this._onSuccess(data);
            }
            return axiosResponse.data;
        }).catch((e: AxiosError) => {
            return this._handleError(e);
        });
    }

    private _handleError = (e: AxiosError) => {
        console.log(e.response?.data || e);
        if (this._ignoreErrors) {
            return;
        }

        const failure = e.response && e.response.data;

        if (!isAPIResponseFailure(failure)) {
            this._commitError(APIService.createError("Could not parse API response. Please contact support."));
        } else if (this._onError) {
            this._onError(failure);
        } else {
            this._commitError(APIService.getFirstErrorFromFailure(failure));
        }
    };

    private _commitError = (error: Error) => {
        this._commit({ type: `errors/${ErrorsMutation.AddError}`, payload: error }, { root: true });
    };

    private _verifyHandlers(url: string) {
        if (this._onError == null && !this._ignoreErrors) {
            console.warn(`No error handler registered for request ${url}.`);
        }
        if (this._onSuccess == null) {
            console.warn(`No success handler registered for request ${url}.`);
        }
    }

    async get<T>(url: string): Promise<void | ResponseWithType<T>> {
        this._verifyHandlers(url);
        return this._handleAxiosResponse(axios.get(url));
    }

    async post<T>(url: string, body: any): Promise<void | ResponseWithType<T>> {
        this._verifyHandlers(url);
        const headers = { "Content-Type": "application/json" };
        return this._handleAxiosResponse(axios.post(url, body, { headers }));
    }
}

export const api = <S extends string, E extends string>(ctx: AppCtx): APIService<S, E> => new APIService<S, E>(ctx);
