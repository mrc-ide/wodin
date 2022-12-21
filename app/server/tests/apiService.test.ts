import { AxiosRequestHeaders, AxiosResponseTransformer } from "axios";
import { mockAxios } from "./mocks";
import { api } from "../src/apiService";

describe("apiService", () => {
    beforeEach(() => {
        mockAxios.reset();
        jest.resetAllMocks();
    });

    const mockReq = {
        app: {
            locals: {
                odinApi: "http://test"
            }
        },
        headers: {
            Accept: "application/json",
            "Content-Type": "text",
            UndefinedHeader: undefined,
            ArrayHeader: ["arr1", "arr2"]
        }
    } as any;

    const mockRes = {
        status: jest.fn(),
        header: jest.fn(),
        end: jest.fn()
    } as any;

    const postData = "posted data";

    const responseData = { data: "test get" };
    const responseHeaders = { respHeader1: "rh1", respHeader2: "rh2" };

    const mockNext = jest.fn();

    const testExpectedResponse = () => {
        expect(mockRes.status.mock.calls[0][0]).toBe(200);
        expect(mockRes.header.mock.calls[0][0]).toBe("respHeader1");
        expect(mockRes.header.mock.calls[0][1]).toBe("rh1");
        expect(mockRes.header.mock.calls[1][0]).toBe("respHeader2");
        expect(mockRes.header.mock.calls[1][1]).toBe("rh2");
        expect(mockRes.end.mock.calls[0][0]).toStrictEqual(responseData);
    };

    const testError = "test error";

    const testExpectedAxiosRequestConfig = (
        headers: AxiosRequestHeaders,
        transformResponse: AxiosResponseTransformer
    ) => {
        expect(headers).toStrictEqual({
            Accept: "application/json",
            "Content-Type": "text",
            ArrayHeader: "arr1,arr2"
        });
        const transformTest = "{\"json\": \"test\"}";
        expect((transformResponse as AxiosResponseTransformer)(transformTest)).toBe(transformTest);
    };

    const testExpectedError = () => {
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockNext.mock.calls[0][0].response.status).toBe(500);
        expect(mockNext.mock.calls[0][0].response.data).toBe(testError);
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.header).not.toHaveBeenCalled();
        expect(mockRes.end).not.toHaveBeenCalled();
    };

    const sut = api(mockReq, mockRes, mockNext);

    it("get passes through response from api", async () => {
        const expectedUrl = "http://test/get-endpoint";
        mockAxios.onGet(expectedUrl).reply(
            200,
            responseData,
            responseHeaders
        );

        await sut.get("/get-endpoint");
        const { url, headers, transformResponse } = mockAxios.history.get[0];
        expect(url).toBe(expectedUrl);
        testExpectedAxiosRequestConfig(
            headers as AxiosRequestHeaders,
            transformResponse as AxiosResponseTransformer
        );
        testExpectedResponse();
    });

    it("post passes through response from api", async () => {
        const expectedUrl = "http://test/post-endpoint";
        mockAxios.onPost(expectedUrl).reply(
            200,
            responseData,
            responseHeaders
        );
        await sut.post("/post-endpoint", postData);
        const {
            url, data, headers, transformResponse
        } = mockAxios.history.post[0];
        expect(url).toBe(expectedUrl);
        expect(data).toBe(postData);

        testExpectedAxiosRequestConfig(headers as AxiosRequestHeaders, transformResponse as AxiosResponseTransformer);
        testExpectedResponse();
    });

    it("get calls next if error thrown", async () => {
        const expectedUrl = "http://test/get-endpoint";
        mockAxios.onGet(expectedUrl).reply(
            500,
            testError,
            responseHeaders
        );

        await sut.get("/get-endpoint");
        testExpectedError();
    });

    it("post calls next if error thrown", async () => {
        const expectedUrl = "http://test/post-endpoint";
        mockAxios.onPost(expectedUrl).reply(
            500,
            testError,
            responseHeaders
        );

        await sut.post("/post-endpoint", postData);
        testExpectedError();
    });
});
