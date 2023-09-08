import * as XLSX from "xlsx";
import { WodinExcelDownload } from "./wodinExcelDownload";
import { SensitivityPlotExtreme, SensitivityPlotExtremePrefix } from "../store/sensitivity/state";
import { OdinUserType, OdinUserTypeSeriesSet } from "../types/responseTypes";
import { OdinSensitivityResult } from "../types/wrapperTypes";

interface ExtremeSummarySheetSettings {
    name: string,
    extremePrefix: SensitivityPlotExtremePrefix
    extreme: SensitivityPlotExtreme
}

const extremeSummarySheets: ExtremeSummarySheetSettings[] = [
    { name: "ValueAtMin", extremePrefix: SensitivityPlotExtremePrefix.value, extreme: SensitivityPlotExtreme.Min },
    { name: "ValueAtMax", extremePrefix: SensitivityPlotExtremePrefix.value, extreme: SensitivityPlotExtreme.Max },
    { name: "TimeAtMin", extremePrefix: SensitivityPlotExtremePrefix.time, extreme: SensitivityPlotExtreme.Min },
    { name: "TimeAtMax", extremePrefix: SensitivityPlotExtremePrefix.time, extreme: SensitivityPlotExtreme.Max }
];
export class WodinSensitivitySummaryDownload extends WodinExcelDownload {
    private _addSummarySheetFromOdinSeriesSet = (data: OdinUserTypeSeriesSet, sheetName: string) => {
        const sheetData = data.x.map((x: OdinUserType, index: number) => {
            return {
                ...x,
                ...Object.fromEntries([
                    ...data.values.map((v) => [v.name, v.y[index]])
                ])
            };
        });
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(this._workbook, worksheet, sheetName);
    };

    download = (result: OdinSensitivityResult) => {
        this._writeFile(() => {
            const { batch } = result;
            if (batch?.successfulVaryingParams?.length) {
                const varyingParams = Object.keys(batch.successfulVaryingParams[0]);
                const time = this._state.sensitivity.plotSettings.time!;

                // Value at time summary
                const valueAtTimeData = batch!.valueAtTime(time);
                this._addSummarySheetFromOdinSeriesSet(valueAtTimeData, `ValueAtTime${time}`);

                // Extreme summaries
                extremeSummarySheets.forEach((sheet) => {
                    const data = batch!.extreme(`${sheet.extremePrefix}${sheet.extreme}`);
                    this._addSummarySheetFromOdinSeriesSet(data, sheet.name);
                });
                this._addParameters(varyingParams);
            }
        });
    };
}
