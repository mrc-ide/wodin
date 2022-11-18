import * as XLSX from "xlsx";
import { Commit } from "vuex";
import { AppState, AppType } from "./store/appState/state";
import { FitState } from "./store/fit/state";
import { AppCtx, Dict } from "./types/utilTypes";
import { OdinSeriesSet } from "./types/responseTypes";
import { FitDataGetter } from "./store/fitData/getters";
import { FitData } from "./store/fitData/state";
import { ErrorsMutation } from "./store/errors/mutations";

export class WodinExcelDownload {
    private readonly _state: AppState;

    private readonly _rootGetters: any;

    private readonly _commit: Commit;

    private readonly _fileName: string;

    private readonly _points: number;

    private readonly _workbook: XLSX.WorkBook;

    constructor(context: AppCtx, fileName: string, points: number) {
        this._state = context.rootState;
        this._rootGetters = context.rootGetters;
        this._commit = context.commit;
        this._fileName = fileName;
        this._points = points;
        this._workbook = XLSX.utils.book_new();
    }

    // Shared method to generate both Modelled and Modelled with Data - provide empty nonTimeColumns param to omit data
    // for Modelled only
    private static _generateModelledOutput(selectedVariables: string[], solutionOutput: OdinSeriesSet, nonTimeColumns: string[],
        fitData: FitData | null) {
        const outputData = [];
        outputData.push(["t", ...selectedVariables, ...nonTimeColumns]); // headers
        solutionOutput.x.forEach((x: number, xIdx: number) => {
            outputData.push([
                x,
                ...selectedVariables.map((v) => solutionOutput.values.find((so) => so.name === v)!.y[xIdx]),
                ...nonTimeColumns.map((column: string) => (fitData as FitData)[xIdx][column])
            ]);
        });
        return XLSX.utils.aoa_to_sheet(outputData);
    }

    private _addModelledValues() {
        const solution = this._state.run.resultOde?.solution;
        if (solution) {
            const end = this._state.run.endTime;
            const solutionOutput = solution({
                mode: "grid", tStart: 0, tEnd: end, nPoints: this._points
            });
            const {selectedVariables} = this._state.model;

            const worksheet = WodinExcelDownload._generateModelledOutput(selectedVariables, solutionOutput, [], null);
            XLSX.utils.book_append_sheet(this._workbook, worksheet, "Modelled");
        }
    }

    private _addModelledWithDataValues() {
        const solution = this._state.run.resultOde?.solution;
        if (solution && this._state.appType === AppType.Fit) {
            const fitState = this._state as FitState;
            const fitData = fitState.fitData.data;
            const { timeVariable } = fitState.fitData;
            const nonTimeColumns = this._rootGetters[`fitData/${FitDataGetter.nonTimeColumns}`];
            if (fitData && timeVariable) {
                const times = fitData.map((row: Dict<number>) => row[timeVariable]);
                const solutionOutput = solution({ mode: "given", times });
                const {selectedVariables} = this._state.model;

                const worksheet = WodinExcelDownload._generateModelledOutput(selectedVariables, solutionOutput, nonTimeColumns, fitData);
                XLSX.utils.book_append_sheet(this._workbook, worksheet, "Modelled with Data");
            }
        }
    }

    private _addParameters() {
        const paramVals = this._state.run.parameterValues;
        if (paramVals) {
            const paramData = Object.keys(paramVals).map((name: string) => {
                return { name, value: paramVals[name] };
            });
            const worksheet = XLSX.utils.json_to_sheet(paramData);
            XLSX.utils.book_append_sheet(this._workbook, worksheet, "Parameters");
        }
    }

    downloadModelOutput = () => {
        try {
            this._addModelledValues();
            this._addModelledWithDataValues();
            this._addParameters();
            XLSX.writeFile(this._workbook, this._fileName);
        } catch (e) {
            this._commit(`errors/${ErrorsMutation.AddError}`,
                { detail: `Error downloading to ${this._fileName}: ${e}` }, { root: true });
        }
    };
}
