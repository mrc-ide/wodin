import { actions, FitDataAction } from "../../../../src/app/store/fitData/actions";
import { FitDataMutation } from "../../../../src/app/store/fitData/mutations";
import resetAllMocks = jest.resetAllMocks;

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

    it("commits data on success", (done) => {
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4\n");

        const commit = jest.fn();
        (actions[FitDataAction.Upload] as any)({ commit }, file);
        expectFileRead(mockFileReader);
        setTimeout(() => {
            expect(commit).toHaveBeenCalledTimes(1);
            expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetData);
            const expectedSetDataPayload = {
                data: [
                    { a: 1, b: 2 },
                    { a: 3, b: 4 }
                ],
                columns: ["a", "b"]
            };
            expect(commit.mock.calls[0][1]).toStrictEqual(expectedSetDataPayload);
            done();
        });
    });

    it("commits csv parse error", (done) => {
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
        });
    });

    it("commits csv processing error", (done) => {
        const mockFileReader = getMockFileReader("a,b\n1,2\nhello,4");

        const commit = jest.fn();
        (actions[FitDataAction.Upload] as any)({ commit }, file);
        expectFileRead(mockFileReader);
        setTimeout(() => {
            expect(commit).toHaveBeenCalledTimes(1);
            expect(commit.mock.calls[0][0]).toBe(FitDataMutation.SetError);
            const expectedError = {
                error: "An error occurred when loading data",
                detail: "Data contains non-numeric values: hello"
            };
            expect(commit.mock.calls[0][1]).toStrictEqual(expectedError);
            done();
        });
    });

    it("commits file read error", (done) => {
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
        });
    });

    it("does nothing if file is not set", (done) => {
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4\n");

        const commit = jest.fn();
        (actions[FitDataAction.Upload] as any)({ commit }, null);
        expect(mockFileReader.readAsText).not.toHaveBeenCalled();
        setTimeout(() => {
            expect(commit).not.toHaveBeenCalled();
            done();
        });
    });
});
