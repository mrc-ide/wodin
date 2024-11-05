import { mockBookNew, mockWriteFile } from "./mocks";
import { mockFitDataState, mockFitState, mockBasicState, mockRunState } from "../../mocks";
import { WodinModelOutputDownload } from "../../../src/excel/wodinModelOutputDownload";
import { ErrorsMutation } from "../../../src/store/errors/mutations";

const mockSolution = vi.fn().mockImplementation((options) => {
    const x = options.mode === "grid" ? [options.tStart, options.tEnd] : options.times;
    const values = [
        { name: "A", y: x.map((xVal: number) => 1 + xVal) },
        { name: "B", y: x.map((xVal: number) => 10 * xVal) },
        { name: "C", y: x.map((xVal: number) => 10 * xVal) }
    ];
    return { x, values };
});

describe("WodinModelOutputDownload", () => {
    const runState = mockRunState({
        resultOde: { solution: mockSolution } as any,
        endTime: 10,
        parameterValues: { v1: 1.1, v2: 2.2 }
    });

    const rootGetters = {
        "graphs/allSelectedVariables": ["A", "B"],
        "fitData/nonTimeColumns": ["cases", "deaths"]
    };

    beforeEach(() => {
        vi.clearAllMocks();
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
        const commit = vi.fn();

        const sut = new WodinModelOutputDownload({ rootState, rootGetters, commit } as any, "myFile.xlsx", 101);
        sut.download();

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
            sheets: [expectedModelledSheet, expectedParametersSheet]
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

        const commit = vi.fn();

        const sut = new WodinModelOutputDownload({ rootState, commit, rootGetters } as any, "myFile.xlsx", 101);
        sut.download();

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
            resultOde: {
                solution: vi.fn().mockImplementation(() => {
                    throw new Error("test error");
                })
            } as any
        };
        const rootState = mockBasicState({
            run: errorRunState
        });
        const commit = vi.fn();

        const sut = new WodinModelOutputDownload({ rootState, commit, rootGetters } as any, "myFile.xlsx", 101);
        sut.download();

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(`errors/${ErrorsMutation.AddError}`);
        expect(commit.mock.calls[0][1]).toStrictEqual({
            detail: "Error downloading to myFile.xlsx: Error: test error"
        });
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });
    });
});
