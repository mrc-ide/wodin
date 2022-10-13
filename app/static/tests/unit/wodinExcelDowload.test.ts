import {ErrorsMutation} from "../../src/app/store/errors/mutations";

const mockAoaToSheet = jest.fn().mockImplementation((data) => ({ data, type: "aoa" }));
const mockJsonToSheet = jest.fn().mockImplementation((data) => ({ data, type: "json" }));
const mockBookNew = jest.fn().mockImplementation(() => ({ sheets: [] } as any));
const mockBookAppendSheet = jest.fn().mockImplementation((workbook: any, worksheet: any, name: string) => {
    (workbook as any).sheets.push({ ...worksheet, name });
});
const mockWriteFile = jest.fn();

jest.mock("xlsx", () => ({
    writeFile: (data: string, fileName: string) => mockWriteFile(data, fileName),
    utils: {
        aoa_to_sheet: (data: any) => mockAoaToSheet(data),
        json_to_sheet: (data: any) => mockJsonToSheet(data),
        book_new: () => mockBookNew(),
        book_append_sheet: (wb: any, ws: any, name: string) => mockBookAppendSheet(wb, ws, name)
    }
}));

/* eslint-disable import/first */
import {
    mockBasicState, mockFitDataState, mockFitState, mockRunState
} from "../mocks";
import { WodinExcelDownload } from "../../src/app/wodinExcelDownload";

const mockSolution = jest.fn().mockImplementation((options) => {
    const x = options.mode === "grid" ? [options.tStart, options.tEnd] : options.times;
    const names = ["A", "B"];
    const y = [
        x.map((xVal: number) => 1 + xVal),
        x.map((xVal: number) => 10 * xVal)
    ];
    return { x, names, y };
});

describe("WodinExcelDownload", () => {
    const runState = mockRunState({
        result: { solution: mockSolution } as any,
        endTime: 10,
        parameterValues: { v1: 1.1, v2: 2.2 }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const expectedModelledSheet = {
        name: "Modelled",
        type: "aoa",
        data: [
            ["t", "A", "B"],
            [0, 1, 0],
            [10, 11, 100]
        ]
    };

    const expectedParametersSheet = {
        name: "Parameters",
        type: "json",
        data: [
            { name: "v1", value: 1.1 },
            { name: "v2", value: 2.2 }
        ]
    };

    it("downloads expected workbook for Basic app", () => {
        const rootState = mockBasicState({
            run: runState
        });
        const commit = jest.fn();

        const sut = new WodinExcelDownload({ rootState, commit } as any, "myFile.xlsx", 101);
        sut.downloadModelOutput();

        expect(commit).not.toHaveBeenCalled();
        expect(mockBookNew).toHaveBeenCalledTimes(1);
        expect(mockSolution).toHaveBeenCalledTimes(1);
        expect(mockSolution.mock.calls[0][0]).toStrictEqual({
            mode: "grid",
            tStart: 0,
            tEnd: 10,
            nPoints: 101
        });

        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile.mock.calls[0][0]).toStrictEqual({
            sheets: [
                expectedModelledSheet,
                expectedParametersSheet
            ]
        });
        expect(mockWriteFile.mock.calls[0][1]).toBe("myFile.xlsx");
    });

    it("downloads expected workbook for Fit app", () => {
        const rootState = mockFitState({
            run: runState,
            fitData: mockFitDataState({
                data: [
                    { time: 0, cases: 1, deaths: 2 },
                    { time: 2, cases: 3, deaths: 4 }
                ],
                timeVariable: "time"
            })
        });

        const rootGetters = {
            "fitData/nonTimeColumns": ["cases", "deaths"]
        };

        const commit = jest.fn();

        const sut = new WodinExcelDownload({ rootState, commit, rootGetters } as any, "myFile.xlsx", 101);
        sut.downloadModelOutput();

        expect(commit).not.toHaveBeenCalled();
        expect(mockBookNew).toHaveBeenCalledTimes(1);
        expect(mockSolution).toHaveBeenCalledTimes(2);
        expect(mockSolution.mock.calls[0][0]).toStrictEqual({
            mode: "grid",
            tStart: 0,
            tEnd: 10,
            nPoints: 101
        });
        expect(mockSolution.mock.calls[1][0]).toStrictEqual({
            mode: "given",
            times: [0, 2]
        });

        expect(mockWriteFile).toHaveBeenCalledTimes(1);
        expect(mockWriteFile.mock.calls[0][0]).toStrictEqual({
            sheets: [
                expectedModelledSheet,
                {
                    name: "Modelled with Data",
                    type: "aoa",
                    data: [
                        ["t", "A", "B", "cases", "deaths"],
                        [0, 1, 0, 1, 2],
                        [2, 3, 20, 3, 4]
                    ]
                },
                expectedParametersSheet
            ]
        });
        expect(mockWriteFile.mock.calls[0][1]).toBe("myFile.xlsx");
    });

    it("commits any error thrown during download", () => {
        const errorRunState = {
            ...runState,
            result: {
                solution: jest.fn().mockImplementation(() => { throw "test error"; } )
            } as any,
        };
        const rootState = mockBasicState({
            run: errorRunState
        });
        const commit = jest.fn();

        const sut = new WodinExcelDownload({ rootState, commit } as any, "myFile.xlsx", 101);
        sut.downloadModelOutput();

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            detail: "Error downloading to myFile.xlsx: test error"
        });
        expect(commit.mock.calls[0][2]).toStrictEqual({root: true});
    });
});
