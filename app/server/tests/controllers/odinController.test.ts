import * as apiService from "../../src/apiService";
import { OdinController } from "../../src/controllers/odinController";

const mockAPIGet = vi.fn();
const mockAPIPost = vi.fn();
const mockAPIService = {
    get: mockAPIGet,
    post: mockAPIPost
} as any;
const mockNext = vi.fn();

const apiSpy = vi.spyOn(apiService, "api").mockReturnValue(mockAPIService);

describe("odinController", () => {
    const mockRequest = {
        body: "test body"
    } as any;
    const mockResponse = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("getRunnerOde gets from api service", async () => {
        await OdinController.getRunnerOde(mockRequest, mockResponse, mockNext);
        expect(apiSpy.mock.calls[0][0]).toBe(mockRequest);
        expect(apiSpy.mock.calls[0][1]).toBe(mockResponse);
        expect(apiSpy.mock.calls[0][2]).toBe(mockNext);
        expect(mockAPIGet.mock.calls[0][0]).toBe("/support/runner-ode");
    });

    it("getRunnerDiscrete gets from api service", async () => {
        await OdinController.getRunnerDiscrete(mockRequest, mockResponse, mockNext);
        expect(apiSpy.mock.calls[0][0]).toBe(mockRequest);
        expect(apiSpy.mock.calls[0][1]).toBe(mockResponse);
        expect(apiSpy.mock.calls[0][2]).toBe(mockNext);
        expect(mockAPIGet.mock.calls[0][0]).toBe("/support/runner-discrete");
    });

    it("postModel posts to api service", async () => {
        await OdinController.postModel(mockRequest, mockResponse, mockNext);
        expect(apiSpy.mock.calls[0][0]).toBe(mockRequest);
        expect(apiSpy.mock.calls[0][1]).toBe(mockResponse);
        expect(apiSpy.mock.calls[0][2]).toBe(mockNext);
        expect(mockAPIPost.mock.calls[0][0]).toBe("/compile");
        expect(mockAPIPost.mock.calls[0][1]).toBe("test body");
    });

    it("getVersions gets from api service", async () => {
        await OdinController.getVersions(mockRequest, mockResponse, mockNext);
        expect(apiSpy.mock.calls[0][0]).toBe(mockRequest);
        expect(apiSpy.mock.calls[0][1]).toBe(mockResponse);
        expect(apiSpy.mock.calls[0][2]).toBe(mockNext);
        expect(mockAPIGet.mock.calls[0][0]).toBe("/");
    });
});
