import axios from "axios";
import Redis from "ioredis";

const fullUrl = (url: string) => `http://localhost:3000/${url}`;
const redisUrl = "redis://localhost:6379";

export const post =  async (url: string, body: any) => {
    const headers = {"Content-Type": "application/json"};
    const response = await axios.post(fullUrl(url), body, {headers});
    return response;
};

export const expectRedisValue = async (key: string, field: string, expectedValue: any) => {
    const redis = new Redis(redisUrl);
    const value = await redis.hget(key, field);
    if (expectedValue === null) {
        expect(value).toBe(null);
    } else {
        expect(JSON.parse(value!)).toStrictEqual(expectedValue);
    }
};

export const flushRedis = async () => {
    const redis = new Redis(redisUrl);
    await redis.flushdb();
};
