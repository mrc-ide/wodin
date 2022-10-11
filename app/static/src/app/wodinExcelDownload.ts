import * as XLSX from "xlsx";
import { AppState, AppType } from "./store/appState/state";
import { FitState } from "./store/fit/state";
import {Dict} from "./types/utilTypes";
import {OdinSeriesSet} from "./types/responseTypes";

export class WodinExcelDownload {
    private readonly _state: AppState;

    private readonly _fileName: string;

    private readonly _points: number;

    constructor(state: AppState, fileName: string, points: number) {
        this._state = state;
        this._fileName = fileName;
        this._points = points;
    }

    private _addModelledValues(workbook: XLSX.WorkBook) {
        const solution = this._state.run.result?.solution;
        if (solution) {
            const end = this._state.run.endTime;
            const solutionOutput = solution({
                mode: "grid", tStart: 0, tEnd: end, nPoints: this._points
            });

            const outputData = [];
            outputData.push(["t", ...solutionOutput.names]); // headers
            solutionOutput.x.forEach((x: number, xIdx: number) => {
                outputData.push([
                    x,
                    ...solutionOutput.names.map((name: string, nameIdx: number) => solutionOutput.y[nameIdx][xIdx])
                ]);
            });


            const worksheet = XLSX.utils.aoa_to_sheet(outputData);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Modelled");
        }
    }

    private _addModelledWithDataValues(workbook: XLSX.WorkBook) {
        const solution = this._state.run.result?.solution;
        if (solution && this._state.appType === AppType.Fit) {
            const fitState = this._state as FitState;
            const fitData = fitState.fitData.data;
            const {timeVariable} = fitState.fitData;
            if (fitData && timeVariable) {
                const times = fitData.map((row: Dict<number>) => row[timeVariable]);
                const solutionOutput = solution({ mode: "given", times });

                const outputData = [];
                outputData.push(["t", ...solutionOutput.names]); // headers
                solutionOutput.x.forEach((x: number, xIdx: number) => {
                    outputData.push([
                        x,
                        ...solutionOutput.names.map((name: string, nameIdx: number) => solutionOutput.y[nameIdx][xIdx])
                    ]);
                });

                // TODO: include data values, and possibly use common method for both data sheets
                // TODO: move button to top of tab? Enable button only if !runRequired? Or just if any plot..

                const worksheet = XLSX.utils.aoa_to_sheet(outputData);
                XLSX.utils.book_append_sheet(workbook, worksheet, "Modelled with Data");
            }
        }
    }

    private _addParameters(workbook: XLSX.WorkBook) {
        const paramVals = this._state.run.parameterValues;
        if (paramVals) {
            const paramData = Object.keys(paramVals).map((name: string) => { return { name, value: paramVals[name] }; });
            const worksheet = XLSX.utils.json_to_sheet(paramData);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Parameters");
        }
    }

    downloadModelOutput = () => {
        const workbook = XLSX.utils.book_new();
        this._addModelledValues(workbook);
        this._addModelledWithDataValues(workbook);
        this._addParameters(workbook);
        XLSX.writeFile(workbook, this._fileName);
    };
}
