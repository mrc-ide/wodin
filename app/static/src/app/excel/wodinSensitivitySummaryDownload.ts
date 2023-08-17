import * as XLSX from "xlsx";
import { WodinExcelDownload } from "./wodinExcelDownload";
import { SensitivityPlotExtreme, SensitivityPlotExtremePrefix } from "../store/sensitivity/state";
import { OdinSeriesSet } from "../types/responseTypes";

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
    private _addSummarySheetFromOdinSeriesSet = (data: OdinSeriesSet, varyingParameter: string, sheetName: string) => {
        const sheetData = data.x.map((x: number, index: number) => {
            return Object.fromEntries([
                [varyingParameter, x],
                ...data.values.map((v) => [v.name, v.y[index]])
            ]);
        });
        const worksheet = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(this._workbook, worksheet, sheetName);
    };

    download = () => {
        this._writeFile(() => {
            const { sensitivity } = this._state;
            const { batch } = sensitivity.result!;
            const varyingParameter = sensitivity.paramSettings.parameterToVary!;
            const time = sensitivity.plotSettings.time!;

            // Value at time summary
            const valueAtTimeData = batch!.valueAtTime(time);
            this._addSummarySheetFromOdinSeriesSet(valueAtTimeData, varyingParameter, `ValueAtTime${time}`);

            // Extreme summaries
            extremeSummarySheets.forEach((sheet) => {
                const data = batch!.extreme(`${sheet.extremePrefix}${sheet.extreme}`);
                this._addSummarySheetFromOdinSeriesSet(data, varyingParameter, sheet.name);
            });
            this._addParameters([varyingParameter]);
        });
    };
}
