import * as md5 from "md5";
import {
    friendlyAdjectiveAnimal, cleanFriendlyId, SessionStore, getSessionStore
} from "../../src/db/sessionStore";

// Mock Date.now to return hardcoded date
Date.now = jest.spyOn(Date, "now").mockImplementation(() => new Date(2022, 0, 24, 17).getTime()) as any;

describe("SessionStore", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockPipeline = {
        exec: jest.fn()
    } as any;
    mockPipeline.hset = jest.fn().mockReturnValue(mockPipeline);

    const mockRedis = {
        pipeline: jest.fn().mockReturnValue(mockPipeline),
        hget: jest.fn().mockReturnValue(mockPipeline),
        hmget: jest.fn().mockImplementation(async (key: string, ...fields: string[]) => {
            return fields.map((field: string) => `${field} value for ${key}`);
        }),
        hset: jest.fn().mockReturnValue(mockPipeline),
        hsetnx: jest.fn().mockReturnValue(mockPipeline)
    } as any;

    it("can save session", async () => {
        const data = "testSession";
        const sut = new SessionStore(mockRedis, "Test Course", "testApp");
        await sut.saveSession("1234", data);

        expect(mockRedis.pipeline).toHaveBeenCalledTimes(1);
        expect(mockPipeline.hset).toHaveBeenCalledTimes(3);
        expect(mockPipeline.hset.mock.calls[0][0]).toBe("Test Course:testApp:sessions:time");
        expect(mockPipeline.hset.mock.calls[0][1]).toBe("1234");
        expect(mockPipeline.hset.mock.calls[0][2]).toBe("2022-01-24T17:00:00.000Z");
        expect(mockPipeline.hset.mock.calls[1][0]).toBe("Test Course:testApp:sessions:data");
        expect(mockPipeline.hset.mock.calls[1][1]).toBe("1234");
        expect(mockPipeline.hset.mock.calls[1][2]).toBe("testSession");
        expect(mockPipeline.hset.mock.calls[2][0]).toBe("Test Course:testApp:sessions:hash");
        expect(mockPipeline.hset.mock.calls[2][1]).toBe("1234");
        expect(mockPipeline.hset.mock.calls[2][2]).toBe(md5("testSession"));
        expect(mockPipeline.exec).toHaveBeenCalledTimes(1);
    });

    it("can get session metadata", async () => {
        const sut = new SessionStore(mockRedis, "Test Course", "testApp");
        const result = await sut.getSessionsMetadata(["1234", "5678"]);
        expect(result).toStrictEqual([
            {
                id: "5678",
                time: "5678 value for Test Course:testApp:sessions:time",
                label: "5678 value for Test Course:testApp:sessions:label",
                friendlyId: "5678 value for Test Course:testApp:sessions:friendly"
            },
            {
                id: "1234",
                time: "1234 value for Test Course:testApp:sessions:time",
                label: "1234 value for Test Course:testApp:sessions:label",
                friendlyId: "1234 value for Test Course:testApp:sessions:friendly"
            }
        ]);
    });

    it("filters out session metadata for session ids with no values in db", async () => {
        const mockNullResultRedis = {
            hmget: jest.fn().mockImplementation(async (key: string, ...fields: string[]) => {
                return fields.map(() => null);
            })
        } as any;
        const sut = new SessionStore(mockNullResultRedis, "Test Course", "testApp");
        const result = await sut.getSessionsMetadata(["1234", "5678"]);
        expect(result).toStrictEqual([]);
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

    it("can fetch session", async () => {
        const id = "1234";
        const sut = new SessionStore(mockRedis, "Test Course", "testApp");
        await sut.getSession(id);

        expect(mockRedis.hget).toHaveBeenCalledTimes(1);
        expect(mockRedis.hget.mock.calls[0].length).toBe(2);
        expect(mockRedis.hget.mock.calls[0][0]).toBe("Test Course:testApp:sessions:data");
        expect(mockRedis.hget.mock.calls[0][1]).toBe("1234");
    });

    it("can create friendly id with no collisions", async () => {
        const mockRedis2 = {
            hget: jest.fn(),
            hset: jest.fn(),
            hsetnx: jest.fn().mockReturnValue(1)
        } as any;

        const id = "1234";
        const mockFriendly = jest.fn().mockReturnValue("happy-rabbit");
        const sut = new SessionStore(mockRedis2, "Test Course", "testApp", mockFriendly);
        const friendly = await sut.generateFriendlyId(id);
        expect(friendly).toBe("happy-rabbit");
    });

    it("can create friendly id with collisions", async () => {
        const mockRedis2 = {
            hget: jest.fn(),
            hset: jest.fn(),
            hsetnx: jest.fn().mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValue(1)
        } as any;

        const id = "1234";
        const mockFriendly = jest.fn().mockReturnValueOnce("a").mockReturnValueOnce("b").mockReturnValueOnce("c");
        const sut = new SessionStore(mockRedis2, "Test Course", "testApp", mockFriendly);
        const friendly = await sut.generateFriendlyId(id);
        expect(friendly).toBe("c");
        expect(mockRedis2.hset).toHaveBeenCalledTimes(1);
        expect(mockRedis2.hset.mock.calls[0]).toEqual(["Test Course:testApp:sessions:friendly", "1234", "c"]);
        expect(mockRedis2.hsetnx).toHaveBeenCalledTimes(3);
        expect(mockRedis2.hsetnx.mock.calls[0]).toEqual(["Test Course:testApp:sessions:machine", "a", "1234"]);
        expect(mockRedis2.hsetnx.mock.calls[1]).toEqual(["Test Course:testApp:sessions:machine", "b", "1234"]);
        expect(mockRedis2.hsetnx.mock.calls[2]).toEqual(["Test Course:testApp:sessions:machine", "c", "1234"]);
        expect(mockFriendly).toHaveBeenCalledTimes(3);
    });

    it("can fall back on machine id when there are many collisions", async () => {
        const mockRedis2 = {
            hget: jest.fn(),
            hset: jest.fn(),
            hsetnx: jest.fn().mockReturnValue(0)
        } as any;

        const id = "1234";
        const mockFriendly = jest.fn();
        const sut = new SessionStore(mockRedis2, "Test Course", "testApp", mockFriendly);
        const friendly = await sut.generateFriendlyId(id);
        expect(friendly).toBe("1234");
        expect(mockRedis2.hset).toHaveBeenCalledTimes(2);
        expect(mockRedis2.hsetnx).toHaveBeenCalledTimes(10);
        expect(mockFriendly).toHaveBeenCalledTimes(10);

        expect(mockRedis2.hset).toHaveBeenCalledWith("Test Course:testApp:sessions:friendly", "1234", "1234");
        expect(mockRedis2.hset).toHaveBeenCalledWith("Test Course:testApp:sessions:machine", "1234", "1234");
    });

    it("can return existing friendly id if already set", async () => {
        const mockRedis2 = {
            hget: jest.fn().mockReturnValue("happy-rabbit"),
            hset: jest.fn(),
            hsetnx: jest.fn().mockReturnValue(1)
        } as any;

        const id = "1234";
        const mockFriendly = jest.fn();
        const sut = new SessionStore(mockRedis2, "Test Course", "testApp", mockFriendly);
        const friendly = await sut.generateFriendlyId(id);
        expect(friendly).toBe("happy-rabbit");
        expect(mockRedis2.hget).toHaveBeenCalledTimes(1);
        expect(mockRedis2.hget).toHaveBeenCalledWith("Test Course:testApp:sessions:friendly", "1234");
        expect(mockRedis2.hset).not.toHaveBeenCalled();
        expect(mockRedis2.hsetnx).not.toHaveBeenCalled();
    });

    it("can get session id from friendly id", async () => {
        const sut = new SessionStore(mockRedis, "Test Course", "testApp");
        await sut.getSessionIdFromFriendlyId("large-spider");

        expect(mockRedis.hget).toHaveBeenCalledTimes(1);
        expect(mockRedis.hget.mock.calls[0].length).toBe(2);
        expect(mockRedis.hget.mock.calls[0][0]).toBe("Test Course:testApp:sessions:machine");
        expect(mockRedis.hget.mock.calls[0][1]).toBe("large-spider");
    });
});

describe("generate friendly id", () => {
    it("generates ids", () => {
        const id = friendlyAdjectiveAnimal();
        expect(id).toMatch(/^[a-z]+-[a-z]+$/);
        expect(friendlyAdjectiveAnimal()).not.toEqual(id);
    });

    it("cleans weird ids", () => {
        expect(cleanFriendlyId("Spanish-albatross")).toBe("spanish-albatross");
        expect(cleanFriendlyId("well-to-do-bug")).toBe("welltodo-bug");
    });

    it("generates ids that always match pattern", () => {
        const n = 10000;
        for (let i = 0; i < n; i += 1) {
            expect(friendlyAdjectiveAnimal()).toMatch(/^[a-z]+-[a-z]+$/);
        }
    });
});

describe("SessionStore handles duplicate sessions", () => {
    const mockRedis = (
        savedHmGetValues: Record<string, (string | null)[]>,
        savedHGetValues: Record<string, string> = {}
    ) => {
        return {
            hmget: jest.fn().mockImplementation(async (sessionKey: string) => {
                const key = sessionKey.split(":").slice(-1)[0];
                return savedHmGetValues[key];
            }),
            hget: jest.fn().mockImplementation(async (sessionKey: string, sessionId: string) => {
                return savedHGetValues[sessionId];
            }),
            hset: jest.fn()
        } as any;
    };

    const sessionSavedValues = {
        time: [
            "2023-10-25 11:10:01",
            "2023-10-25 11:10:02",
            "2023-10-25 11:10:03",
            "2023-10-25 11:10:04",
            "2023-10-25 11:10:05"
        ],
        label: [null, null, null, null, null],
        friendly: ["good dog", "bad cat", "devious chaffinch", "happy bat", "sad owl"],
        hash: ["123", "234", "567", "234", "123"]
    };

    it("Filters out earlier duplicate sessions if removeDuplicates is true", async () => {
        const redis = mockRedis(sessionSavedValues);
        const sut = new SessionStore(redis, "Test Course", "testApp");
        const ids = ["abc", "def", "ghi", "jkl", "mno"];
        const result = await sut.getSessionsMetadata(ids, true);
        expect(redis.hmget).toHaveBeenCalledTimes(4);
        const sessionKeyPrefix = "Test Course:testApp:sessions:";
        expect(redis.hmget).toHaveBeenNthCalledWith(1, `${sessionKeyPrefix}time`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(2, `${sessionKeyPrefix}label`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(3, `${sessionKeyPrefix}friendly`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(4, `${sessionKeyPrefix}hash`, ...ids);

        // results should be ordered chrono desc
        expect(result).toStrictEqual([
            {
                id: "mno", time: "2023-10-25 11:10:05", label: null, friendlyId: "sad owl"
            },
            {
                id: "jkl", time: "2023-10-25 11:10:04", label: null, friendlyId: "happy bat"
            },
            {
                id: "ghi", time: "2023-10-25 11:10:03", label: null, friendlyId: "devious chaffinch"
            }
        ]);
    });

    it("Does not filter out earlier duplicate sessions if removeDuplicates is false", async () => {
        const redis = mockRedis(sessionSavedValues);
        const sut = new SessionStore(redis, "Test Course", "testApp");
        const ids = ["abc", "def", "ghi", "jkl", "mno"];
        const result = await sut.getSessionsMetadata(ids, false);
        expect(redis.hmget).toHaveBeenCalledTimes(4);
        const sessionKeyPrefix = "Test Course:testApp:sessions:";
        expect(redis.hmget).toHaveBeenNthCalledWith(1, `${sessionKeyPrefix}time`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(2, `${sessionKeyPrefix}label`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(3, `${sessionKeyPrefix}friendly`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(4, `${sessionKeyPrefix}hash`, ...ids);

        expect(result).toStrictEqual([
            {
                id: "mno", time: "2023-10-25 11:10:05", label: null, friendlyId: "sad owl"
            },
            {
                id: "jkl", time: "2023-10-25 11:10:04", label: null, friendlyId: "happy bat"
            },
            {
                id: "ghi", time: "2023-10-25 11:10:03", label: null, friendlyId: "devious chaffinch"
            },
            {
                id: "def", time: "2023-10-25 11:10:02", label: null, friendlyId: "bad cat"
            },
            {
                id: "abc", time: "2023-10-25 11:10:01", label: null, friendlyId: "good dog"
            }
        ]);
    });

    it("returns duplicates if they have labels", async () => {
        const savedValues = {
            ...sessionSavedValues,
            label: ["oldest session", null, null, "newer session", null]
        };
        const redis = mockRedis(savedValues);
        const sut = new SessionStore(redis, "Test Course", "testApp");
        const ids = ["abc", "def", "ghi", "jkl", "mno"];
        const result = await sut.getSessionsMetadata(ids, true);

        expect(result).toStrictEqual([
            {
                id: "mno", time: "2023-10-25 11:10:05", label: null, friendlyId: "sad owl"
            },
            {
                id: "jkl", time: "2023-10-25 11:10:04", label: "newer session", friendlyId: "happy bat"
            },
            {
                id: "ghi", time: "2023-10-25 11:10:03", label: null, friendlyId: "devious chaffinch"
            },
            {
                id: "abc", time: "2023-10-25 11:10:01", label: "oldest session", friendlyId: "good dog"
            }
        ]);
    });

    it("if a session has no hash, calculates and saves hash, and applies filter rules", async () => {
        // 2 sessions without hashes, one is a newer and one an older duplicate of another sessions
        const sessionContent1 = "test content 1";
        const sessionContent2 = "test content 2";

        const sessionContent1Hash = md5(sessionContent1);
        const sessionContent2Hash = md5(sessionContent2);

        const savedValues = {
            ...sessionSavedValues,
            hash: [sessionContent1Hash, null, "567", sessionContent2Hash, null]
        };

        const redis = mockRedis(savedValues, { def: sessionContent2, mno: sessionContent1 });
        const sut = new SessionStore(redis, "Test Course", "testApp");
        const ids = ["abc", "def", "ghi", "jkl", "mno"];
        const result = await sut.getSessionsMetadata(ids, true);
        expect(redis.hmget).toHaveBeenCalledTimes(4);
        const sessionKeyPrefix = "Test Course:testApp:sessions:";
        expect(redis.hmget).toHaveBeenNthCalledWith(1, `${sessionKeyPrefix}time`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(2, `${sessionKeyPrefix}label`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(3, `${sessionKeyPrefix}friendly`, ...ids);
        expect(redis.hmget).toHaveBeenNthCalledWith(4, `${sessionKeyPrefix}hash`, ...ids);

        // results should be ordered chrono desc
        expect(result).toStrictEqual([
            {
                id: "mno", time: "2023-10-25 11:10:05", label: null, friendlyId: "sad owl"
            },
            {
                id: "jkl", time: "2023-10-25 11:10:04", label: null, friendlyId: "happy bat"
            },
            {
                id: "ghi", time: "2023-10-25 11:10:03", label: null, friendlyId: "devious chaffinch"
            }
        ]);
    });
});

describe("getSessionStore", () => {
    it("gets session store using request", () => {
        const mockRequest = {
            app: {
                locals: {
                    redis: {},
                    wodinConfig: {
                        savePrefix: "testPrefix"
                    }
                }
            },
            params: {
                appName: "TestApp"
            }
        } as any;
        const store = getSessionStore(mockRequest) as any;
        expect(store._redis).toBe(mockRequest.app.locals.redis);
        expect(store._sessionPrefix).toBe("testPrefix:TestApp:sessions:");
    });
});
