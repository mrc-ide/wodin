import { mockBookNew, mockBookAppendSheet, mockWriteFile } from "./mocks";
import { mockBasicState, mockRunState, mockSensitivityState } from "../../mocks";
import { WodinSensitivitySummaryDownload } from "../../../src/app/excel/wodinSensitivitySummaryDownload";

const xValues = [
    { beta: 1 },
    { beta: 1.1 },
    { beta: 1.2 }
];
const mockBatch = {
    successfulVaryingParams: xValues,
    valueAtTime: jest.fn().mockImplementation(() => {
        return {
            x: xValues,
            values: [
                { name: "S", y: [10, 20, 30] },
                { name: "I", y: [40, 50, 60] }
            ]
        };
    }),
    extreme: jest.fn().mockImplementation((extremeType: string) => {
        return {
            x: xValues,
            values: [
                { name: extremeType, y: [10, 20, 30] }
            ]
        };
    })
};

const xValuesMulti = [
    { beta: 1, N: 100 },
    { beta: 1, N: 1000 },
    { beta: 2, N: 100 },
    { beta: 2, N: 1000 }
];

const mockBatchMulti = {
    successfulVaryingParams: xValuesMulti,
    valueAtTime: jest.fn().mockImplementation(() => {
        return {
            x: xValuesMulti,
            values: [
                { name: "S", y: [10, 20, 30, 40] },
                { name: "I", y: [50, 60, 70, 80] }
            ]
        };
    }),
    extreme: jest.fn().mockImplementation((extremeType: string) => {
        return {
            x: xValuesMulti,
            values: [
                { name: extremeType, y: [11, 22, 33, 44] }
            ]
        };
    })
};

const plotSettings = {
    time: 50
};

const parameterValues = {
    beta: 1.1,
    N: 1000,
    D: 3
};

describe("WodinSensitivitySummaryDownload", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("downloads expected workbook for single varying parameter", () => {
        const result = {
            batch: mockBatch
        } as any;
        const rootState = mockBasicState({
            sensitivity: mockSensitivityState({
                plotSettings,
                result
            } as any),
            run: mockRunState({
                parameterValues
            })
        });
        const commit = jest.fn();
        const context = { rootState, commit } as any;
        const sut = new WodinSensitivitySummaryDownload(context, "test.xlsx");
        sut.download(result);

        expect(mockBookNew).toHaveBeenCalledTimes(1);
        expect(mockBatch.valueAtTime).toHaveBeenCalledWith(50);

        expect(mockBookAppendSheet.mock.calls[0][1]).toStrictEqual({
            data: [
                { beta: 1, S: 10, I: 40 },
                { beta: 1.1, S: 20, I: 50 },
                { beta: 1.2, S: 30, I: 60 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[0][2]).toStrictEqual("ValueAtTime50");

        expect(mockBookAppendSheet.mock.calls[1][1]).toStrictEqual({
            data: [
                { beta: 1, yMin: 10 },
                { beta: 1.1, yMin: 20 },
                { beta: 1.2, yMin: 30 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[1][2]).toStrictEqual("ValueAtMin");

        expect(mockBookAppendSheet.mock.calls[2][1]).toStrictEqual({
            data: [
                { beta: 1, yMax: 10 },
                { beta: 1.1, yMax: 20 },
                { beta: 1.2, yMax: 30 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[2][2]).toStrictEqual("ValueAtMax");

        expect(mockBookAppendSheet.mock.calls[3][1]).toStrictEqual({
            data: [
                { beta: 1, tMin: 10 },
                { beta: 1.1, tMin: 20 },
                { beta: 1.2, tMin: 30 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[3][2]).toStrictEqual("TimeAtMin");

        expect(mockBookAppendSheet.mock.calls[4][1]).toStrictEqual({
            data: [
                { beta: 1, tMax: 10 },
                { beta: 1.1, tMax: 20 },
                { beta: 1.2, tMax: 30 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[4][2]).toStrictEqual("TimeAtMax");

        expect(mockBookAppendSheet.mock.calls[5][1]).toStrictEqual({
            data: [
                { name: "N", value: 1000 },
                { name: "D", value: 3 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[5][2]).toStrictEqual("Parameters");

        expect(mockWriteFile.mock.calls[0][1]).toBe("test.xlsx");
    });

    it("downloads expected workbook for multiple varying parameter", () => {
        const result = {
            batch: mockBatchMulti
        } as any;
        const rootState = mockBasicState({
            sensitivity: mockSensitivityState({
                plotSettings
            } as any),
            multiSensitivity: {
                result
            } as any,
            run: mockRunState({
                parameterValues
            })
        });
        const commit = jest.fn();
        const context = { rootState, commit } as any;
        const sut = new WodinSensitivitySummaryDownload(context, "test.xlsx");
        sut.download(result);

        expect(mockBookNew).toHaveBeenCalledTimes(1);
        expect(mockBatchMulti.valueAtTime).toHaveBeenCalledWith(50);

        expect(mockBookAppendSheet.mock.calls[0][1]).toStrictEqual({
            data: [
                {
                    beta: 1, N: 100, S: 10, I: 50
                },
                {
                    beta: 1, N: 1000, S: 20, I: 60
                },
                {
                    beta: 2, N: 100, S: 30, I: 70
                },
                {
                    beta: 2, N: 1000, S: 40, I: 80
                }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[0][2]).toStrictEqual("ValueAtTime50");

        expect(mockBookAppendSheet.mock.calls[1][1]).toStrictEqual({
            data: [
                { beta: 1, N: 100, yMin: 11 },
                { beta: 1, N: 1000, yMin: 22 },
                { beta: 2, N: 100, yMin: 33 },
                { beta: 2, N: 1000, yMin: 44 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[1][2]).toStrictEqual("ValueAtMin");

        expect(mockBookAppendSheet.mock.calls[2][1]).toStrictEqual({
            data: [
                { beta: 1, N: 100, yMax: 11 },
                { beta: 1, N: 1000, yMax: 22 },
                { beta: 2, N: 100, yMax: 33 },
                { beta: 2, N: 1000, yMax: 44 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[2][2]).toStrictEqual("ValueAtMax");

        expect(mockBookAppendSheet.mock.calls[3][1]).toStrictEqual({
            data: [
                { beta: 1, N: 100, tMin: 11 },
                { beta: 1, N: 1000, tMin: 22 },
                { beta: 2, N: 100, tMin: 33 },
                { beta: 2, N: 1000, tMin: 44 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[3][2]).toStrictEqual("TimeAtMin");

        expect(mockBookAppendSheet.mock.calls[4][1]).toStrictEqual({
            data: [
                { beta: 1, N: 100, tMax: 11 },
                { beta: 1, N: 1000, tMax: 22 },
                { beta: 2, N: 100, tMax: 33 },
                { beta: 2, N: 1000, tMax: 44 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[4][2]).toStrictEqual("TimeAtMax");

        expect(mockBookAppendSheet.mock.calls[5][1]).toStrictEqual({
            data: [
                { name: "D", value: 3 }
            ],
            type: "json"
        });
        expect(mockBookAppendSheet.mock.calls[5][2]).toStrictEqual("Parameters");

        expect(mockWriteFile.mock.calls[0][1]).toBe("test.xlsx");
    });
});
