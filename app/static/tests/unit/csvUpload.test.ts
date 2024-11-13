import { fileTimeout } from "../testUtils";
import { csvUpload } from "../../src/csvUpload";

describe("CSVUpload", () => {
    const file = { name: "testFile" } as any;

    const getMockFileReader = (csvData: string) => {
        const mockFileReader = {} as any;
        const readAsText = vi.fn().mockImplementation(() => {
            mockFileReader.onload({
                target: {
                    result: csvData
                }
            });
        });
        mockFileReader.readAsText = readAsText;
        vi.spyOn(global, "FileReader").mockImplementation(() => mockFileReader);

        return mockFileReader;
    };

    const postSuccess = vi.fn();

    afterEach(() => {
        vi.resetAllMocks();
    });

    const expectFileRead = (mockFileReader: any) => {
        expect(mockFileReader.readAsText).toHaveBeenCalledTimes(1);
        expect(mockFileReader.readAsText.mock.calls[0][0]).toBe(file);
        expect(mockFileReader.readAsText.mock.calls[0][1]).toBe("UTF-8");
    };

    enum TestMutation {
        Success = "Success",
        Error = "Error"
    }

    it("commits data and calls post success on success", async () => {
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4\n5,6\n7,8\n9,10\n");

        const commit = vi.fn();
        csvUpload({ commit } as any)
            .withSuccess(TestMutation.Success)
            .withError(TestMutation.Error)
            .then(postSuccess)
            .upload(file);

        expectFileRead(mockFileReader);
        await new Promise(res => setTimeout(res, fileTimeout));
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(TestMutation.Success);
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

        expect(postSuccess).toHaveBeenCalledTimes(1);
    });

    it("succeeds if post success is not set", async () => {
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4\n5,6\n7,8\n9,10\n");

        const commit = vi.fn();
        csvUpload({ commit } as any)
            .withSuccess(TestMutation.Success)
            .withError(TestMutation.Error)
            .upload(file);

        expectFileRead(mockFileReader);
        await new Promise(res => setTimeout(res, fileTimeout));
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(TestMutation.Success);
        expect(postSuccess).not.toHaveBeenCalled();
    });

    it("commits csv parse error", async () => {
        const mockFileReader = getMockFileReader("a,b\n1,2,3");

        const commit = vi.fn();
        csvUpload({ commit } as any)
            .withSuccess(TestMutation.Success)
            .withError(TestMutation.Error)
            .then(postSuccess)
            .upload(file);

        expectFileRead(mockFileReader);
        await new Promise(res => setTimeout(res, fileTimeout));
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(TestMutation.Error);
        const expectedError = {
            error: "An error occurred when loading data",
            detail: "Invalid Record Length: columns length is 2, got 3 on line 2"
        };
        expect(commit.mock.calls[0][1]).toStrictEqual(expectedError);
        expect(postSuccess).not.toHaveBeenCalled();
    });

    it("commits csv processing error", async () => {
        const mockFileReader = getMockFileReader("a,b\n1,2\nhello,4\n5,6\n7,8\n9,10\n");

        const commit = vi.fn();
        csvUpload({ commit } as any)
            .withSuccess(TestMutation.Success)
            .withError(TestMutation.Error)
            .then(postSuccess)
            .upload(file);
        expectFileRead(mockFileReader);
        await new Promise(res => setTimeout(res, fileTimeout));
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(TestMutation.Error);
        const expectedError = {
            error: "An error occurred when loading data",
            detail: "Data contains non-numeric values: 'hello'"
        };
        expect(commit.mock.calls[0][1]).toStrictEqual(expectedError);
        expect(postSuccess).not.toHaveBeenCalled();
    });

    it("commits file read error", async () => {
        const mockFileReader = {} as any;
        const readAsText = vi.fn().mockImplementation(() => {
            mockFileReader.error = { message: "File cannot be read" };
            mockFileReader.onerror();
        });
        mockFileReader.readAsText = readAsText;
        vi.spyOn(global, "FileReader").mockImplementation(() => mockFileReader);

        const commit = vi.fn();
        csvUpload({ commit } as any)
            .withSuccess(TestMutation.Success)
            .withError(TestMutation.Error)
            .then(postSuccess)
            .upload(file);
        expectFileRead(mockFileReader);
        await new Promise(res => setTimeout(res, fileTimeout));
        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe(TestMutation.Error);
        const expectedError = {
            error: "An error occurred when reading data file",
            detail: "File cannot be read"
        };
        expect(commit.mock.calls[0][1]).toStrictEqual(expectedError);
        expect(postSuccess).not.toHaveBeenCalled();
    });

    it("warns when handlers are not registered", async () => {
        const mockFileReader = getMockFileReader("a,b\n1,2\n3,4");
        vi.spyOn(global, "FileReader").mockImplementation(() => mockFileReader);
        const consoleSpy = vi.spyOn(console, "warn");
        const commit = vi.fn();
        csvUpload({ commit } as any).upload(file);
        expect(consoleSpy).toHaveBeenCalledTimes(2);
        expect(consoleSpy.mock.calls[0][0]).toBe("No error handler registered for CSVUpload.");
        expect(consoleSpy.mock.calls[1][0]).toBe("No success handler registered for CSVUpload.");
        await new Promise(res => setTimeout(res, fileTimeout));
        expect(commit).not.toHaveBeenCalled();
    });
});
