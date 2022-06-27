// mock json response before import errors
const mockJsonResponseError = jest.fn();
jest.mock("../src/jsonResponse", () => { return { jsonResponseError: mockJsonResponseError }; });

// eslint-disable-next-line import/first
import {
    handleError, WodinError, ErrorType, WodinWebError
} from "../src/errors";

const mockRequest = (accept = "application/json,*/*") => {
    return {
        headers: {
            Accept: accept
        }
    } as any;
};

const mockStatus = {
    render: jest.fn()
};

const mockResponse = () => {
    return {
        status: jest.fn().mockReturnValue(mockStatus)
    } as any;
};

describe("handeError", () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    const testUnexpectedErrorMsg = (msg: string) => {
        const unexpectedErrorPrefix = "An unexpected error occurred. Please contact support and quote error code ";
        expect(msg.startsWith(unexpectedErrorPrefix)).toBe(true);
        const code = msg.replace(unexpectedErrorPrefix, "");
        expect(code).toMatch(/^[a-z0-9]{11}$/);
    };

    it("logs WodinError and returns JSON response", () => {
        const err = new WodinError("test wodin error", 404, ErrorType.NOT_FOUND);
        const req = mockRequest();
        const res = mockResponse();
        handleError(err, req, res, jest.fn());

        // check expected data has been attached to request
        expect(req.errorType).toBe(ErrorType.NOT_FOUND);
        expect(req.errorDetail).toBe("test wodin error");
        expect(req.errorStack).toBe(err.stack);

        expect(mockJsonResponseError.mock.calls[0][0]).toBe(404);
        expect(mockJsonResponseError.mock.calls[0][1]).toBe(ErrorType.NOT_FOUND);
        expect(mockJsonResponseError.mock.calls[0][2]).toBe("test wodin error");
        expect(mockJsonResponseError.mock.calls[0][3]).toBe(res);
        expect(res.status).not.toHaveBeenCalled();
        expect(mockStatus.render).not.toHaveBeenCalled();
    });

    it("logs unexpected error and returns JSON response", () => {
        const err = new Error("something bad");
        const req = mockRequest();
        const res = mockResponse();
        handleError(err, req, res, jest.fn());

        // check expected data has been attached to request
        expect(req.errorType).toBe(ErrorType.OTHER_ERROR);
        testUnexpectedErrorMsg(req.errorDetail);
        expect(req.errorStack).toBe(err.stack);

        expect(mockJsonResponseError.mock.calls[0][0]).toBe(500);
        expect(mockJsonResponseError.mock.calls[0][1]).toBe(ErrorType.OTHER_ERROR);
        expect(mockJsonResponseError.mock.calls[0][2]).toBe(req.errorDetail);
        expect(mockJsonResponseError.mock.calls[0][3]).toBe(res);
        expect(res.status).not.toHaveBeenCalled();
        expect(mockStatus.render).not.toHaveBeenCalled();
    });

    it("logs WodinWebError and renders view", () => {
        const options = { test: "test option" };
        const err = new WodinWebError("test wodin web error", 404, ErrorType.NOT_FOUND, "test-view", options);
        const req = mockRequest("text/html");
        const res = mockResponse();
        handleError(err, req, res, jest.fn());

        // check expected data has been attached to request
        expect(req.errorType).toBe(ErrorType.NOT_FOUND);
        expect(req.errorDetail).toBe("test wodin web error");
        expect(req.errorStack).toBe(err.stack);

        expect(mockJsonResponseError).not.toHaveBeenCalled();
        expect(res.status.mock.calls[0][0]).toBe(404);
        expect(mockStatus.render.mock.calls[0][0]).toBe("test-view");
        expect(mockStatus.render.mock.calls[0][1]).toBe(options);
    });

    it("logs unexpected error and renders view", () => {
        const err = new Error("something bad");
        const req = mockRequest("text/html");
        const res = mockResponse();
        handleError(err, req, res, jest.fn());

        // check expected data has been attached to request
        expect(req.errorType).toBe(ErrorType.OTHER_ERROR);
        testUnexpectedErrorMsg(req.errorDetail);
        expect(req.errorStack).toBe(err.stack);

        expect(mockJsonResponseError).not.toHaveBeenCalled();
        expect(res.status.mock.calls[0][0]).toBe(500);
        expect(mockStatus.render.mock.calls[0][0]).toBe("unexpected-error");
        expect(mockStatus.render.mock.calls[0][1]).toStrictEqual({ detail: req.errorDetail });
    });
});
