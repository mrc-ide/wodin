import * as XLSX from "xlsx";
import { Commit } from "vuex";
import { AppState } from "../store/appState/state";
import { AppCtx } from "../types/utilTypes";
import { ErrorsMutation } from "../store/errors/mutations";

export abstract class WodinExcelDownload<State> {
    private readonly _fileName: string;

    protected readonly _state: AppState;

    protected readonly _rootGetters: AppCtx<State>["rootGetters"];

    protected readonly _commit: Commit;

    protected readonly _workbook: XLSX.WorkBook;

    constructor(context: AppCtx<State>, fileName: string) {
        this._state = context.rootState;
        this._rootGetters = context.rootGetters;
        this._commit = context.commit;
        this._fileName = fileName;
        this._workbook = XLSX.utils.book_new();
    }

    protected _addParameters(excludeParams: string[] = []): void {
        const paramVals = this._state.run.parameterValues;
        if (paramVals) {
            const paramData = Object.keys(paramVals)
                .filter((name: string) => !excludeParams.includes(name))
                .map((name: string) => {
                    return { name, value: paramVals[name] };
                });
            const worksheet = XLSX.utils.json_to_sheet(paramData);
            XLSX.utils.book_append_sheet(this._workbook, worksheet, "Parameters");
        }
    }

    protected _writeFile(buildWorkbook: () => void): void {
        try {
            buildWorkbook();
            XLSX.writeFile(this._workbook, this._fileName);
        } catch (e) {
            this._commit(
                `errors/${ErrorsMutation.AddError}`,
                { detail: `Error downloading to ${this._fileName}: ${e}` },
                { root: true }
            );
        }
    }
}
