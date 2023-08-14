import * as XLSX from "xlsx";
import { WodinExcelDownload } from "./wodinExcelDownload";
import { AppCtx, Dict } from "../types/utilTypes";
import { OdinSeriesSet } from "../types/responseTypes";
import { FitData } from "../store/fitData/state";
import { AppType } from "../store/appState/state";
import { FitState } from "../store/fit/state";
import { FitDataGetter } from "../store/fitData/getters";

export class WodinModelOutputDownload extends WodinExcelDownload {
    private readonly _points: number;

    constructor(context: AppCtx, fileName: string, points: number) {
        super(context, fileName);
        this._points = points;
    }

    // Shared method to generate both Modelled and Modelled with Data - provide empty nonTimeColumns param to omit data
    // for Modelled only
    private static _generateModelledOutput(selectedVariables: string[],
        solutionOutput: OdinSeriesSet,
        nonTimeColumns: string[],
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
            const { selectedVariables } = this._state.model;

            const worksheet = WodinModelOutputDownload._generateModelledOutput(
                selectedVariables, solutionOutput, [], null);
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
                const { selectedVariables } = this._state.model;

                const worksheet = WodinModelOutputDownload._generateModelledOutput(
                    selectedVariables, solutionOutput, nonTimeColumns, fitData
                );
                XLSX.utils.book_append_sheet(this._workbook, worksheet, "Modelled with Data");
            }
        }
    }

    download = () => {
        this._writeFile(() => {
            this._addModelledValues();
            this._addModelledWithDataValues();
            this._addParameters();
        });
    };
}
