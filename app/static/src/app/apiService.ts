/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios, { AxiosError, AxiosResponse } from "axios";
import { Commit } from "vuex";
import { freezer } from "./utils";
import { WodinError, ResponseSuccess, ResponseFailure } from "./types/responseTypes";
import { AppCtx } from "./types/utilTypes";
import { ErrorsMutation } from "./store/errors/mutations";
import { AppState } from "./store/appState/state";

export interface ResponseWithType<T> extends ResponseSuccess {
    data: T
}

export function isAPIError(object: any): object is WodinError {
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
    ignoreSuccess: () => API<S, E>

    get<T>(url: string): Promise<void | ResponseWithType<T>>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OnError = (failure: ResponseFailure) => void;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type OnSuccess = (success: ResponseSuccess) => void;

export class APIService<S extends string, E extends string> implements API<S, E> {
    private readonly _commit: Commit;

    private readonly _baseUrl: string;

    constructor(context: AppCtx) {
        this._commit = context.commit;
        this._baseUrl = (context.rootState as AppState).baseUrl!;
    }

    private _ignoreErrors = false;

    private _ignoreSuccess = false;

    private _freezeResponse = false;

    static getFirstErrorFromFailure = (failure: ResponseFailure) => {
        if (failure.errors.length === 0) {
            return APIService
                .createError("API response failed but did not contain any error information. Please contact support.");
        }
        return failure.errors[0];
    };

    static createError(detail: string): WodinError {
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
            try {
                this._commit(type, APIService.getFirstErrorFromFailure(failure), { root });
            } catch (e) {
                this._commitError({
                    error: "COMMIT_EXCEPTION",
                    detail: `Exception committing error response to ${type}: ${e}`
                });
            }
        };
        return this;
    };

    ignoreErrors = () => {
        this._ignoreErrors = true;
        return this;
    };

    ignoreSuccess = () => {
        this._ignoreSuccess = true;
        return this;
    };

    withSuccess = (type: S, root = false) => {
        this._onSuccess = (data: any) => {
            const finalData = this._freezeResponse ? freezer.deepFreeze(data) : data;
            try {
                this._commit(type, finalData, { root });
            } catch (e) {
                this._commitError({
                    error: "COMMIT_EXCEPTION",
                    detail: `Exception committing success response to ${type}: ${e}`
                });
            }
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
            this._commitError(APIService.createError(
                `Could not parse API response with status ${e.response?.status}. Please contact support.`));
        } else if (this._onError) {
            this._onError(failure);
        } else {
            this._commitError(APIService.getFirstErrorFromFailure(failure));
        }
    };

    private _commitError = (error: WodinError) => {
        this._commit(`errors/${ErrorsMutation.AddError}`, error, { root: true });
    };

    private _verifyHandlers(url: string) {
        if (this._onError == null && !this._ignoreErrors) {
            console.warn(`No error handler registered for request ${url}.`);
        }
        if (this._onSuccess == null && !this._ignoreSuccess) {
            console.warn(`No success handler registered for request ${url}.`);
        }
    }

    private _fullUrl(url: string) {
        return `${this._baseUrl}${url}`;
    }

    async get<T>(url: string): Promise<void | ResponseWithType<T>> {
        this._verifyHandlers(url);
        const fullUrl = this._fullUrl(url);

        return this._handleAxiosResponse(axios.get(fullUrl));
    }

    async post<T>(url: string, body: any, contentType = "application/json"): Promise<void | ResponseWithType<T>> {
        this._verifyHandlers(url);
        const headers = { "Content-Type": contentType };
        const fullUrl = this._fullUrl(url);
        return this._handleAxiosResponse(axios.post(fullUrl, body, { headers }));
    }
}

export const api = <S extends string, E extends string>(ctx: AppCtx): APIService<S, E> => new APIService<S, E>(ctx);
