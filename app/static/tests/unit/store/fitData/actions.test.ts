import { actions, FitDataAction } from "../../../../src/app/store/fitData/actions";
import { FitDataMutation } from "../../../../src/app/store/fitData/mutations";
import resetAllMocks = jest.resetAllMocks;
import { mockFitDataState } from "../../../mocks";
import { fileTimeout } from "../../../testUtils";

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
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4\n5,6\n7,8\n9,10");
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
        const mockState = {
            linkedVariables: { a: "X", b: "Y" }
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
            expect(commit).toHaveBeenCalledTimes(2);
            expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetData);
            const expectedSetDataPayload = {
                data: [
                    { a: 1, b: 2 },
                    { a: 3, b: 4 },
                    { a: 5, b: 6 },
                    { a: 7, b: 8 },
                    { a: 9, b: 10 }
                ],
                columns: ["a", "b"],
                timeVariableCandidates: ["a", "b"]
            };
            expect(commit.mock.calls[0][1]).toStrictEqual(expectedSetDataPayload);
            expect(commit.mock.calls[1][0]).toBe(FitDataMutation.SetLinkedVariables);
            expect(commit.mock.calls[1][1]).toStrictEqual({ a: "X" });
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
});
