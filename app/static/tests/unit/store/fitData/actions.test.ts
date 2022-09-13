import { actions, FitDataAction } from "../../../../src/app/store/fitData/actions";
import { FitDataMutation } from "../../../../src/app/store/fitData/mutations";
import resetAllMocks = jest.resetAllMocks;
import { mockFitDataState } from "../../../mocks";
import { fileTimeout } from "../../../testUtils";
import { ModelFitMutation } from "../../../../src/app/store/modelFit/mutations";
import { RunMutation } from "../../../../src/app/store/run/mutations";
import { SensitivityMutation } from "../../../../src/app/store/sensitivity/mutations";

describe("Fit Data actions", () => {
    const file = { name: "testFile" } as any;

    const getMockFileReader = (csvData: string) => {
        const mockFileReader = {} as any;
        const readAsText = jest.fn().mockImplementation(() => {
            mockFileReader.onload({
                target: {
                    result: csvData
                }
            });
        });
        mockFileReader.readAsText = readAsText;
        jest.spyOn(global, "FileReader").mockImplementation(() => mockFileReader);

        return mockFileReader;
    };

    afterEach(() => {
        resetAllMocks();
    });

    const expectFileRead = (mockFileReader: any) => {
        expect(mockFileReader.readAsText).toHaveBeenCalledTimes(1);
        expect(mockFileReader.readAsText.mock.calls[0][0]).toBe(file);
        expect(mockFileReader.readAsText.mock.calls[0][1]).toBe("UTF-8");
    };

    it("Upload commits data and updates linked variables on success", (done) => {
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4\n5,6\n7,8\n9,1");
        const mockGetters = {
            nonTimeColumns: ["a"]
        };
        const mockRootState = {
            model: {
                odinModelResponse: {
                    valid: true,
                    metadata: {
                        variables: ["X", "Y"]
                    }
                }
            }
        };
        const mockData = [
            { a: 1, b: 2 },
            { a: 3, b: 4 },
            { a: 5, b: 6 },
            { a: 7, b: 8 },
            { a: 9, b: 1 }
        ];
        const mockState = {
            linkedVariables: { a: "X", b: "Y" },
            data: mockData,
            timeVariable: "a"
        };

        const commit = jest.fn();
        const context = {
            commit,
            state: mockState,
            rootState: mockRootState,
            getters: mockGetters
        };
        (actions[FitDataAction.Upload] as any)(context, file);
        expectFileRead(mockFileReader);
        setTimeout(() => {
            expect(commit).toHaveBeenCalledTimes(6);
            expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetData);
            const expectedSetDataPayload = {
                data: mockData,
                columns: ["a", "b"],
                timeVariableCandidates: ["a"]
            };
            expect(commit.mock.calls[0][1]).toStrictEqual(expectedSetDataPayload);
            expect(commit.mock.calls[1][0]).toBe(FitDataMutation.SetLinkedVariables);
            expect(commit.mock.calls[1][1]).toStrictEqual({ a: "X" });
            expect(commit.mock.calls[2][0]).toBe(`run/${RunMutation.SetEndTime}`);
            expect(commit.mock.calls[2][1]).toBe(9);
            expect(commit.mock.calls[2][2]).toStrictEqual({ root: true });
            expect(commit.mock.calls[3][0]).toBe(`sensitivity/${SensitivityMutation.SetEndTime}`);
            expect(commit.mock.calls[3][1]).toStrictEqual(9);
            expect(commit.mock.calls[3][2]).toStrictEqual({ root: true });
            expect(commit.mock.calls[4][0]).toBe(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`);
            expect(commit.mock.calls[4][1]).toStrictEqual({ linkChanged: true });
            expect(commit.mock.calls[4][2]).toStrictEqual({ root: true });
            expect(commit.mock.calls[5][0]).toBe(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`);
            expect(commit.mock.calls[5][1]).toStrictEqual({ dataChanged: true });
            expect(commit.mock.calls[5][2]).toStrictEqual({ root: true });
            done();
        }, fileTimeout);
    });

    it("Upload commits csv parse error", (done) => {
        const mockFileReader = getMockFileReader("a,b\n1,2,3");

        const commit = jest.fn();
        (actions[FitDataAction.Upload] as any)({ commit }, file);
        expectFileRead(mockFileReader);
        setTimeout(() => {
            expect(commit).toHaveBeenCalledTimes(1);
            expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetError);
            const expectedError = {
                error: "An error occurred when loading data",
                detail: "Invalid Record Length: columns length is 2, got 3 on line 2"
            };
            expect(commit.mock.calls[0][1]).toStrictEqual(expectedError);
            done();
        }, fileTimeout);
    });

    it("Upload commits csv processing error", (done) => {
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4");

        const commit = jest.fn();
        (actions[FitDataAction.Upload] as any)({ commit }, file);
        expectFileRead(mockFileReader);
        setTimeout(() => {
            expect(commit).toHaveBeenCalledTimes(1);
            expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetError);
            const expectedError = {
                error: "An error occurred when loading data",
                detail: "File must contain at least 5 data rows."
            };
            expect(commit.mock.calls[0][1]).toStrictEqual(expectedError);
            done();
        }, fileTimeout);
    });

    it("Upload commits file read error", (done) => {
        const mockFileReader = {} as any;
        const readAsText = jest.fn().mockImplementation(() => {
            mockFileReader.error = { message: "File cannot be read" };
            mockFileReader.onerror();
        });
        mockFileReader.readAsText = readAsText;
        jest.spyOn(global, "FileReader").mockImplementation(() => mockFileReader);

        const commit = jest.fn();
        (actions[FitDataAction.Upload] as any)({ commit }, file);
        expectFileRead(mockFileReader);
        setTimeout(() => {
            expect(commit).toHaveBeenCalledTimes(1);
            expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetError);
            const expectedError = {
                error: "An error occurred when reading data file",
                detail: "File cannot be read"
            };
            expect(commit.mock.calls[0][1]).toStrictEqual(expectedError);
            done();
        }, fileTimeout);
    });

    it("Upload does nothing if file is not set", (done) => {
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4\n");

        const commit = jest.fn();
        (actions[FitDataAction.Upload] as any)({ commit }, null);
        expect(mockFileReader.readAsText).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(commit).not.toHaveBeenCalled();
            done();
        }, fileTimeout);
    });

    const getters = {
        nonTimeColumns: ["old1", "old3", "new"]
    };

    const state = mockFitDataState({
        linkedVariables: {
            old1: "A",
            old2: "B",
            old3: "C"
        }
    });

    it("update linked variables retains existing links if possible when model is valid", () => {
        const rootState = {
            model: {
                odinModelResponse: {
                    valid: true,
                    metadata: {
                        variables: ["B", "C", "D"]
                    }
                }
            }
        };

        const commit = jest.fn();

        (actions[FitDataAction.UpdateLinkedVariables] as any)({
            commit, state, rootState, getters
        });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetLinkedVariables);
        expect(commit.mock.calls[0][1]).toStrictEqual({ old1: null, old3: "C", new: null });
    });

    it("update linked variables without retaining existing links when model is not valid", () => {
        const rootState = {
            model: {
                odinModelResponse: {
                    valid: false,
                    metadata: {
                        variables: ["B", "C", "D"]
                    }
                }
            }
        };

        const commit = jest.fn();

        (actions[FitDataAction.UpdateLinkedVariables] as any)({
            commit, state, rootState, getters
        });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetLinkedVariables);
        expect(commit.mock.calls[0][1]).toStrictEqual({ old1: null, old3: null, new: null });
    });

    it("Update time variable commits new time variable and updates linked variables", () => {
        const mockData = [
            { Day1: 1, Day2: 2, Cases: 10 },
            { Day1: 3, Day2: 4, Cases: 11 },
            { Day1: 5, Day2: 6, Cases: 12 },
            { Day1: 7, Day2: 8, Cases: 13 },
            { Day1: 9, Day2: 10, Cases: 14 }
        ];

        const testState = {
            timeVariable: "Day2",
            columns: ["Day1", "Day2", "Cases"],
            linkedVariables: {
                Day2: "A",
                Cases: "B"
            },
            data: mockData
        };

        const rootState = {
            model: {
                odinModelResponse: {
                    valid: true,
                    metadata: {
                        variables: ["A", "B", "C"]
                    }
                }
            }
        };

        // mock the getter result we should get after the mutation has been committed
        const testGetters = {
            nonTimeColumns: ["Day1", "Cases"]
        };

        const commit = jest.fn().mockImplementation((type: FitDataMutation, payload: string) => {
            if (type === FitDataMutation.SetTimeVariable) {
                state.timeVariable = payload;
            }
        });
        (actions[FitDataAction.UpdateTimeVariable] as any)({
            commit, state: testState, rootState, getters: testGetters
        }, "Day2");
        expect(commit).toHaveBeenCalledTimes(5);
        expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetTimeVariable);
        expect(commit.mock.calls[0][1]).toBe("Day2");
        expect(commit.mock.calls[1][0]).toBe(FitDataMutation.SetLinkedVariables);
        expect(commit.mock.calls[1][1]).toStrictEqual({ Day1: null, Cases: "B" });
        expect(commit.mock.calls[2][0]).toBe(`run/${RunMutation.SetEndTime}`);
        expect(commit.mock.calls[2][1]).toBe(10);
        expect(commit.mock.calls[2][2]).toStrictEqual({ root: true });
        expect(commit.mock.calls[3][0]).toBe(`sensitivity/${SensitivityMutation.SetEndTime}`);
        expect(commit.mock.calls[3][1]).toStrictEqual(10);
        expect(commit.mock.calls[3][2]).toStrictEqual({ root: true });
        expect(commit.mock.calls[4][0]).toBe(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`);
        expect(commit.mock.calls[4][1]).toStrictEqual({ linkChanged: true });
        expect(commit.mock.calls[4][2]).toStrictEqual({ root: true });
    });

    it("UpdateLinkedVariable sets link and sets fitUpdate required if column is columnToFit", () => {
        const commit = jest.fn();
        const testState = {
            columnToFit: "a"
        };

        const payload = { column: "a", variable: "I" };
        (actions[FitDataAction.UpdateLinkedVariable] as any)({ commit, state: testState }, payload);
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetLinkedVariable);
        expect(commit.mock.calls[0][1]).toBe(payload);
        expect(commit.mock.calls[1][0]).toBe(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`);
        expect(commit.mock.calls[1][1]).toStrictEqual({ linkChanged: true });
        expect(commit.mock.calls[1][2]).toStrictEqual({ root: true });
    });

    it("UpdateLinkedVariable does not set fitUpdate required if column is not columnToFit", () => {
        const commit = jest.fn();
        const testState = {
            columnToFit: "a"
        };

        const payload = { column: "b", variable: "I" };
        (actions[FitDataAction.UpdateLinkedVariable] as any)({ commit, state: testState }, payload);
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetLinkedVariable);
        expect(commit.mock.calls[0][1]).toBe(payload);
    });

    it("updates column to fit", () => {
        const commit = jest.fn();
        (actions[FitDataAction.UpdateColumnToFit] as any)({ commit }, "col1");
        expect(commit).toHaveBeenCalledTimes(2);
        expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetColumnToFit);
        expect(commit.mock.calls[0][1]).toBe("col1");
        expect(commit.mock.calls[1][0]).toBe(`modelFit/${ModelFitMutation.SetFitUpdateRequired}`);
        expect(commit.mock.calls[1][1]).toStrictEqual({ linkChanged: true });
        expect(commit.mock.calls[1][2]).toStrictEqual({ root: true });
    });
});
