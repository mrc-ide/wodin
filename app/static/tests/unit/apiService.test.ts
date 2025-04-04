import { api } from "../../src/apiService";
import { mockAxios, mockError, mockFailure, mockSuccess, mockBasicState } from "../mocks";
import { freezer } from "../../src/utils";
import { Mock } from "vitest";
import * as Env from "@/parseEnv";

vi.mock("@/parseEnv");

const BASE_URL = "http://localhost:3000";
const rootState = mockBasicState({ baseUrl: BASE_URL });

describe("ApiService", () => {
    const TEST_ROUTE = "/test";
    const TEST_BODY = "test body";

    beforeEach(() => {
        console.log = vi.fn();
        console.warn = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
        (console.warn as Mock).mockClear();
        vi.clearAllMocks();
    });

    const expectNoErrorHandlerMsgLogged = () => {
        expect((console.warn as Mock).mock.calls[0][0]).toBe(
            `No error handler registered for request ${TEST_ROUTE}.`
        );
    };

    const expectCommitsErrorMessage = (commit: Mock, errorMessage: string) => {
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1]).toStrictEqual(mockError(errorMessage));
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });
    };

    const expectCommitsDefaultErrorMessage = (commit: Mock) => {
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1]).toStrictEqual({
            error: "MALFORMED_RESPONSE",
            detail: "API response failed but did not contain any error information. Please contact support."
        });
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });
    };

    it("console logs error on get", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, mockFailure("some error message"));

        await api({ commit: vi.fn(), rootState } as any).get(TEST_ROUTE);

        expectNoErrorHandlerMsgLogged();

        expect((console.log as Mock).mock.calls[0][0].errors[0].detail).toBe("some error message");
    });

    it("console logs error on post", async () => {
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(500, mockFailure("some error message"));

        await api({ commit: vi.fn(), rootState } as any).post(TEST_ROUTE, TEST_BODY);

        expectNoErrorHandlerMsgLogged();

        expect((console.log as Mock).mock.calls[0][0].errors[0].detail).toBe("some error message");
    });

    it("commits the the first error message to errors module by default on get", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, mockFailure("some error message"));

        const commit = vi.fn();

        await api({ commit, rootState } as any).get(TEST_ROUTE);

        expectNoErrorHandlerMsgLogged();
        expectCommitsErrorMessage(commit, "some error message");
    });

    it("commits the the first error message to errors module by default on post", async () => {
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(500, mockFailure("some error message"));

        const commit = vi.fn();

        await api({ commit, rootState } as any).post(TEST_ROUTE, TEST_BODY);

        expectNoErrorHandlerMsgLogged();
        expectCommitsErrorMessage(commit, "some error message");
    });

    it("if no first error message, commits a default error message to errors module by default on get", async () => {
        const failure = {
            data: {},
            status: "failure",
            errors: []
        };
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, failure);

        const commit = vi.fn();

        await api({ commit, rootState } as any).get(TEST_ROUTE);

        expectNoErrorHandlerMsgLogged();
        expectCommitsDefaultErrorMessage(commit);
    });

    it("if no first error message, commits a default error message to errors module by default on post", async () => {
        const failure = {
            data: {},
            status: "failure",
            errors: []
        };
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(500, failure);

        const commit = vi.fn();

        await api({ commit, rootState } as any).post(TEST_ROUTE, TEST_BODY);

        expectNoErrorHandlerMsgLogged();
        expectCommitsDefaultErrorMessage(commit);
    });

    it("commits the first error with the specified type if well formatted on get", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, mockFailure("some error message"));

        const commit = vi.fn();

        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({ error: "OTHER_ERROR", detail: "some error message" });
    });

    it("commits the first error with the specified type if well formatted on post", async () => {
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(500, mockFailure("some error message"));

        const commit = vi.fn();

        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({ error: "OTHER_ERROR", detail: "some error message" });
    });

    it("commits the error type if the error detail is missing on get", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, mockFailure(null as any));

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({ error: "OTHER_ERROR", detail: null });
    });

    it("commits the error type if the error detail is missing on post", async () => {
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(500, mockFailure(null as any));

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withError("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toStrictEqual({ error: "OTHER_ERROR", detail: null });
    });

    it("commits the success response with the specified type on get", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockSuccess("test data"));

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("test data");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: false });
    });

    it("commits the success response with the specified type on post", async () => {
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(200, mockSuccess("test data"));

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("test data");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: false });
    });

    it("commits the success response with the specified type with root true", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockSuccess("test data"));

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE", true)
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("test data");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });
    });

    it("commits the error response with the specified type with root true", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, mockFailure("TEST ERROR"));

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withError("TEST_TYPE", true)
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1].detail).toBe("TEST ERROR");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });
    });

    it("handles exception thrown on commit success response by adding expected error", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockSuccess("TEST SUCCESS"));

        const commit = vi.fn().mockImplementation((type: string) => {
            if (type === "TEST_TYPE") {
                throw new Error("Test Success Mutation Exception");
            }
        });
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE", true)
            .get(TEST_ROUTE);

        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1]).toBe("TEST SUCCESS");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });

        expect(commit.mock.calls[1][0]).toBe("errors/AddError");
        expect(commit.mock.calls[1][1].detail).toBe(
            "Exception committing success response to TEST_TYPE: Error: Test Success Mutation Exception"
        );
        expect(commit.mock.calls[1][2]).toStrictEqual({ root: true });
    });

    it("handles exception thrown on commit error response by adding expected error", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, mockFailure("TEST FAILURE"));

        const commit = vi.fn().mockImplementation((type: string) => {
            if (type === "TEST_TYPE") {
                throw new Error("Test Error Mutation Exception");
            }
        });
        await api({ commit, rootState } as any)
            .withError("TEST_TYPE", true)
            .get(TEST_ROUTE);

        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        expect(commit.mock.calls[0][1].detail).toBe("TEST FAILURE");
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });

        expect(commit.mock.calls[1][0]).toBe("errors/AddError");
        expect(commit.mock.calls[1][1].detail).toBe(
            "Exception committing error response to TEST_TYPE: Error: Test Error Mutation Exception"
        );
        expect(commit.mock.calls[1][2]).toStrictEqual({ root: true });
    });

    it("get returns the response object", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockSuccess("TEST"));

        const commit = vi.fn();
        const response = await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(response).toStrictEqual({ data: "TEST", errors: null, status: "success" });
    });

    it("post returns the response object", async () => {
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(200, mockSuccess("TEST"));

        const commit = vi.fn();
        const response = await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(response).toStrictEqual({ data: "TEST", errors: null, status: "success" });
    });

    it("does not do anything if STATIC_BUILD is true", async () => {
        vi.mocked(Env).STATIC_BUILD = true;

        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockSuccess("TEST"));
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(200, mockSuccess("TEST"));

        const commit = vi.fn();
        const responseGet = await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);
        expect(responseGet).toBe(undefined);

        const responsePost = await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);
        expect(responsePost).toBe(undefined);

        vi.mocked(Env).STATIC_BUILD = false;
    });

    it("post sets default Content-Type header", async () => {
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(200, mockSuccess("TEST"));
        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY);

        expect(mockAxios.history.post[0].headers!["Content-Type"]).toBe("application/json");
    });

    it("post sets requested Content-Type header", async () => {
        mockAxios.onPost(`${BASE_URL}${TEST_ROUTE}`, TEST_BODY).reply(200, mockSuccess("TEST"));
        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .post(TEST_ROUTE, TEST_BODY, "text/plain");

        expect(mockAxios.history.post[0].headers!["Content-Type"]).toBe("text/plain");
    });

    it("deep freezes the response object if requested", async () => {
        const fakeData = { name: "d1" };
        const mockResponse = mockSuccess(fakeData);
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockResponse);

        const spy = vi.spyOn(freezer, "deepFreeze");

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .freezeResponse()
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        const committedPayload = commit.mock.calls[0][1];
        expect(Object.isFrozen(committedPayload)).toBe(true);
        expect(spy).toHaveBeenCalledWith(fakeData);
    });

    it("does not deep freeze the response object if not requested", async () => {
        const fakeData = { name: "d1" };
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockSuccess(fakeData));

        const spy = vi.spyOn(freezer, "deepFreeze");

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withSuccess("TEST_TYPE")
            .get(TEST_ROUTE);

        expect(commit.mock.calls[0][0]).toBe("TEST_TYPE");
        const committedPayload = commit.mock.calls[0][1];
        expect(Object.isFrozen(committedPayload)).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    async function expectCouldNotParseAPIResponseError() {
        const commit = vi.fn();
        await api({ commit, rootState } as any).get(TEST_ROUTE);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe("errors/AddError");
        expect(commit.mock.calls[0][1]).toStrictEqual({
            error: "MALFORMED_RESPONSE",
            detail: "Could not parse API response with status 500. Please contact support."
        });
        expect(commit.mock.calls[0][2]).toStrictEqual({ root: true });
    }

    it("commits parse error if API response is null", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500);

        await expectCouldNotParseAPIResponseError();
    });

    it("commits parse error if API response status is missing", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, { data: {}, errors: [] });

        await expectCouldNotParseAPIResponseError();
    });

    it("commits parse error if API response errors are missing", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, { data: {}, status: "failure" });

        await expectCouldNotParseAPIResponseError();
    });

    it("does nothing on error if ignoreErrors is true", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(500, mockFailure("some error message"));

        const commit = vi.fn();
        await api({ commit, rootState } as any)
            .withSuccess("whatever")
            .ignoreErrors()
            .get("/baseline/");

        expect((console.warn as Mock).mock.calls.length).toBe(0);
        expect(commit.mock.calls.length).toBe(0);
    });

    it("does not warn that no success handler if ignoring success", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockSuccess(true));

        await api({ commit: vi.fn(), rootState } as any)
            .ignoreSuccess()
            .withError("whatever")
            .get(TEST_ROUTE);

        expect((console.warn as Mock).mock.calls.length).toBe(0);
    });

    it("warns if error and success handlers are not set if not ignoring", async () => {
        mockAxios.onGet(`${BASE_URL}${TEST_ROUTE}`).reply(200, mockSuccess(true));

        await api({ commit: vi.fn(), rootState } as any).get(TEST_ROUTE);

        const warnings = (console.warn as Mock).mock.calls;

        expectNoErrorHandlerMsgLogged();
        expect(warnings[1][0]).toBe(`No success handler registered for request ${TEST_ROUTE}.`);
    });
});
