import * as XLSX from "xlsx";
import {AppState} from "./store/appState/state";

export class WodinExcelDownload {
    private readonly _fileName: string;

    private readonly _points: number;

    constructor(fileName: string, points: number) {
        this._fileName = fileName;
        this._points = points;
    }

    downloadModelOutput = (state: AppState) => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([
            ["A1", "B1", "C1"],
            ["A2", "B2", "C2"],
            ["A3", "B3", "C3"]
        ]);
        XLSX.utils.book_append_sheet(workbook, worksheet, "test");
        XLSX.writeFile(workbook, this._fileName);
    };
}
