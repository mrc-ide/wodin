import { ErrorCode, jsonResponseError, jsonResponseSuccess } from "../src/jsonResponse";

describe("jsonResponse", () => {
    const mockHeader = jest.fn();
    const mockStatus = jest.fn();
    const mockEnd = jest.fn();
    const mockRes = {
        header: mockHeader,
        status: mockStatus,
        end: mockEnd
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("jsonResponseSuccess adds header and expected response text", () => {
        jsonResponseSuccess({ testProp: "testValue" }, mockRes as any);

        expect(mockHeader.mock.calls.length).toBe(1);
        expect(mockHeader.mock.calls[0][0]).toBe("Content-Type");
        expect(mockHeader.mock.calls[0][1]).toBe("application/json");

        expect(mockEnd.mock.calls.length).toBe(1);
        const responseJson = JSON.parse(mockEnd.mock.calls[0][0]);
        expect(responseJson).toStrictEqual({
            status: "success",
            errors: null,
            data: { testProp: "testValue" }
        });
    });

    it("jsonResponseError adds header, status and expected response text", () => {
        jsonResponseError(404, ErrorCode.NOT_FOUND, "Resource not found", mockRes as any);

        expect(mockHeader.mock.calls.length).toBe(1);
        expect(mockHeader.mock.calls[0][0]).toBe("Content-Type");
        expect(mockHeader.mock.calls[0][1]).toBe("application/json");

        expect(mockStatus.mock.calls.length).toBe(1);
        expect(mockStatus.mock.calls[0][0]).toBe(404);

        expect(mockEnd.mock.calls.length).toBe(1);
        const responseJson = JSON.parse(mockEnd.mock.calls[0][0]);
        expect(responseJson).toStrictEqual({
            status: "failure",
            errors: [{ error: "NOT_FOUND", detail: "Resource not found" }],
            data: null
        });
    });
});
