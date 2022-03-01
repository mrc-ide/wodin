import {api} from "../../src/app/apiService";
import {mockAxios, mockError, mockFailure, mockSuccess, mockBasicState} from "../mocks";
import {freezer} from '../../src/app/utils';

const rootState = mockBasicState();

describe("ApiService", () => {

    const TEST_ROUTE = "/test";

    beforeEach(() => {
        console.log = jest.fn();
        console.warn = jest.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as jest.Mock).mockClear();
        (console.warn as jest.Mock).mockClear();
        jest.clearAllMocks();
    });

    const expectNoErrorHandlerMsgLogged = () => {
        expect((console.warn as jest.Mock).mock.calls[0][0])
            .toBe(`No error handler registered for request ${TEST_ROUTE}.`);
    };

    it("console logs error", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("some error message"));

        try {
            await api({commit: jest.fn(), rootState} as any)
                .get(TEST_ROUTE)
        } catch (e) {

        }
        expectNoErrorHandlerMsgLogged();

        expect((console.log as jest.Mock).mock.calls[0][0].errors[0].detail)
            .toBe("some error message");
    });

    it("commits the the first error message to errors module by default", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();

        await api({commit, rootState} as any)
            .get(TEST_ROUTE);

        expectNoErrorHandlerMsgLogged();

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: `errors/AddError`,
            payload: mockError("some error message")
        });
        expect(commit.mock.calls[0][1]).toStrictEqual({root: true});
    });

    it("if no first error message, commits a default error message to errors module by default", async () => {

        const failure = {
            data: {},
            status: "failure",
            errors: []
        };
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, failure);

        const commit = jest.fn();

        await api({commit, rootState} as any)
            .get(TEST_ROUTE);

        expectNoErrorHandlerMsgLogged();

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: `errors/AddError`,
            payload: {
                error: "MALFORMED_RESPONSE",
                detail: "API response failed but did not contain any error information. Please contact support.",
            }
        });
        expect(commit.mock.calls[0][1]).toStrictEqual({root: true});
    });

    it("commits the first error with the specified type if well formatted", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();

        await api({commit, rootState} as any)
            .withError("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({error: "OTHER_ERROR", detail: "some error message"});
    });

    it("commits the error type if the error detail is missing", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure(null as any));

        const commit = jest.fn();
        await api({commit, rootState} as any)
            .withError("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({error: "OTHER_ERROR", detail: null});
    });

    it("commits the success response with the specified type", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess("test data"));

        const commit = jest.fn();
        await api({commit, rootState} as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("test data");
        expect(commit.mock.calls[0][2]).toStrictEqual({root: false});
    });

    it("commits the success response with the specified type with root true", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess("test data"));

        const commit = jest.fn();
        await api({commit, rootState} as any)
            .withSuccess("TEST_TYPE", true)
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("test data");
        expect(commit.mock.calls[0][2]).toStrictEqual({root: true});
    });

    it("commits the error response with the specified type with root true", async () => {
        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("TEST ERROR"));

        const commit = jest.fn();
        const response = await api({commit, rootState} as any)
            .withError("TEST_TYPE", true)
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1].detail).toBe("TEST ERROR");
        expect(commit.mock.calls[0][2]).toStrictEqual({root: true});
    });

    it("returns the response object", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess("TEST"));

        const commit = jest.fn();
        const response = await api({commit, rootState} as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(response).toStrictEqual({data: "TEST", errors: null, status: "success"});
    });

    it("deep freezes the response object if requested", async () => {

        const fakeData = {name: "d1"};
        const mockResponse = mockSuccess(fakeData);
        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockResponse);

        const spy = jest.spyOn(freezer, "deepFreeze");

        const commit = jest.fn();
        await api({commit, rootState} as any)
            .freezeResponse()
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        const committedPayload = commit.mock.calls[0][1];
        expect(Object.isFrozen(committedPayload)).toBe(true);
        expect(spy).toHaveBeenCalledWith(fakeData);
    });

    it("does not deep freeze the response object if not requested", async () => {

        const fakeData = {name: "d1"};
        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess(fakeData));

        const spy = jest.spyOn(freezer, "deepFreeze");

        const commit = jest.fn();
        await api({commit, rootState} as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        const committedPayload = commit.mock.calls[0][1];
        expect(Object.isFrozen(committedPayload)).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    it("commits prase error if API response is null", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(500);

        await expectCouldNotParseAPIResponseError();
    });

    it("commits parse error if API response status is missing", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(500, {data: {}, errors: []});

        await expectCouldNotParseAPIResponseError();
    });

    it("commits parse error if API response errors are missing", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(500, {data: {}, status: "failure"});

        await expectCouldNotParseAPIResponseError();
    });

    it("does nothing on error if ignoreErrors is true", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(500, mockFailure("some error message"));

        const commit = jest.fn();
        await api({commit, rootState} as any)
            .withSuccess("whatever")
            .ignoreErrors()
            .get("/baseline/");

        expect((console.warn as jest.Mock).mock.calls.length).toBe(0);
        expect(commit.mock.calls.length).toBe(0);
    });

    it("warns if error and success handlers are not set", async () => {

        mockAxios.onGet(TEST_ROUTE)
            .reply(200, mockSuccess(true));

        await api({commit: jest.fn(), rootState} as any)
            .get(TEST_ROUTE);

        const warnings = (console.warn as jest.Mock).mock.calls;

        expectNoErrorHandlerMsgLogged();
        expect(warnings[1][0]).toBe(`No success handler registered for request ${TEST_ROUTE}.`);
    });

    async function expectCouldNotParseAPIResponseError() {
        const commit = jest.fn();
        await api({commit, rootState} as any)
            .get("/baseline/");

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: `errors/AddError`,
            payload: {
                error: "MALFORMED_RESPONSE",
                detail: "Could not parse API response. Please contact support."
            }
        });
        expect(commit.mock.calls[0][1]).toStrictEqual({root: true});
    }

});
