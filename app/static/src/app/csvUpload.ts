import { Commit } from "vuex";
import { parse } from "csv-parse";
import { AppCtx } from "./types/utilTypes";
import userMessages from "./userMessages";
import { Error } from "./types/responseTypes";
import { processFitData, ProcessFitDataResult } from "./utils";
import { SetDataPayload } from "./store/fitData/mutations";

type OnError = (error: Error) => void;
type OnSuccess = (success: SetDataPayload) => void;

export class CSVUpload<S extends string, E extends string> {
    private readonly _commit: Commit;

    private _onError: OnError | null = null;

    private _onSuccess: OnSuccess | null = null;

    constructor(context: AppCtx) {
        this._commit = context.commit;
    }

    withError = (type: E) => {
        this._onError = (error: Error) => {
            this._commit(type, error);
        };
        return this;
    };

    withSuccess = (type: S) => {
        this._onSuccess = (success: SetDataPayload) => {
            this._commit(type, success);
        };
        return this;
    };

    private _verifyHandlers() {
        if (this._onError == null) {
            console.warn("No error handler registered for CSVUpload.");
        }
        if (this._onSuccess == null) {
            console.warn("No success handler registered for CSVUpload.");
        }
    }

    upload = (file: File) => {
        this._verifyHandlers();
        if (file) {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    parse(event.target.result.toString(), { columns: true }, (err, rawData) => {
                        const errorMsg = userMessages.fitData.errorLoadingData;
                        let dataError: Error | null = err ? { error: errorMsg, detail: err.message } : null;
                        let processResult: ProcessFitDataResult | undefined;
                        if (!dataError) {
                            processResult = processFitData(rawData, errorMsg);
                            dataError = processResult.error;
                        }

                        if (!dataError && processResult?.data) {
                            const columns = Object.keys(processResult.data[0]);
                            if (this._onSuccess) {
                                this._onSuccess({ data: processResult.data, columns });
                            }
                        } else if (this._onError) {
                            this._onError(dataError!);
                        }
                    });
                }
            };

            reader.onerror = () => {
                if (this._onError) {
                    const detail = reader.error?.message || null;
                    const error = { error: userMessages.fitData.errorReadingFile, detail };
                    this._onError(error);
                }
            };

            reader.readAsText(file, "UTF-8");
        }
    }
}

export const csvUpload = <S extends string, E extends string>(ctx: AppCtx): CSVUpload<S, E> => new CSVUpload<S, E>(ctx);
