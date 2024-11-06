import { Commit } from "vuex";
import { parse } from "csv-parse";
import { AppCtx, Dict } from "./types/utilTypes";
import userMessages from "./userMessages";
import { WodinError } from "./types/responseTypes";
import { processFitData, ProcessFitDataResult } from "./utils";
import { SetDataPayload } from "./store/fitData/mutations";

type OnError = (error: WodinError) => void;
type OnSuccess = (success: SetDataPayload) => void;
type PostSuccess = () => void;

interface ParseError {
    message: string;
}

export class CSVUpload<S extends string, E extends string> {
    private readonly _commit: Commit;

    private _onError: OnError | null = null;

    private _onSuccess: OnSuccess | null = null;

    private _postSuccess: PostSuccess | null = null;

    constructor(context: AppCtx) {
        this._commit = context.commit;
    }

    withError = (type: E) => {
        this._onError = (error: WodinError) => {
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

    then = (postSuccess: PostSuccess) => {
        this._postSuccess = postSuccess;
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
                    const options = { columns: true };
                    const textToParse = event.target.result.toString();
                    parse(textToParse, options, (err: ParseError | undefined, rawData: Dict<string>[]) => {
                        const errorMsg = userMessages.fitData.errorLoadingData;
                        let dataError: WodinError | null = err ? { error: errorMsg, detail: err.message } : null;
                        let processResult: ProcessFitDataResult | undefined;
                        if (!dataError) {
                            processResult = processFitData(rawData, errorMsg);
                            dataError = processResult.error || null;
                        }

                        if (!dataError && processResult?.data) {
                            if (this._onSuccess) {
                                this._onSuccess(processResult);
                            }
                            if (this._postSuccess) {
                                this._postSuccess();
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
    };
}

export const csvUpload = <S extends string, E extends string>(ctx: AppCtx): CSVUpload<S, E> => new CSVUpload<S, E>(ctx);
