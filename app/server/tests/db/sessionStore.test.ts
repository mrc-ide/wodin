import { SessionStore } from "../../src/db/sessionStore";

// Mock Date.now to return hardcoded date
Date.now = jest.spyOn(Date, "now").mockImplementation(() => new Date(2022, 0, 24, 17).getTime()) as any;

describe("Sessionstore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockPipeline = {
        exec: jest.fn()
    } as any;
    mockPipeline.hset = jest.fn().mockReturnValue(mockPipeline);

    const mockRedis = {
        pipeline: jest.fn().mockReturnValue(mockPipeline),
        hset: jest.fn().mockReturnValue(mockPipeline)
    } as any;

    it("can save session", async () => {
        const data = "testSession";
        const sut = new SessionStore(mockRedis, "Test Course", "testApp");
        await sut.saveSession("1234", data);

        expect(mockRedis.pipeline).toHaveBeenCalledTimes(1);
        expect(mockPipeline.hset).toHaveBeenCalledTimes(2);
        expect(mockPipeline.hset.mock.calls[0][0]).toBe("Test Course:testApp:sessions:time");
        expect(mockPipeline.hset.mock.calls[0][1]).toBe("1234");
        expect(mockPipeline.hset.mock.calls[0][2]).toBe("2022-01-24T17:00:00.000Z");
        expect(mockPipeline.hset.mock.calls[1][0]).toBe("Test Course:testApp:sessions:data");
        expect(mockPipeline.hset.mock.calls[1][1]).toBe("1234");
        expect(mockPipeline.hset.mock.calls[1][2]).toBe("testSession");
        expect(mockPipeline.exec).toHaveBeenCalledTimes(1);
    });

    it("can save label", async () => {
        const id = "1234";
        const label = "some label";
        const sut = new SessionStore(mockRedis, "Test Course", "testApp");
        await sut.saveSessionLabel(id, label);
        expect(mockRedis.hset).toHaveBeenCalledTimes(1);
        expect(mockRedis.hset.mock.calls[0][0]).toBe("Test Course:testApp:sessions:label");
        expect(mockRedis.hset.mock.calls[0][1]).toBe("1234");
        expect(mockRedis.hset.mock.calls[0][2]).toBe("some label");
    });
});
